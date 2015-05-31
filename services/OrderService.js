/**
 * Created by Administrator on 2015/4/17.
 */

var OrderModel = require(ROOT_PATH + '/models/OrderModel');
var CartModel = require(ROOT_PATH + '/models/CartModel');
var PaypalService = require(ROOT_PATH + '/services/PaypalService');
var util = require(ROOT_PATH + '/libs/util');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');
var PaymentType = require(ROOT_PATH + '/enum/PaymentType');
var OrderStatus = require(ROOT_PATH + '/enum/OrderStatus');

var paymentType = {
    0 : 'paypal'
};

exports.placePaypalOrder = function(uid, data, carts) {
    var ret = constructOrderData(uid, data, carts, 0);
    var orderData = ret.orderData;
    var q = require('q');
    var delay = q.defer();
    PaypalService.createPayment(ret.paypalData).then(function(payment){
        orderData.pay_id = payment.id;
        OrderModel.getInstance().addNewOne(orderData).then(function(res){
            var idArrays = carts.list.map(function(item){
                return item.id;
            });
            CartModel.getInstance().deleteByCartIds(uid, idArrays).then(function(){
                delay.resolve({
                    orderId : res.insertId,
                    payment : payment
                });
            }, function(err){
                delay.reject(err);
            });
        }, function(err){
            delay.reject(err);
        });
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};

exports.executePaypalPayment = function(uid, payerId, paymentId) {
    var q = require('q');
    var delay = q.defer();
    q.all([
        OrderModel.getInstance().getOrderByUidAndPaymentId(uid, paymentId),
        PaypalService.lookupPayment(paymentId)
    ]).then(function(resArray){
        var order = resArray[0];
        var paymentInfo = resArray[1];
        if (!order) {
            throw new CommonError('', 53001);
        }
        if (paymentInfo.state != 'approved') {
            throw new CommonError('', 54001);
        }
        var carts = JSON.parse(order.cart_snapshot);
        var transaction = getTransactionByCarts(carts, order.amount, order.shipping_fee);
        PaypalService.executePayment(payerId, paymentId, transaction).then(function(payment){
            OrderModel.getInstance().updateStatus(order.id, OrderStatus.PAYMENT).then(function(){
                delay.resolve(payment);
            }, function(err){
                delay.reject(err);
            });
        }, function(err){
            delay.reject(err);
        });
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};

exports.getOrdersByUid = function(uid, page) {
    if (!uid) {
        throw new CommonError('', 50002);
    }
    var q = require('q');
    var numeral = require('numeral');
    var moment = require('moment');
    var delay = q.defer();
    OrderModel.getInstance().getByPage('uid=? ORDER BY created DESC', [uid], '*, UNIX_TIMESTAMP(created) AS created_at', page).then(function(res){
        res.result.forEach(function(item){
            item.cart_snapshot = JSON.parse(item.cart_snapshot);
            item.amount_s = numeral(item.amount).format('0,0.00');
            item.created_time = moment.unix(item.created_at).format('YYYY-MM-DD HH:mm:ss');
        });
        delay.resolve(res);
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};

exports.getOrderDetail = function(id, uid) {
    if (!id || !uid) {
        throw new CommonError('', 50002);
    }
    var numeral = require('numeral');
    var q = require('q');
    var delay = q.defer();
    OrderModel.getInstance().getOne('id = ? AND uid =?', [id, uid]).then(function(order){
        if (!order) {
            throw new CommonError('', 54002);
        }
        order.carts = JSON.parse(order.cart_snapshot);
        order.address = {
            country : order.country,
            state : order.state,
            city : order.city,
            street : order.street,
            zip : order.zip,
            first_name : order.first_name,
            last_name : order.last_name,
            phone : order.phone
        };
        if (order.status < OrderStatus.EXPRESS) {
            order.address.country_short = util.getCountryShortName(order.country);
            order.address.state_short = util.getStateShortName(order.state, order.address.country_short);
        }
        order.amount_s = numeral(order.amount).format('0,0.00');
        order.shipping_fee_s = numeral(order.shipping_fee).format('0,0.00');
        delay.resolve(order);
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};

exports.modifyOrderAddress = function(uid, id, data) {
    if (!uid || !id || !data) {
        throw new CommonError('', 50002);
    }
    var addressInfo = {
        country : util.getCountryName(data.country),
        state : util.getStateName(data.state, data.state_short, data.country),
        city : data.city,
        street : data.street,
        zip : data.zip,
        first_name : data.first_name,
        last_name : data.last_name,
        phone : data.phone
    };
    return OrderModel.getInstance().update(addressInfo, 'id = ? AND uid = ? AND status < 2', [id, uid]);
};

exports.confirmReceive = function(uid, id) {
    if (!uid || !id) {
        throw new CommonError('', 50002);
    }
    return OrderModel.getInstance().update({
        status : 3
    }, 'id = ? AND uid =? AND status > 0 AND status < 3', [id, uid]);
};

exports.applyPaypalRefund = function(uid, id, reason) {
    if (!uid || !id || !reason) {
        throw new CommonError('', 50002);
    }
    return OrderModel.getInstance().update({
        status : 5,
        refund_reason : reason
    }, 'id=? AND uid=? AND (status=1 OR status=5)', [id, uid]);
};

exports.cancelPaypalRefund = function(uid, id) {
    if (!uid || !id) {
        throw new CommonError('', 50002);
    }
    return OrderModel.getInstance().update({
        status : 1,
        refund_reason : ''
    }, 'id=? AND uid=? AND status=5', [id, uid]);
};

exports.modifyRefundReason = function(uid, id, reason) {
    if (!uid || !id || !reason) {
        throw new CommonError('', 50002);
    }
    return OrderModel.getInstance().update({
        refund_reason : reason
    }, 'id=? AND uid=? AND status=5', [id, uid]);
};

function constructOrderData(uid, data, carts, type) {
    if (!data || !carts) {
        throw new CommonError('', 50002);
    }

    var total = carts.totalPrice;
    var amount = +data.amount;
    var shipping = +data.shipping_fee;
    if (!carts.list || !carts.list.length || amount != (+total + shipping)) {
        throw new CommonError('', 500002);
    }
    var orderData = {
        uid : uid,
        payment_type : type,
        express_type : data.express_type,
        shipping_fee : data.shipping_fee,
        subtotal : total,
        amount : data.amount,
        country : util.getCountryName(data.country),
        state : util.getStateName(data.state, data.state_short, data.country),
        city : data.city,
        street : data.street,
        zip : data.zip,
        first_name : data.first_name,
        last_name : data.last_name,
        phone : data.phone,
        cart_snapshot : JSON.stringify(carts)
    };
    var addressInfo = {
        recipient_name : data.first_name + ' ' + data.last_name,
        type : 'residential',
        line1 : data.street,
        country_code : data.country,
        city : data.city,
        state : data.state_short || data.state,
        phone : data.phone,
        postal_code : data.zip
    };
    var transaction = getTransactionByCarts(carts, data.amount, data.shipping_fee, addressInfo);
    var paypalData = {
        transaction : transaction,
        method : paymentType[type]
    };
    return {
        orderData : orderData,
        paypalData : paypalData
    };
}

function getTransactionByCarts(carts, amount, shipping, addressInfo) {
    var list = carts.list;
    var items = list.map(function(item){
        return {
            quantity : item.qty,
            name : item.desc,
            price : item.price_s,
            currency : 'USD'
        };
    });
    var transaction = {
        amount : {
            total : amount,
            currency : 'USD',
            details : {
                shipping : shipping,
                subtotal : carts.totalPrice
            }
        },
        description : 'Landmark Shop Payment $' + amount,
        item_list : {
            items : items,
            shipping_address : addressInfo
        }
    };
    return transaction;
}
