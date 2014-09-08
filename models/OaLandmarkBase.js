/**
 * Created by zhangyun on 14-9-8.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var ModelBase = require('./ModelBase');

module.exports = declare([ModelBase], {
    rdb : 'oa_landmark_r',
    wdb : 'oa_landmark_w'
});
