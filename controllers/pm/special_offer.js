/**
 * Created by Administrator on 2014/12/13.
 */

var express = require('express');
var router = express.Router();
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var SalesProductModel = require(ROOT_PATH + '/models/SalesProductModel');
var SalesProductRelationModel = require(ROOT_PATH + '/models/SalesProductRelationModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.get('/', function(req, res, next){
    try {
        res.doc = {
            category : 'pm',
            nav : 'special_offer_add',
            title : 'Add New Special Offer'
        };
        res._view = 'pm/special_offer_add';
        res.render(res._view, res);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', function(req, res, next){
    try {
        res.doc = {
            category : 'pm',
            nav : 'special_offers'
        };
        res._view = 'pm/special_offer';
        var id = req.params.id;
        var q = require('q');
        q.all([
            SalesProductModel.getInstance().getOne('id=?', [id]),
            SalesProductRelationModel.getInstance().getAll('sid=?', [id]),
            ProductModel.getInstance().getAllMap()
        ]).then(function(retArray){
            var offer = retArray[0];
            if (!offer) {
                throw new CommonError('', 50005);
            }
            var relations = retArray[1] || [];
            var products = retArray[2] || {};
            res.doc.title = offer.title_us;
            res.doc.offer = offer;
            res.doc.products = products;
            res.doc.offerJson = JSON.stringify(offer);
            res.doc.relationsJson = JSON.stringify(relations);
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
        SalesProductModel.getInstance().addNewOne(data).then(function(ret){
            ret.code = 0;
            res.json(ret);
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
        SalesProductModel.getInstance().deleteById(id).then(function(){
            res.json({code : 0});
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

function constructProductData(req) {
    var data = {};
    data.title_us = req.body.title_us;
    data.title_cn = req.body.title_cn;
    data.title_hk = req.body.title_hk;
    data.remark = req.body.remark || '';
    data.discount = +(req.body.discount || 0);
    data.discount = +data.discount.toFixed(2);
    data.special_offer = 1;
    return data;
}

module.exports = router;
