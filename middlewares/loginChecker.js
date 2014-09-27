/**
 * Created by zhangyun on 14-9-7.
 */

var manager = require(ROOT_PATH + '/libs/tokenManager');

exports.checkOaLogin = function () {
    return function(req, res, next) {
        if (!/^\/login($|\/.*)/.test(req.path)) {
            var token = req.cookies.auth;
            var info = token && manager.decodeLoginToken(token);
            if (!info) {
                res.redirect('/login?ref=' + req.url);
                res.end();
            } else {
                res.logon = info;
                next();
            }
        } else {
            next();
        }
    };
}
