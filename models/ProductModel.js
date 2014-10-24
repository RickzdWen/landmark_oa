/**
 * Created by zhangyun on 14-10-20.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var ProductModel = declare([lmBase], {
    table : 'product'
});

ProductModel.getInstance = function() {
    _instance = _instance || new ProductModel();
    return _instance;
};

module.exports = ProductModel;
