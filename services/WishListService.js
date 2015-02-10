/**
 * Created by Windows7 on 2015/2/10.
 */

var WishListModel = require(ROOT_PATH + '/models/WishListModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var SalesProductModel = require(ROOT_PATH + '/models/SalesProductModel');
var q = require('q');
var numeral = require('numeral');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

exports.getListNum = function(uid) {
    if (!uid) {
        throw new CommonError('', 50002);
    }
    var delay = q.defer();
    WishListModel.getInstance().getOne('uid=?', [uid], 'COUNT(*) AS total').then(function(row){
        delay.resolve((row && row.total) || 0);
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};

exports.addToWishList = function(uid, sid, pid) {
    if (!uid || !sid) {
        throw new CommonError('', 50002);
    }
    var delay = q.defer();
    WishListModel.getInstance().replaceNewOne({
        uid : uid,
        sid : sid,
        pid : pid || ''
    }).then(function(){
        delay.resolve();
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};

exports.listByPage = function(uid) {

};
