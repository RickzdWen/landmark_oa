/**
 * Created by Windows7 on 2015/2/14.
 */

var express = require('express');
var router = express.Router();
var WebsiteInfoModel = require(ROOT_PATH + '/models/WebsiteInfoModel');

router.get('/', function(req, res, next){
    try {
        res._view = 'wm/about';
        res.doc = {
            category : 'wm',
            nav : 'privacy',
            title : 'Privacy Policy'
        };
        var tmp = ['privacy_us', 'privacy_cn', 'privacy_hk'];
        WebsiteInfoModel.getInstance().getAll('info_key IN (\'' + tmp.join('\',\'') + '\')').then(function(rows){
            var privacy = {};
            rows = rows || [];
            rows.forEach(function(item){
                privacy[item.info_key] = item.content;
            });
            res.doc.privacy = privacy;
            res.render('wm/privacy', res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:locale', function(req, res, next){
    try {
        res._view = 'wm/privacy_desc';
        var locale = req.params.locale;
        res.doc = {
            category : 'wm',
            nav : 'privacy',
            locale : locale
        };
        if (locale == 'us') {
            res.doc.title = 'Edit English Description';
        } else if (locale == 'cn') {
            res.doc.title = 'Edit Simple Chinese Description';
        } else if (locale == 'hk') {
            res.doc.title = 'Edit Traditional Chinese Description';
        }
        WebsiteInfoModel.getInstance().getOne('info_key=?', ['privacy_' + locale]).then(function(row){
            var desc = row && row.content;
            res.doc.desc = desc;
            res.render('wm/privacy_desc', res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.post('/:locale', function(req, res, next){
    try {
        var locale = req.params.locale;
        var content = req.body.content;
        WebsiteInfoModel.getInstance().writePrivacyDesc(content, locale).then(function(){
            res.redirect('/wm/privacy');
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
