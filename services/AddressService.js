/**
 * Created by Administrator on 2015/3/29.
 */

var AddressModel = require(ROOT_PATH + '/models/AddressModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

exports.getCurrentUsedAddress = function(uid) {
    return AddressModel.getInstance().getOneAddressByUid(uid);
};

exports.updateCurrentUsedAddress = function(data, uid, id) {
    if (!uid) {
        throw new CommonError('', 50002);
    }
    data = data || {};
    if (id) {
        return AddressModel.getInstance().update(data, 'id=? AND uid=?', [id, uid]);
    } else {
        data.uid = uid;
        return AddressModel.getInstance().addNewOne(data);
    }
};
