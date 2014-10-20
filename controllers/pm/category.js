/**
 * Created by zhangyun on 14-10-20.
 */

var express = require('express');
var router = express.Router();
var ProductCategoryModel = require(ROOT_PATH + '/models/ProductCategoryModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.get('/categories', function(req, res, next){
    try {
        ProductCategoryModel.getInstance().getByPage().then(function(ret){
            res.json(ret);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
