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
        if (!lang) {
            throw new CommonError('', 50002);
        }
        return this.replace({
            info_key : 'safety_' + lang,
            content : content
        });
    },

    getSafetyDesc : function(lang) {
        if (!lang) {
            throw new CommonError('', 50002);
        }
        var q = require('q');
        var delay = q.defer();
        this.getOne('info_key=?', ['safety_' + lang]).then(function(row){
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
