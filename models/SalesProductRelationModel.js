/**
 * Created by rick on 2014/12/12.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');
var moment = require('moment');

var _instance = null;

var SalesProductRelationModel = declare([lmBase], {
    table : 'sales_product_relation',

    addNewRelation : function (data) {
        data = data || {};
        if (!data.sid || !data.pid || !data.qty) {
            throw new CommonError('', 50002);
        }
        data.created = moment().format('YYYY-MM-DD HH:mm:ss');
        return this.create(data);
    },

    updateQty : function (qty, sid, pid) {
        if (!qty || !sid || !pid) {
            throw new CommonError('', 50002);
        }
        return this.update({
            qty : qty
        }, 'sid=? AND pid=?', [sid, pid]);
    },

    getRelationsBySid : function (sid) {
        if (!sid) {
            throw new CommonError('', 50002);
        }
        return this.getAll('sid=?', [sid]);
    }
});

SalesProductRelationModel.getInstance = function() {
    _instance = _instance || new SalesProductRelationModel();
    return _instance;
};

module.exports = SalesProductRelationModel;
