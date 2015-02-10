/**
 * Created by zhangyun on 14-10-20.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var ModelBase = require('./ModelBase');
var moment = require('moment');

module.exports = declare([ModelBase], {
    rdb : 'landmark_r',
    wdb : 'landmark_w',

    addNewOne : function(data) {
        data = data || {};
        data.created = moment().format('YYYY-MM-DD HH:mm:ss');
        return this.create(data);
    },

    replaceNewOne : function(data) {
        data = data || {};
        data.created = moment().format('YYYY-MM-DD HH:mm:ss');
        return this.replace(data);
    }
});

