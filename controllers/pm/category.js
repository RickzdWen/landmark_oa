/**
 * Created by zhangyun on 14-10-20.
 */

var express = require('express');
var router = express.Router();
var ProductCategoryModel = require(ROOT_PATH + '/models/ProductCategoryModel');
var pager = require(ROOT_PATH + '/libs/pager');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.get('/categories', function(req, res, next){
    try {
        var page = req.query.page || 1;
        var of = req.query.of || '';
        if (!of) {
            res._view = 'pm/categories';
        }
        ProductCategoryModel.getInstance().getByPage(page).then(function(ret){
            var pageInfo = pager.getPagerInfo(ret.page);
            ret.pageInfo = pageInfo;
            res.doc = ret;
            if (res._view) {
                res.render(res._view, res);
            } else {
                res.json(res.doc);
            }
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
