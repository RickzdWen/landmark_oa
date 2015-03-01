/**
 * Created by Administrator on 2015/3/1.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');

var _instance = null;

var FaqModel = declare([lmBase], {
    table : 'faq'
});

FaqModel.getInstance = function() {
    _instance = _instance || new FaqModel();
    return _instance;
};

module.exports = FaqModel;
