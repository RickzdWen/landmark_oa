/**
 * Created by Administrator on 2015/2/14.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var WebsiteInfoModel = declare([lmBase], {
    table : 'website_info',

    writeSafetyDesc : function(content, lang) {
        return this._write('safety', content, lang);
    },

    getSafetyDesc : function(lang) {
        return this._read('safety', lang);
    },

    writeAboutDesc : function(content, lang) {
        return this._write('about', content, lang);
    },

    getAboutDesc : function(lang) {
        return this._read('about', lang);
    },

    writePrivacyDesc : function(content, lang) {
        return this._write('privacy', content, lang);
    },

    getPrivacyDesc : function(lang) {
        return this._read('privacy', lang);
    },

    _write : function(key, content, lang) {
        if (!lang || !key) {
            throw new CommonError('', 50002);
        }
        return this.replace({
            info_key : key + '_' + lang,
            content : content
        });
    },

    _read : function(key, lang) {
        if (!lang || !key) {
            throw new CommonError('', 50002);
        }
        var q = require('q');
        var delay = q.defer();
        this.getOne('info_key=?', [key + '_' + lang]).then(function(row){
            row = row || {};
            delay.resolve(row.content || '');
        }, function(err){
            delay.reject(err);
        });
        return delay.promise;
    }
});

WebsiteInfoModel.getInstance = function() {
    _instance = _instance || new WebsiteInfoModel();
    return _instance;
};

module.exports = WebsiteInfoModel;
