/**
 * Created by rick on 2014/10/31.
 */

var express = require('express');
var router = express.Router();
var ProductCategoryModel = require(ROOT_PATH + '/models/ProductCategoryModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.get('/', function(req, res, next){
    try {
        var page = req.query.page || 1;
        var of = req.query.of;
        var name = req.query.name;
        var cid = req.query.cid;
        if (!of) {
            res._view = 'pm/products';
        }
        var sql = '1<>2';
        var cond = [];
        if (name) {
            sql += ' AND (name_us LIKE ? OR name_hk LIKE ? OR name_cn LIKE ?)';
            for (var i = 0; i < 3; ++i) {
                cond.push(['%', name, '%'].join(''));
            }
        }
        if (cid && cid !== '0') {
            sql += ' AND cid=?';
            cond.push(cid);
        }
        res.doc = {
            category : 'pm',
            nav : 'products',
            title : 'Products'
        };
        var q = require('q');
        q.all([
            ProductModel.getInstance().getByPage(sql, cond, '*', page),
            ProductCategoryModel.getInstance().getAllMap()
        ]).then(function(resArray){
            var pRet = resArray[0];
            var list = pRet.result || [];
            var categories = resArray[1];
            for (var i = 0, len = list.length; i < len; ++i) {
                var item = list[i];
                var cItem = categories[item.id];
                if (cItem) {
                    item.category_us = cItem.name_us;
                    item.category_cn = cItem.name_cn;
                    item.category_hk = cItem.name_hk;
                }
            }
            res.doc.products = pRet;
            if (res._view) {
                res.render(res._view, res);
            } else {
                res.json(res.doc);
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
