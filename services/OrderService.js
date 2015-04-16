/**
 * Created by Administrator on 2015/4/17.
 */

var OrderModel = require(ROOT_PATH + '/models/OrderModel');
var PaypalService = require(ROOT_PATH + '/services/PaypalService');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

exports.placePaypalOrder = function(data, carts) {

};

function constructOrderData(data, carts) {
    if (!data || !carts) {
        throw new CommonError('', 500002);
    }

    var total = carts.totalPrice;
    var amount = +data.amount;
    var shipping = +data.shipping_fee;
    if (amount != (total + shipping)) {
        throw new CommonError('', 500002);
    }
}
