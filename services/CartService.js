/**
 * Created by Administrator on 2015/2/8.
 */

var CartModel = require(ROOT_PATH + '/models/CartModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var SalesProductModel = require(ROOT_PATH + '/models/SalesProductModel');
var SalesProductRelationModel = require(ROOT_PATH + '/models/SalesProductRelationModel');
var q = require('q');
var numeral = require('numeral');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

exports.addToCart = function(sid, pid, uid, qty) {
    if (!sid || !uid) {
        throw new CommonError('', 50002);
    }
    var delay = q.defer();
    CartModel.getInstance().getOne('sid=? AND uid=? AND deleted=?', [sid, uid, 0]).then(function(row){
        if (!row) {
            CartModel.getInstance().addNewOne({
                sid : sid,
                uid : uid,
                pid : pid
            }).then(function(ret){
                delay.resolve(ret.insertId);
            }, function(err){
                delay.reject(err);
            })
        } else if (!qty) {
            delay.resolve(row);
        } else {
            CartModel.getInstance().update({
                qty : +qty + +row.qty
            }, 'id=?', [row.id]).then(function(ret){
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

exports.listUserCart = function(uid, lang) {
    if (!uid) {
        throw new CommonError('', 50002);
    }
    var delay = q.defer();
    CartModel.getInstance().getAll('uid=? AND deleted=?', [uid, 0]).then(function(rows){
//        if (!rows.length) {
//            delay.resolve(rows);
//        } else {
//            var pidArray = [];
//            var sidArray = [];
//            rows.forEach(function(item){
//                item.pid && pidArray.push(item.pid);
//                sidArray.push(item.sid);
//            });
//            var delay2 = null;
//            if (pidArray.length) {
//                var sql = 'deleted=? AND published=? AND id IN(\'' + pidArray.join('\',\'') + '\')';
//                delay2 = ProductModel.getInstance().getAll(sql, [0, 1]);
//            } else {
//                delay2 = q.defer();
//                delay2.resolve([]);
//                delay2 = delay2.promise;
//            }
//            var sSql = 'deleted=? AND published=? AND id IN(\'' + sidArray.join('\',\'') + '\')';
//            q.all([
//                delay2,
//                SalesProductModel.getInstance().getAll(sSql, [0, 1])
//            ]).then(function(retArray){
//                var pMap = ProductModel.getInstance().getMap(retArray[0], 'id');
//                var sMap = SalesProductModel.getInstance().getMap(retArray[1], 'id');
//                var totalPrice = 0;
//                rows.forEach(function(item){
//                    constructCartDetail(item, pMap, sMap, lang);
//                    totalPrice += +item.price * item.qty;
//                });
//                var nTotal = numeral(totalPrice);
//                totalPrice = nTotal.format('0.00');
//                var totalPrice_s = nTotal.format('0,0.00');
//                delay.resolve({
//                    list : rows,
//                    totalPrice : totalPrice,
//                    totalPrice_s : totalPrice_s
//                });
//            }, function(err){
//                delay.reject(err);
//            });
//        }
        getInfoFromCartRows(rows, lang, true).then(function(ret){
            delay.resolve(ret);
        }, function(err){
            delay.reject(err);
        });
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};

function getInfoFromCartRows(rows, lang, onlyExists) {
    var delay = q.defer();
    if (!rows || !rows.length) {
        delay.resolve({
            list : [],
            totalPrice : 0,
            totalPrice_s : '0.00'
        });
    } else {
        var sidArray = [];
        rows.forEach(function(item){
            sidArray.push(item.sid);
        });
        var sSql = 'id IN(\'' + sidArray.join('\',\'') + '\')';
        if (onlyExists) {
            sSql += ' AND deleted=? AND published=?';
        }
        q.all([
            SalesProductModel.getInstance().getAll(sSql, [0, 1]),
            SalesProductRelationModel.getInstance().getRelationMapBySids(sidArray)
        ]).then(function(ret){
            var saleRows = ret[0];
            var relRes = ret[1];
            var pidArray = relRes.pidArray;
            var pSql = 'id IN(\'' + pidArray.join('\',\'') + '\')';
            if (onlyExists) {
                pSql += ' AND deleted=? AND published=?';
            }
            ProductModel.getInstance().getAll(pSql, [0, 1]).then(function(pRows){
                var pMap = ProductModel.getInstance().getMap(pRows, 'id');
                var sMap = SalesProductModel.getInstance().getMap(saleRows, 'id');
                var relMap = relRes.map;
                var totalPrice = 0;
                var list = [];
                rows.forEach(function(item){
                    constructCartDetail(item, pMap, sMap, relMap, lang);
                    if (!item.notExist) {
                        list.push(item);
                        totalPrice += +item.price * item.qty;
                    }
                });
                var nTotal = numeral(totalPrice);
                totalPrice = nTotal.format('0.00');
                var totalPrice_s = nTotal.format('0,0.00');
                delay.resolve({
                    list : list,
                    totalPrice : totalPrice,
                    totalPrice_s : totalPrice_s
                });
            }, function(err){
                delay.reject(err);
            });
        }, function(err){
            delay.reject(err);
        });
    }
    return delay.promise;
}

function constructCartDetail(item, pMap, sMap, relMap, lang) {
    if (item.pid && pMap[item.pid]) {
        var p = pMap[item.pid];
        item.desc = p['name_' + lang];
        var nprice = numeral(p.price / 1000);
        item.price = nprice.format('0.00');
        item.price_s = nprice.format('0,0.00');
        item.img_version = p.img_version;
    } else if (sMap[item.sid]) {
        var s = sMap[item.sid];
        item.desc = s['title_' + lang];
        var nprice = numeral(s.price / 1000);
        item.price = nprice.format('0.00');
        item.price_s = nprice.format('0,0.00');
        item.oprice = numeral(s.oprice / 1000).format('0.00');
        item.img_version = s.img_version;
        item.products = [];
        var ps = relMap[item.sid] || [];
        ps.forEach(function(r){
            var p = pMap[r.pid];
            if (p) {
                item.products.push({
                    id : r.pid,
                    name : p['name_' + lang],
                    img_version : p.img_version,
                    qty : +r.qty * + +item.qty,
                    unit : r.qty
                });
            }
        });
    } else {
        item.notExist = true;
        return;
    }
    var nTotal = numeral(+item.qty * +item.price);
    item.total = nTotal.format('0.00');
    item.total_s = nTotal.format('0,0.00');
}

exports.removeCartItem = function(id, uid) {
    if (!id || !uid) {
        throw new CommonError('', 50002);
    }
    return CartModel.getInstance().update({
        deleted : 1
    }, 'id=? AND uid=?', [id, uid]);
};

exports.updateCartQty = function(id, uid, qty) {
    if (!id || !uid || !qty || isNaN(qty) || qty <= 0) {
        throw new CommonError('', 50002);
    }
    return CartModel.getInstance().update({
        qty : qty
    }, 'id=? AND uid=?', [id, uid]);
};
