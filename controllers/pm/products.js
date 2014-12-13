/**
 * Created by rick on 2014/10/31.
 */

var express = require('express');
var router = express.Router();
var ProductCategoryModel = require(ROOT_PATH + '/models/ProductCategoryModel');
var BrandModel = require(ROOT_PATH + '/models/BrandModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.get('/', function(req, res, next){
    try {
        var page = req.query.page || 1;
//        var size = req.query.size || 20;
        var of = req.query.of;
        var name = req.query.name || '';
        var cid = req.query.cid || '';
        var bid = req.query.bid || '';
        if (!of) {
            res._view = 'pm/products';
        }
        var sql = 'deleted=0';
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
        if (bid && bid !== '0') {
            sql += ' AND bid=?';
            cond.push(bid);
        }
        res.doc = {
            category : 'pm',
            nav : 'products',
            title : 'Products'
        };
        var search = {
            name : name,
            cid : cid,
            bid : bid
        };
        var q = require('q');
        q.all([
            ProductModel.getInstance().getByPage(sql, cond, '*', page, 20),
            ProductCategoryModel.getInstance().getAllMap(),
            BrandModel.getInstance().getAllMap()
        ]).then(function(resArray){
            var pRet = resArray[0];
            var list = pRet.result || [];
            var categories = resArray[1];
            var brands = resArray[2];
            for (var i = 0, len = list.length; i < len; ++i) {
                var item = list[i];
                var cItem = item.cid && categories[item.cid];
                if (cItem) {
                    item.category_us = cItem.name_us;
                    item.category_cn = cItem.name_cn;
                    item.category_hk = cItem.name_hk;
                }
                var bItem = item.bid && brands[item.bid];
                if (bItem) {
                    item.brand_us = bItem.name_us;
                    item.brand_cn = bItem.name_cn;
                    item.brand_hk = bItem.name_hk;
                }
                item.price = +(item.price / 1000).toFixed(2);
            }
            res.doc.products = pRet;
            res.doc.categories = categories;
            res.doc.brands = brands;
            search.categoryName = cid && categories[cid].name_us;
            search.brandName = bid && brands[bid].name_us;
            res.doc.search = search;
            if (res._view) {
                res.doc.productsJson = JSON.stringify(pRet);
                res.doc.searchJson = JSON.stringify(search);
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
