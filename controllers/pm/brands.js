/**
 * Created by Administrator on 2014/12/13.
 */

var express = require('express');
var router = express.Router();
var BrandModel = require(ROOT_PATH + '/models/BrandModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var util = require(ROOT_PATH + '/libs/util');

router.get('/', function(req, res, next){
    try {
        var of = req.query.of || '';
        if (!of) {
            res._view = 'pm/brands';
        }
        res.doc = {
            category : 'pm',
            nav : 'brands',
            title : 'Brand List'
        };
        var q = require('q');
        q.all([
            BrandModel.getInstance().getAll(),
            ProductModel.getInstance().getNumberByBrand()
        ]).then(function(retArray){
            var list = retArray[0] || [];
            var info = retArray[1];
            for (var i = 0, len = list.length; i < len; ++i) {
                var item = list[i];
                item.product_num = info[item.id] || 0;
                item.country_name = (item.country && util.countries[item.country]) || '';
                item.desc_us = item.desc_cn = item.desc_hk = '';
            }
            res.doc.list = list;
            res.doc.countries = util.countries;
            if (res._view) {
                res.doc.listJson = JSON.stringify(list);
                res.render(res._view, res);
            } else {
                res.json(res.doc);
            }
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
