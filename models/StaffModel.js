/**
 * Created by zhangyun on 14-9-8.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var oaBase = require('./OaLandmarkBase');
var q = require('q');

var _instance = null;

var StaffModel = declare([oaBase], {
    table : 'staff',

    getLoginInfo : function(nick, pwd) {
        var delay = q.defer();
        this.getOne('nick=?', [nick], '*').then(function(row){
            if (row && row.pwd === pwd) {
                delay.resolve(row);
            } else {
                var err = new Error('Nick or Password not correct!');
                err.code = 50001;
                delay.reject(err);
            }
        }, function(err){
            delay.reject(err);
        });
        return delay.promise;
    }
});

StaffModel.getInstance = function() {
    _instance = _instance || new StaffModel();
    return _instance;
};

module.exports = StaffModel;
