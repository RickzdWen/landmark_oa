/**
 * Created by Administrator on 2015/1/29.
 */

var UserModel = require(ROOT_PATH + '/models/UserModel');
var moment = require('moment');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

exports.register = function(data){
    if (!data.nick || !data.passwd || !data.email) {
        throw new CommonError('', 500002);
    }
    var delay = q.defer();
    var crypto = require('ctypto');
    UserModel.getInstance().checkEmailExist(data.email).then(function(exist){
        if (exist) {
            throw new CommonError('', 52001);
        } else {
            crypto.randomBytes(6, function(ex, buf){
                if (ex) {
                    delay.reject(ex);
                } else {
                    var salt = buf.toString('hex');
                    var pwd = data.passwd + salt;
                    var hash = crypto.createHash('md5');
                    data.passwd = hash.digest(pwd);
                    data.salt = salt;
                    UserModel.getInstance().addNewOne(data).then(function(ret){
                        delay.resolve(ret);
                    }, function(err){
                        delay.reject(err);
                    });
                }
            });
        }
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};
