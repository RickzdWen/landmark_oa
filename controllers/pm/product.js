/**
 * Created by Administrator on 2014/10/31.
 */

var express = require('express');
var router = express.Router();
var ProductCategoryModel = require(ROOT_PATH + '/models/ProductCategoryModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.get('/', function(req, res, next){
    try {
        res.doc = {
            category : 'pm',
            nav : 'product_add',
            title : 'Add New Product'
        };
        res._view = 'pm/product_add';
        ProductCategoryModel.getInstance().getAll().then(function(rows){
            res.doc.categories = rows;
            res.render(res._view, res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.post('/', function(req, res, next){
    try {
        var data = constructProductData(req);
        ProductModel.getInstance().addNewProduct(data).then(function(ret){
            res.doc = ret;
            res.json(res.doc);
        }, function(err){
            next(err);
        })
    } catch (err) {
        next(err);
    }
});

router.get('/:id', function(req, res, next){
    try {
        var id = req.params.id;
        res._view = 'pm/product';
        res.doc = {
            category : 'pm',
            nav : 'products'
        };
        var q = require('q');
        q.all([
            ProductModel.getInstance().getOne('id=?', [id]),
            ProductCategoryModel.getInstance().getAllMap()
        ]).then(function(retArray){
            var product = retArray[0];
            if (!product) {
                throw new CommonError('', 50004);
            }
            var categories = retArray[1];
            var cat = categories[product.cid];
            if (cat) {
                product.category_us = cat.name_us;
                product.category_cn = cat.name_cn;
                product.category_hk = cat.name_hk;
            }
            res.doc.product = product;
            res.doc.productJson = JSON.stringify(product);
            res.doc.categories = categories;
            res.doc.title = product.name_us;
            res.render(res._view, res);
        }, function(err){
            next(err);
        })
    } catch (err) {
        next(err);
    }
});

router.put('/:id', function(req, res, next){
    try {
        var id = req.params.id;
        var data = constructProductData(req);
        ProductModel.getInstance().updateById(data, id).then(function(ret){
            res.doc = ret;
            res.json(res.doc);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', function(req, res, next){
    try {
        var id = req.params.id;
        ProductModel.getInstance().deleteById(id).then(function(){
            res.json({});
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

function constructProductData(req) {
    var data = {};
    data.name_us = req.body.name_us;
    data.name_cn = req.body.name_cn;
    data.name_hk = req.body.name_hk;
    data.cid = req.body.cid || '';
    data.remark = req.body.remark || '';
    return data;
}

module.exports = router;