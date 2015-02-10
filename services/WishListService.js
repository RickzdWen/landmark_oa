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

exports.listByPage = function(uid, page, lang) {
    if (!uid) {
        throw new CommonError('', 50002);
    }
    page = page || 1;
    var delay = q.defer();
    WishListModel.getInstance().getByPage('uid=?', [uid], '*', page).then(function(ret){
        var list = ret.result;
        if (!list.length) {
            delay.resolve(ret);
        } else {
            var pidArray = [];
            var sidArray = [];
            rows.forEach(function(item){
                item.pid && pidArray.push(item.pid);
                sidArray.push(item.sid);
            });
            var delay2 = null;
            if (pidArray.length) {
                var sql = 'deleted=? AND published=? AND id IN(\'' + pidArray.join('\',\'') + '\')';
                delay2 = ProductModel.getInstance().getAll(sql, [0, 1]);
            } else {
                delay2 = q.defer();
                delay2.resolve([]);
                delay2 = delay2.promise;
            }
            var sSql = 'deleted=? AND published=? AND id IN(\'' + sidArray.join('\',\'') + '\')';
            q.all([
                delay2,
                SalesProductModel.getInstance().getAll(sSql, [0, 1])
            ]).then(function(retArray){
                var pMap = ProductModel.getInstance().getMap(retArray[0], 'id');
                var sMap = SalesProductModel.getInstance().getMap(retArray[1], 'id');
                list.forEach(function(item){
                    constructWishItemDetail(item, pMap, sMap, lang);
                });
                ret.result = list;
                delay.resolve(ret);
            }, function(err){
                delay.reject(err);
            });
        }
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};

function constructWishItemDetail(item, pMap, sMap, lang) {
    if (item.pid) {
        var p = pMap[item.pid] || {};
        item.name = p['name_' + lang];
        var nprice = numeral(p.price / 1000);
        item.price = nprice.format('0.00');
        item.price_s = nprice.format('0,0.00');
        item.img_version = p.img_version;
    } else {
        var s = sMap[item.sid] || {};
        item.name = s['title_' + lang];
        var nprice = numeral(s.price / 1000);
        item.price = nprice.format('0.00');
        item.price_s = nprice.format('0,0.00');
        item.oprice = numeral(s.oprice / 1000).format('0.00');
        item.img_version = s.img_version;
    }
    return item;
}
