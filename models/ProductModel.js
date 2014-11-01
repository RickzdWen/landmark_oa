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

    getNumberByCategory : function() {
        var defered = q.defer();
        this.getAll('1<>2 GROUP BY cid', [], 'COUNT(*) AS count,cid').then(function(rows){
            rows = rows || [];
            var ret = {};
            for (var i = 0, len = rows.length; i < len; ++i) {
                var item = rows[i];
                if (item.cid) {
                    ret[item.cid] = item.count;
                }
            }
            defered.resolve(ret);
        }, function(err){
            defered.reject(err);
        });
        return defered.promise;
    },

    removeCategoryByCid : function(cid) {
        if (!cid) {
            throw  new CommonError('', 50002);
        }
        return this.update({
            cid : 0
        }, 'cid=?', [cid]);
    },

    deleteById : function(id) {
        if (!id) {
            throw new CommonError('', 50002);
        }
        return this.delete('id=?', [id]);
    },

    updateById : function(data, id) {
        data = data || {};
        if (!data.name_us || !data.name_cn || !data.name_hk) {
            throw new CommonError('', 50002);
        }
        return this.update(data, 'id=?', [id]);
    }
});

ProductModel.getInstance = function() {
    _instance = _instance || new ProductModel();
    return _instance;
};

module.exports = ProductModel;
