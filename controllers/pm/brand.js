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

router.get('/:id', function(req, res, next){
    try {
        var id = req.params.id;
        res._view = 'pm/brand';
        res.doc = {
            category : 'pm',
            nav : 'brands',
            title : 'Brand Description'
        };
        BrandModel.getInstance().getOne('id=?', [id]).then(function(brand){
            if (!brand) {
                throw new CommonError('', 60000);
            }
            res.doc.brand = brand;
            res.render(res._view, res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.get('/desc/:id/:locale', function(req, res, next){
    try {
        res._view = 'pm/brand_desc';
        var id = req.params.id;
        var locale = req.params.locale;
        res.doc = {
            category : 'pm',
            nav : 'brands',
            locale : locale
        };
        if (locale == 'us') {
            res.doc.title = 'Edit English Description';
        } else if (locale == 'cn') {
            res.doc.title = 'Edit Simple Chinese Description';
        } else if (locale == 'hk') {
            res.doc.title = 'Edit Traditional Chinese Description';
        }
        BrandModel.getInstance().getOne('id=?', [id]).then(function(brand){
            var desc = brand && brand['desc_' + locale];
            res.doc.title += ' for ' + brand.name_us;
            res.doc.desc = desc;
            res.doc.brand = brand;
            res.render(res._view, res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.post('/desc/:id/:locale', function(req, res, next){
    try {
        var id = req.params.id;
        var locale = req.params.locale;
        var desc = req.body.content;
        var data = {};
        data['desc_' + locale] = desc;
        BrandModel.getInstance().update(data, 'id=?', [id]).then(function(){
            res.redirect('/pm/brand/' + id);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
