/**
 * Created by Administrator on 2015/3/29.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var AddressModel = declare([lmBase], {
    table : 'address',

    getOneAddressByUid : function(uid) {
        if (!uid) {
            throw new CommonError('', 50002);
        }
        return this.getOne('uid=?', [uid]);
    }
});

AddressModel.getInstance = function() {
    _instance = _instance || new AddressModel();
    return _instance;
};

module.exports = AddressModel;
