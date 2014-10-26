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

router.post('/category', function(req, res, next){
    try {
        var data = constructData(req);
        ProductCategoryModel.getInstance().addNewCategory(data).then(function(ret){
            res.json(ret);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.post('/update-category', function(req, res, next){
    try {
        var id = req.body.id;
        if (!id) {
            throw new CommonError('', 50002);
        }
        var data = constructData(req);
        ProductCategoryModel.getInstance().updateById(data, id).then(function(ret){
            res.json({code:0});
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.post('/delete-category', function(req, res, next){
    try {
        var id = req.body.id;
        if (!id) {
            throw new CommonError('', 50002);
        }
        var q = require('q');
        q.all([
            ProductCategoryModel.getInstance().deleteById(id),
            ProductModel.getInstance().removeCategoryByCid(id)
        ]).then(function(result){
            res.json(result);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

function constructData(req) {
    var data = {};
    data.name_us = req.body.name_us;
    data.name_cn = req.body.name_cn;
    data.name_hk = req.body.name_hk;
    data.remark = req.body.remark;
    return data;
}

module.exports = router;
