/**
 * Created by Administrator on 2015/2/8.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require(ROOT_PATH + '/models/LandmarkBase');
var q = require('q');
var moment = require('moment');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var CartModel = declare([lmBase], {
    table : 'cart',

    deleteBySid : function(sid) {
        if (!sid) {
            throw new CommonError('', 50002);
        }
        return this.update({
            deleted : 1
        }, 'sid=? AND deleted=?', [sid, 0]);
    },

    deleteByCartIds : function(uid, idArray) {
        if (!uid || !idArray || !idArray.length) {
            throw new CommonError('', 50002);
        }
        var sql = 'uid=? AND id IN(\'' + idArray.join('\',\'') + '\')';
        return this.update({
            deleted : 1
        }, sql, [uid]);
    }
});

CartModel.getInstance = function() {
    _instance = _instance || new CartModel();
    return _instance;
};

module.exports = CartModel;
