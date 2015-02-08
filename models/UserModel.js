/**
 * Created by Administrator on 2014/12/8.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var q = require('q');
var moment = require('moment');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var UserModel = declare([lmBase], {
    table : 'user',

    checkEmailExist : function(email) {
        if (!email) {
            throw new CommonError('', 500002);
        }
        var delay = q.defer();
        this.getOne('email=?', [email]).then(function(row){
            if (row) {
                delay.resolve(row);
            } else {
                delay.resolve(false);
            }
        }, function(err){
            delay.reject(err);
        });
        return delay.promise;
    }
});

UserModel.getInstance = function() {
    _instance = _instance || new UserModel();
    return _instance;
};

module.exports = UserModel;