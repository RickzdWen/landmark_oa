/**
 * Created by Administrator on 2015/4/17.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var OrderModel = declare([lmBase], {
    table : 'order'
});

OrderModel.getInstance = function() {
    _instance = _instance || new OrderModel();
    return _instance;
};

module.exports = OrderModel;
