/**
 * Created by Administrator on 2015/4/17.
 */

var OrderModel = require(ROOT_PATH + '/models/OrderModel');
var CartModel = require(ROOT_PATH + '/models/CartModel');
var PaypalService = require(ROOT_PATH + '/services/PaypalService');
var util = require(ROOT_PATH + '/libs/util');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

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
        console.log(orderData);
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
            OrderModel.getInstance().updateStatus(order.id, 1).then(function(){
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
