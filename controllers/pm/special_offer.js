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
            SalesProductRelationModel.getInstance().getRelationsBySid(id),
            ProductModel.getInstance().getAllMap()
        ]).then(function(retArray){
            var offer = retArray[0];
            if (!offer) {
                throw new CommonError('', 50005);
            }
            offer.price = +(offer.price / 1000).toFixed(2);
            var relations = retArray[1] || [];
            var products = retArray[2] || {};
            for (var i = 0, len = relations.length; i < len; ++i) {
                var item = relations[i];
                var product = products[item.pid];
                if (product) {
                    item.product_name = product.name_us;
                    item.price = product.price;
                }
            }
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
        var data = constructOfferData(req);
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

router.put('/:id', function(req, res, next){
    try {
        var id = req.params.id;
        var data = constructOfferData(req);
        if (!data.title_us || !data.title_cn || !data.title_hk || !(data.discount+'') || isNaN(data.discount)) {
            throw new CommonError('', 50002);
        }
        SalesProductModel.getInstance().update(data, 'id=?', id).then(function(ret){
            res.json({code : 0});
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.put('/published/:id', function(req, res, next){
    try {
        var id = req.params.id;
        var published = req.body.published ? 1 : 0;
        SalesProductModel.getInstance().update({
            published : published
        }, 'id=?', [id]).then(function(){
            res.json({code : 0});
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

router.get('/:id/desc/:type', function(req, res, next){
    try {
        var id = req.params.id;
        var type = req.params.type;
        var util = require(ROOT_PATH + '/libs/util');
        var lang = util.getLangDesc(type);
        res._view = 'pm/desc_edit';
        res.doc = {
            category : 'pm',
            nav : 'special_offers',
            title : 'Edit ' + lang + ' Description',
            name : 'desc',
            type : type
        };
        SalesProductModel.getInstance().getOne('id=?', [id]).then(function(offer){
            if (!offer) {
                throw new CommonError('', 50004);
            }
            res.doc.offer = offer;
            res.doc.title += ' for ' + offer['title_' + type];
            res.doc.desc = offer['desc_' + type] || '';
            res.render(res._view, res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.post('/:id/desc/:type', function(req, res, next){
    try {
        var id = req.params.id;
        var name = 'desc';
        var type = req.params.type;
        var content = req.body.content;
        SalesProductModel.getInstance().updateDesc(id, name, type, content).then(function(){
            res.redirect('/pm/special_offer/' + id);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.post('/upload-image/:id', function(req, res, next){
    var id = req.params.id;
    var fileHandler = require(ROOT_PATH + '/libs/fileHandler');
    var fs = require('fs');
    var targetPath = require(ROOT_PATH + '/configs/commonConfig').SPECIAL_OFFER_IMGS_PATH;
    var exists = fs.existsSync(targetPath);
    if (!exists) {
        fs.mkdirSync(targetPath);
    }
    fs.lstat(targetPath, function(err, stats){
        if (err) {
            next(new CommonError(err));
        } else {
            if (!stats.isDirectory()) {
                next(new CommonError('', 51004));
            }
            fileHandler.handleImageUpload({
                targetPath : targetPath,
                targetName : id,
                extension : /jpg/i
            }, req, res, function(err, target, fields){
                if (err) {
                    next(err);
                } else {
                    var version = +new Date();
                    SalesProductModel.getInstance().update({
                        img_version : version
                    }, 'id=?', [id]).then(function(){
                        res.json({
                            code : 0,
                            img_version : version
                        });
                    }, function(err){
                        next(err);
                    });
                }
            });
        }
    });
});

function constructOfferData(req) {
    var data = {};
    data.title_us = req.body.title_us;
    data.title_cn = req.body.title_cn;
    data.title_hk = req.body.title_hk;
    data.remark = req.body.remark || '';
    data.discount = +(req.body.discount || 0);
    data.discount = +data.discount.toFixed(2);
    data.price = +((req.body.price || 0) * 1000).toFixed(0);
    data.special_offer = 1;
    return data;
}

module.exports = router;
