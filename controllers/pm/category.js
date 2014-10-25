/**
 * Created by zhangyun on 14-10-20.
 */

var express = require('express');
var router = express.Router();
var ProductCategoryModel = require(ROOT_PATH + '/models/ProductCategoryModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
//var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.get('/', function(req, res, next){
    res.redirect('/pm/categories');
});

router.get('/categories', function(req, res, next){
    try {
        var page = req.query.page || 1;
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
                item.productNum = info[item.id] || 0;
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
//        ProductCategoryModel.getInstance().getByPage(page).then(function(ret){
//            var pageInfo = pager.getPagerInfo(ret.page, ret.totalPage);
//            ret.pageInfo = pageInfo;
//            res.doc.categories = ret;
//            if (res._view) {
//                res.render(res._view, res);
//            } else {
//                res.json(res.doc);
//            }
//        }, function(err){
//            next(err);
//        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
