/**
 * Created by Windows7 on 2015/2/10.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var q = require('q');
var moment = require('moment');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var WishListModel = declare([lmBase], {
    table : 'cart'
});

WishListModel.getInstance = function() {
    _instance = _instance || new WishListModel();
    return _instance;
};

module.exports = WishListModel;
