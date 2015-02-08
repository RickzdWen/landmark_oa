/**
 * Created by Administrator on 2015/2/8.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var q = require('q');
var moment = require('moment');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var CartModel = declare([lmBase], {
    table : 'cart'
});

CartModel.getInstance = function() {
    _instance = _instance || new CartModel();
    return _instance;
};

module.exports = CartModel;
