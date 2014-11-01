/**
 * Created by zhangyun on 14-10-20.
 */

var express = require('express');
var router = express.Router();
var ProductCategoryModel = require(ROOT_PATH + '/models/ProductCategoryModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.post('/', function(req, res, next){
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

router.put('/:id', function(req, res, next){
    try {
        var id = req.params.id;
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

router.delete('/:id', function(req, res, next){
    try {
        var id = req.params.id;
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
