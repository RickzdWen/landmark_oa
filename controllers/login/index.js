/**
 * Created by zhangyun on 14-9-7.
 */

var express = require('express');
var router = express.Router();
var StaffModel = require(ROOT_PATH + '/models/StaffModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.get('/', function(req, res, next){
    try {
        res._view = 'login/index';
        res.doc = {};
        res.doc.ref = req.params.ref || '/';
        res.render(res._view, res.doc);
    } catch (e) {
        next(e);
    }
});

router.post('/', function(req, res, next){
    var nick = req.body.nick;
    var pwd = req.body.pwd;
    var remember = req.body.remember;
    if (!nick || !pwd) {
        next(new CommonError('Parameter Error', 50002));
        return;
    }
    var staff = StaffModel.getInstance();
    staff.getLoginInfo(nick, pwd).then(function(info){
        var manager = require(ROOT_PATH + '/libs/tokenManager');
        var token = manager.encodeLoginToken({
            id : info.id,
            nick : info.nick,
            ip : req.ip
        });
        var cookieOpt = {
            path : '/'
        };
        if (remember) {
            cookieOpt.maxAge = 30 * 24 * 60 * 60 * 1000;
        }
        res.cookie('auth', token, cookieOpt);
        res.json({});
    }, function(err){
        next(err);
    });
});

module.exports = router;