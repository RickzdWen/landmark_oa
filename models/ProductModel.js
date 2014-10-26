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

    getNumberByCategory : function() {
        var defered = q.defer();
        this.getAll('GROUP BY cid', [], 'COUNT(*) AS count,cid').then(function(rows){
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
        return defered;
    },

    removeCategoryByCid : function(cid) {
        if (!cid) {
            throw  new CommonError('', 50002);
        }
        return this.update({
            cid : 0
        }, 'cid=?', [cid]);
    }
});

ProductModel.getInstance = function() {
    _instance = _instance || new ProductModel();
    return _instance;
};

module.exports = ProductModel;
