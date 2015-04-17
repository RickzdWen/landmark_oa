/**
 * Created by Administrator on 2015/4/17.
 */

var OrderModel = require(ROOT_PATH + '/models/OrderModel');
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
        OrderModel.getInstance().addNewOne(orderData).then(function(res){
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
    return delay.promise;
};

function constructOrderData(uid, data, carts, type) {
    if (!data || !carts) {
        throw new CommonError('', 500002);
    }

    var total = carts.totalPrice;
    var amount = +data.amount;
    var shipping = +data.shipping_fee;
    if (!carts.list || !carts.length || amount != (total + shipping)) {
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
        state : util.getStateName(data.state, data.country),
        city : data.city,
        street : data.street,
        zip : data.zip,
        first_name : data.first_name,
        last_name : data.last_name,
        cart_snapshot : JSON.stringify(carts)
    };
    var list = carts.list;
    var items = list.map(function(item){
        return {
            quantity : item.qty,
            name : item.desc,
            price : item.price_s,
            currency : data.currency || 'USD'
        }
    });
    var transaction = {
        amount : amount,
        description : 'Landmark Shop Payment',
        item_list : items
    };
    var paypalData = {
        transaction : transaction,
        method : paymentType[type]
    };
    return {
        orderData : orderData,
        paypalData : paypalData
    };
}
