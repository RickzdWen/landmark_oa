/**
 * Created by rick on 2014/12/12.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');
var moment = require('moment');

var _instance = null;

var SalesProductModel = declare([lmBase], {
    table : 'sales_product',

    addNewOne : function(data) {
        data = data || {};
        data.created = moment().format('YYYY-MM-DD HH:mm:ss');
        return this.create(data);
    }
});

SalesProductModel.getInstance = function() {
    _instance = _instance || new SalesProductModel();
    return _instance;
};

module.exports = SalesProductModel;
