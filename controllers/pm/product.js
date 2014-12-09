/**
 * Created by Administrator on 2014/10/31.
 */

var express = require('express');
var router = express.Router();
var ProductCategoryModel = require(ROOT_PATH + '/models/ProductCategoryModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var ProductDisplayModel = require(ROOT_PATH + '/models/ProductDisplayModel');
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
            ProductCategoryModel.getInstance().getAllMap(),
            ProductDisplayModel.getInstance().getOne('id=?', [id])
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

            var displayInfo = retArray[2];
            res.doc.displayInfo = displayInfo || {};
            if (!displayInfo) {
                ProductDisplayModel.getInstance().createById(id).then(function(){
                    res.render(res._view, res);
                }, function(err){
                    next(err);
                })
            } else {
                res.render(res._view, res);
            }
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

router.get('/:id/display_:name/:type', function(req, res, next){
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
    var q = require('q');
    q.all([
        ProductModel.getInstance().getOne('id=?', [id]),
        ProductDisplayModel.getInstance().getDescById(id, type, name)
    ]).then(function(retArray){
        var product = retArray[0];
        var displayInfo = retArray[1];
        if (!product || !displayInfo) {
            throw new CommonError('', 50004);
        }
        res.doc.product = product;
        res.doc.title += ' for ' + product.name_us;
        res.doc.desc = displayInfo[name + '_' + type] || '';
        res.render(res._view, res);
    }, function(err){
        next(err);
    });
});

router.post('/:id/display_:name/:type', function(req, res, next){
    var id = req.params.id;
    var name = req.params.name;
    var type = req.params.type;
    var content = req.body.content;
    ProductDisplayModel.getInstance().updateDescById(id, type, name, content).then(function(){
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
            console.log('here');
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

function constructProductData(req) {
    var data = {};
    data.name_us = req.body.name_us;
    data.name_cn = req.body.name_cn;
    data.name_hk = req.body.name_hk;
    data.cid = req.body.cid || '';
    data.remark = req.body.remark || '';
    data.infinity_flag = req.body.infinity_flag ? 1 : 0;
    return data;
}

module.exports = router;