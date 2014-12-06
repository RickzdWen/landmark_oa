/**
 * Created by Administrator on 2014/12/6.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var ProductDisplayModel = declare([lmBase], {
    table : 'product_display',

    createById : function(id) {
        if (!id) {
            throw new CommonError('', 50002);
        }
        var moment = require('moment');
        return this.create({
            id : id,
            created : moment().format('YYYY-MM-DD HH:mm:ss')
        });
    },

    getDescById : function(id, type, name) {
        if (!id || !name) {
            throw new CommonError('', 50002);
        }
        var selector = [name + '_us', name + '_cn', name + '_hk'].join(',');
        if (type) {
            selector = name + '_' + type;
        }
        return this.getOne('id=?', [id], selector);
    },

    updateDescById : function(id, type, name, value) {
        if (!id || !type || !name) {
            throw new CommonError('', 50002);
        }
        var data = {};
        data[name + '_' + type] = value;
        return this.update(data, 'id=?', [id]);
    }
});

ProductDisplayModel.getInstance = function() {
    _instance = _instance || new ProductDisplayModel();
    return _instance;
};

module.exports = ProductDisplayModel;
