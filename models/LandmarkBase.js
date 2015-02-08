/**
 * Created by zhangyun on 14-10-20.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var ModelBase = require('./ModelBase');

module.exports = declare([ModelBase], {
    rdb : 'landmark_r',
    wdb : 'landmark_w',

    addNewOne : function(data) {
        var moment = require('moment');
        data = data || {};
        data.created = moment().format('YYYY-MM-DD HH:mm:ss');
        return this.create(data);
    }
});

