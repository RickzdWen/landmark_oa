/**
 * Created by Administrator on 2015/2/8.
 */

var CartModel = require(ROOT_PATH + '/models/CartModel');
var ProductModel = require('../models/ProductModel');
var SalesProductModel = require('../models/SalesProductModel');
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
        if (!rows.length) {
            delay.resolve(rows);
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
                var totalPrice = 0;
                rows.forEach(function(item){
                    constructCartDetail(item, pMap, sMap, lang);
                    totalPrice += +item.price * item.qty;
                });
                var nTotal = numeral(totalPrice);
                totalPrice = nTotal.format('0.00');
                var totalPrice_s = nTotal.format('0,0.00');
                delay.resolve({
                    list : rows,
                    totalPrice : totalPrice,
                    totalPrice_s : totalPrice_s
                });
            }, function(err){
                delay.reject(err);
            });
        }
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};

function constructCartDetail(item, pMap, sMap, lang) {
    if (item.pid) {
        var p = pMap[item.pid] || {};
        item.desc = p['name_' + lang];
        var nprice = numeral(p.price / 1000);
        item.price = nprice.format('0.00');
        item.price_s = nprice.format('0,0.00');
        item.img_version = p.img_version;
    } else {
        var s = sMap[item.sid] || {};
        item.desc = s['title_' + lang];
        var nprice = numeral(s.price / 1000);
        item.price = nprice.format('0.00');
        item.price_s = nprice.format('0,0.00');
        item.oprice = numeral(s.oprice / 1000).format('0.00');
        item.img_version = s.img_version;
    }
    var nTotal = numeral(+item.qty * +item.price);
    item.total = nTotal.format('0.00');
    item.total_s = nTotal.format('0,0.00');
}

exports.removeCartItem = function(id) {
    if (!id) {
        throw new CommonError('', 50002);
    }
    return CartModel.getInstance().update({
        deleted : 1
    }, 'id=?', [id]);
};
