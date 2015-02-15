/**
 * Created by Administrator on 2015/2/15.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var ConsultModel = declare([lmBase], {
    table : 'consult'
});

ConsultModel.getInstance = function() {
    _instance = _instance || new ConsultModel();
    return _instance;
};

module.exports = ConsultModel;
