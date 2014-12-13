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
    },

    getAllExistSpecialOffers : function() {
        return this.getAll('special_offer=? AND deleted=?', [1, 0]);
    },

    deleteById : function(id) {
        if (!id) {
            throw new CommonError('', 50002);
        }
        return this.update({
            deleted : 1
        }, 'id=?', [id]);
    }
});

SalesProductModel.getInstance = function() {
    _instance = _instance || new SalesProductModel();
    return _instance;
};

module.exports = SalesProductModel;
