/**
 * Created by Administrator on 2014/12/8.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var UserModel = declare([lmBase], {
    table : 'user'
});

UserModel.getInstance = function() {
    _instance = _instance || new UserModel();
    return _instance;
};

module.exports = UserModel;