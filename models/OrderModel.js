/**
 * Created by Administrator on 2015/4/17.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require(ROOT_PATH + '/models/LandmarkBase');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var OrderModel = declare([lmBase], {
    table : '`order`',

    getOrderByUidAndPaymentId : function(uid, paymentId) {
        return this.getOne('uid=? AND pay_id=?', [uid, paymentId]);
    },

    updateStatus : function(id, status) {
        if (!id) {
            throw new CommonError('', 50002);
        }
        return this.update({
            status : status
        }, 'id=?', [id]);
    }
});

OrderModel.getInstance = function() {
    _instance = _instance || new OrderModel();
    return _instance;
};

module.exports = OrderModel;
