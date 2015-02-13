/**
 * Created by Administrator on 2014/10/31.
 */

var express = require('express');
var router = express.Router();
var ProductCategoryModel = require(ROOT_PATH + '/models/ProductCategoryModel');
var BrandModel = require(ROOT_PATH + '/models/BrandModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var SalesProductModel = require(ROOT_PATH + '/models/SalesProductModel');
var SalesProductRelationModel = require(ROOT_PATH + '/models/SalesProductRelationModel');
var ProductService = require(ROOT_PATH + '/services/ProductService');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.get('/', function(req, res, next){
    try {
        res.doc = {
            category : 'pm',
            nav : 'product_add',
            title : 'Add New Product'
        };
        res._view = 'pm/product_add';
        var q = require('q');
        q.all([
            ProductCategoryModel.getInstance().getAll(),
            BrandModel.getInstance().getAll()
        ]).then(function(retArray){
            res.doc.categories = retArray[0];
            res.doc.brands = retArray[1];
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
        SalesProductModel.getInstance().addNewOne({
            discount : 100
        }).then(function(sret){
            data.sid = sret.insertId;
            ProductModel.getInstance().addNewProduct(data).then(function(pret){
                SalesProductRelationModel.getInstance().addNewRelation({
                    pid : pret.insertId,
                    sid : sret.insertId,
                    qty : 1
                }).finally(function(){
                    res.doc = pret;
                    res.json(res.doc);
                });
            }, function(err){
                next(err);
            });
        }, function(err){
            next(err);
        });
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
            ProductCategoryModel.getInstance().getAllMap(),
            BrandModel.getInstance().getAllMap()
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

            var brands = retArray[2];
            var brand = brands[product.bid];
            if (brand) {
                product.brand_us = brand.name_us;
                product.brand_cn = brand.name_cn;
                product.brand_hk = brand.name_hk;
            }
            product.price = +(product.price / 1000).toFixed(2);
            res.doc.product = product;
            res.doc.productJson = JSON.stringify(product);
            res.doc.categories = categories;
            res.doc.brands = brands;
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
            ProductService.calculateRelatedSpecialOffersOPrice(id).then(function(){
                res.json(res.doc);
            }, function(err){
                next(err);
            });
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
        ProductService.deleteProductById(id).then(function(){
            res.json({});
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:id/display_:name/:type', function(req, res, next){
    try {
        var id = req.params.id;
        var name = req.params.name;
        var type = req.params.type;
        var util = require(ROOT_PATH + '/libs/util');
        var lang = util.getLangDesc(type);
        res._view = 'pm/display_edit';
        var nameForTitle = name == 'parameters' ? 'Supplement Facts' : name.charAt(0).toUpperCase() + name.slice(1);
        res.doc = {
            category : 'pm',
            nav : 'products',
            title : 'Edit ' + lang + ' ' + nameForTitle,
            name : name,
            type : type
        };
        ProductModel.getInstance().getOne('id=?', [id]).then(function(product){
            if (!product) {
                throw new CommonError('', 50004);
            }
            res.doc.product = product;
            res.doc.title += ' for ' + product['name_' + type];
            res.doc.desc = product[name + '_' + type] || '';
            res.render(res._view, res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.post('/:id/display_:name/:type', function(req, res, next){
    var id = req.params.id;
    var name = req.params.name;
    var type = req.params.type;
    var content = req.body.content;
    ProductModel.getInstance().updateDisplayDesc(id, name, type, content).then(function(){
        res.redirect('/pm/product/' + id);
    }, function(err){
        next(err);
    });
});

router.post('/upload-image/:id', function(req, res, next){
    var id = req.params.id;
    var fileHandler = require(ROOT_PATH + '/libs/fileHandler');
    var fs = require('fs');
    var targetPath = ROOT_PATH + '/public/images/products';
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
                    ProductModel.getInstance().update({
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

router.post('/upload-cert/:id', function(req, res, next){
    var id = req.params.id;
    var fileHandler = require(ROOT_PATH + '/libs/fileHandler');
    var fs = require('fs');
    var targetPath = ROOT_PATH + '/public/images/products';
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
                targetName : 'cert_' + id,
                extension : /jpg/i
            }, req, res, function(err, target, fields){
                if (err) {
                    next(err);
                } else {
                    var version = +new Date();
                    ProductModel.getInstance().update({
                        cimg_version : version
                    }, 'id=?', [id]).then(function(){
                        res.json({
                            code : 0,
                            cimg_version : version
                        });
                    }, function(err){
                        next(err);
                    });
                }
            });
        }
    });
});

router.delete('/cert-img/:id', function(req, res, next){
    var id = req.params.id;
    ProductModel.getInstance().update({
        cimg_version : ''
    }, 'id=?', [id]).then(function(){
        res.json({
            code : 0
        });
    }, function(err){
        next(err);
    });
});

router.put('/published/:id', function(req, res, next){
    try {
        var id = req.params.id;
        var published = req.body.published ? 1 : 0;
        ProductModel.getInstance().update({
            published : published
        }, 'id=?', id).then(function(){
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
    data.name_us = req.body.name_us;
    data.name_cn = req.body.name_cn;
    data.name_hk = req.body.name_hk;
    data.cid = req.body.cid || '';
    data.bid = req.body.bid || '';
    data.remark = req.body.remark || '';
    data.infinity_flag = req.body.infinity_flag ? 1 : 0;
    data.price = +((req.body.price || 0) * 1000).toFixed(0);
    return data;
}

module.exports = router;