/**
 * Created by zhangyun on 14-10-20.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');
var moment = require('moment');

var _instance = null;

var ProductCategoryModel = declare([lmBase], {
    table : 'product_category',

    addNewCategory : function(data) {
        data = data || {};
        if (!data.name_us || !data.name_cn || !data.name_hk) {
            throw new CommonError('', 50002);
        }
        data.created = moment().format('YYYY-MM-DD HH:mm:ss');
        return this.create(data);
    },

    updateById : function(data, id) {
        data = data || {};
        if (!data.name_us || !data.name_cn || !data.name_hk) {
            throw new CommonError('', 50002);
        }
        return this.update(data, 'id=?', [id]);
    },

    deleteById : function(id) {
        if (!id) {
            throw new CommonError('', 50002);
        }
        return this.delete('id=?', [id]);
    },

    getAllMap : function() {
        var defered = require('q').defer();
        var self = this;
        this.getAll().then(function(rows){
            defered.resolve(self.getMap(rows, 'id'));
        }, function(err){
            defered.reject(err);
        });
        return defered.promise;
    }
});

ProductCategoryModel.getInstance = function() {
    _instance = _instance || new ProductCategoryModel();
    return _instance;
};

module.exports = ProductCategoryModel;
