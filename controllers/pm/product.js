/**
 * Created by Administrator on 2014/10/31.
 */

var express = require('express');
var router = express.Router();
var ProductCategoryModel = require(ROOT_PATH + '/models/ProductCategoryModel');
var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.get('/products', function(req, res, next){
    try {
        var page = req.query.page || 1;
        var of = req.query.of;
        if (!of) {
            res._view = 'pm/products';
        }
        var q = require('q');
//        q.all([
//            ProductModel.getInstance().getByPage()
//        ])
    } catch (err) {
        next(err);
    }
});

module.exports = router;