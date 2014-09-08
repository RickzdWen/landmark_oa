/**
 * Created by zhangyun on 14-9-7.
 */

var crypto = require('crypto');

var OA_LOGIN_KEY = '14$#lmp!';

var manager = {

    /**
     * 加密登陆token，登陆之后每次请求都带这个token
     *
     * @param info info应该包括id, nick, ip
     * @param key 秘钥
     */
    encodeLoginToken : function (info, key) {
        // 加上时间和一个md5值
        info.time = +new Date();
        var hash = crypto.createHash('md5');
        hash.update([info.id, info.nick, info.ip, info.time].join('|'));
        info.md5 = hash.digest('hex');

        var plainText = JSON.stringify(info);
        key = key || OA_LOGIN_KEY;
        var cipher = crypto.createCipher('des-ecb', new Buffer(key));
        var tokenChucks = [];
        tokenChucks.push(cipher.update(plainText, 'utf8', 'hex'));
        tokenChucks.push(cipher.final('hex'));
        var token = tokenChucks.join('');
        return token;
    },

    /**
     * 解密登陆token
     *
     * @param token
     * @param key
     */
    decodeLoginToken : function (token, key) {
        key = key || OA_LOGIN_KEY;
        var decipher = crypto.createDecipher('des-ecb', new Buffer(key));
        var plainTexts = [];
        plainTexts.push(decipher.update(token, 'hex', 'utf8'));
        plainTexts.push(decipher.final('utf8'));
        var info = JSON.parse(plainTexts.join('').trim());

        // 解密后校验md5值
        var md5 = info.md5;
        var hash = crypto.createHash('md5');
        hash.update([info.id, info.nick, info.ip, info.time].join('|'));
        var verify = hash.digest('hex');
        if (md5 && verify === md5) {
            return info;
        }
        return null;
    }
};

//var token = manager.encodeLoginToken({
//    ip : '1.1.1.',
//    nick : 'rick',
//    id : 10003
//});
//
//console.log('token == ' + token);
//
//var info = manager.decodeLoginToken(token);
//console.log(info);

module.exports = manager;