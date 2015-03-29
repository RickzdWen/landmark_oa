/**
 * Created by Administrator on 2015/3/29.
 */

var AddressModel = require(ROOT_PATH + '/models/AddressModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

exports.getCurrentUsedAddress = function(uid) {
    return AddressModel.getInstance().getOneAddressByUid(uid);
};
