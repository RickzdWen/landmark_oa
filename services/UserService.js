/**
 * Created by Administrator on 2015/1/29.
 */

var UserModel = require(ROOT_PATH + '/models/UserModel');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

exports.register = function(data){
    if (!data.nick || !data.passwd || !data.email) {
        throw new CommonError('', 50002);
    }
    var delay = q.defer();
    var crypto = require('crypto');
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
                    hash.update(pwd);
                    data.passwd = hash.digest('hex');
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

exports.login = function(data) {
    if (!data.email || !data.passwd) {
        throw new CommonError('', 50002);
    }
    var delay = q.defer();
    var crypto = require('crypto');
    UserModel.getInstance().getOne('email=?', [data.email]).then(function(user){
        if (!user) {
            delay.reject(new CommonError('', 52002));
        } else {
            var pwd = data.passwd + user.salt;
            var hash = crypto.createHash('md5');
            hash.update(pwd);
            pwd = hash.digest('hex');
            if (pwd !== user.passwd) {
                delay.reject(new CommonError('', 52002));
            } else {
                delay.resolve(user);
            }
        }
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};
