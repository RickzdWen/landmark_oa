/**
 * Created by Windows7 on 2015/6/4.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require(ROOT_PATH + '/models/LandmarkBase');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');
var OrderLogType = require(ROOT_PATH + '/enum/OrderLogType');

var _instance = null;

var OrderLogModel = declare([lmBase], {
    table : '`order_log`',

    log4Frontend : function(order, uid, operateType) {
        if (!order || !uid) {
            throw new CommonError('', 50002);
        }
        return this._log(order, OrderLogType.FRONTEND, operateType, uid);
    },

    log4Backend : function(order, sid, operateType) {
        if (!order || !sid) {
            throw new CommonError('', 50002);
        }
        return this._log(order, OrderLogType.BACKEND, operateType, sid);
    },

    _log : function(order, type, operateType, userId) {
        return this.addNewOne({
            oid : order.id,
            pay_id : order.pay_id,
            payment_type : order.payment_type,
            status : order.status,
            type : type,
            operator : userId,
            operate_type : operateType,
            order_snapshot : JSON.stringify(order)
        });
    }
});

OrderLogModel.getInstance = function() {
    _instance = _instance || new OrderLogModel();
    return _instance;
};

module.exports = OrderLogModel;
