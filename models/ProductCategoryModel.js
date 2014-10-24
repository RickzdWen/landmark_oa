/**
 * Created by zhangyun on 14-10-20.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var ProductCategoryModel = declare([lmBase], {
    table : 'product_category'
});

ProductCategoryModel.getInstance = function() {
    _instance = _instance || new ProductCategoryModel();
    return _instance;
};

module.exports = ProductCategoryModel;
