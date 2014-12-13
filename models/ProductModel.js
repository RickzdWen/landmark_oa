/**
 * Created by zhangyun on 14-10-20.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var ProductModel = declare([lmBase], {
    table : 'product',

    addNewProduct : function(data) {
        data = data || {};
        if (!data.name_us || !data.name_cn || !data.name_hk) {
            throw new CommonError('', 50002);
        }
        var moment = require('moment');
        data.created = moment().format('YYYY-MM-DD HH:mm:ss');
        return this.create(data);
    },

    getAllExistProduct : function() {
        return this.getAll('deleted=?', [0]);
    },

    getNumberByCategory : function() {
        return this._getNumberByOneKey('cid');
    },

    getNumberByBrand : function() {
        return this._getNumberByOneKey('bid');
    },

    _getNumberByOneKey : function(key) {
        var defered = q.defer();
        this.getAll('deleted=? GROUP BY ' + key, [0], 'COUNT(*) AS count,' + key).then(function(rows){
            rows = rows || [];
            var ret = {};
            for (var i = 0, len = rows.length; i < len; ++i) {
                var item = rows[i];
                if (item[key]) {
                    ret[item[key]] = item.count;
                }
            }
            defered.resolve(ret);
        }, function(err){
            defered.reject(err);
        });
        return defered.promise;
    },

    removeCategoryByCid : function(cid) {
        return this._removeRefId('cid', cid);
    },

    removeBrandByBid : function(bid) {
        return this._removeRefId('bid', bid);
    },

    _removeRefId : function(key, value) {
        if (!value) {
            throw  new CommonError('', 50002);
        }
        var data = {};
        data[key] = 0;
        return this.update(data, key + '=?', [value]);
    },

    deleteById : function(id) {
        if (!id) {
            throw new CommonError('', 50002);
        }
        return this.update({
            deleted : 1
        }, 'id=?', [id]);
    },

    updateById : function(data, id) {
        data = data || {};
        if (!data.name_us || !data.name_cn || !data.name_hk) {
            throw new CommonError('', 50002);
        }
        return this.update(data, 'id=?', [id]);
    },

    updateDisplayDesc : function(id, name, type, value) {
        if (!id || !type || !name) {
            throw new CommonError('', 50002);
        }
        var data = {};
        data[name + '_' + type] = value;
        return this.update(data, 'id=?', [id]);
    },

    getAllMap : function() {
        var defered = require('q').defer();
        var self = this;
        this.getAllExistProduct().then(function(rows){
            defered.resolve(self.getMap(rows, 'id'));
        }, function(err){
            defered.reject(err);
        });
        return defered.promise;
    }
});

ProductModel.getInstance = function() {
    _instance = _instance || new ProductModel();
    return _instance;
};

module.exports = ProductModel;
