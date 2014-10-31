/**
 * Created by rick on 2014/10/31.
 */

var express = require('express');
var router = express.Router();
var ProductCategoryModel = require(ROOT_PATH + '/models/ProductCategoryModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');

router.get('/', function(req, res, next){
    try {
        var of = req.query.of || '';
        if (!of) {
            res._view = 'pm/categories';
        }
        res.doc = {
            category : 'pm',
            nav : 'categories',
            title : 'Product Categories'
        };
        var q = require('q');
        q.all([
            ProductCategoryModel.getInstance().getAll(),
            ProductModel.getInstance().getNumberByCategory()
        ]).then(function(retArray){
            var list = retArray[0] || [];
            var info = retArray[1];
            for (var i = 0, len = list.length; i < len; ++i) {
                var item = list[i];
                item.product_num = info[item.id] || 0;
            }
            res.doc.list = list;
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
