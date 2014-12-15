/**
 * Created by Administrator on 2014/12/15.
 */

var declare = require(ROOT_PATH + '/libs/declare');
var lmBase = require('./LandmarkBase');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var _instance = null;

var HomeBannerModel = declare([lmBase], {
    table : 'home_banner',

    getAllBannersByLocale : function(locale) {
        if (!locale) {
            throw new CommonError('', 50002);
        }
        return this.getAll('locale=?', [locale]);
    },

    getAllDisplayedBanners : function(locale) {
        var sql = 'display=?';
        var cond = [1];
        if (locale) {
            sql += ' AND locale=?';
            cond.push(locale);
        }
        return this.getAll(sql, cond);
    },

    createOneWithTime : function (data) {
        data = data || {};
        if (!data.locale) {
            throw new CommonError('', 50002);
        }
        return this.inherited(arguments);
    }
});

HomeBannerModel.getInstance = function() {
    _instance = _instance || new HomeBannerModel();
    return _instance;
};

module.exports = HomeBannerModel;
