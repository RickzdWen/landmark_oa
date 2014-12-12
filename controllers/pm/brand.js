/**
 * Created by Administrator on 2014/12/13.
 */

var express = require('express');
var router = express.Router();
var BrandModel = require(ROOT_PATH + '/models/BrandModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.post('/', function(req, res, next){
    try {
        var data = constructData(req);
        BrandModel.getInstance().addNewBrand(data).then(function(ret){
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
        BrandModel.getInstance().updateById(data, id).then(function(ret){
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
            BrandModel.getInstance().deleteById(id),
            ProductModel.getInstance().removeBrandByBid(id)
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
    data.country = req.body.country;
    data.remark = req.body.remark;
    return data;
}

module.exports = router;
