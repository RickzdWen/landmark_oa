/**
 * Created by Administrator on 2015/2/14.
 */

var express = require('express');
var router = express.Router();
var WebsiteInfoModel = require(ROOT_PATH + '/models/WebsiteInfoModel');

router.get('/', function(req, res, next){
    try {
        res._view = 'wm/safety';
        res.doc = {
            category : 'wm',
            nav : 'safety',
            title : 'Safety Description'
        };
        var tmp = ['safety_us', 'safety_cn', 'safety_hk'];
        WebsiteInfoModel.getInstance().getAll('info_key IN (\'' + tmp.join('\',\'') + '\')').then(function(rows){
            var safety = {};
            rows = rows || [];
            rows.forEach(function(item){
                safety[item.info_key] = item.content;
            });
            res.doc.safety = safety;
            res.render('wm/safety', res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:locale', function(req, res, next){
    try {
        res._view = 'wm/safety_desc';
        var locale = req.params.locale;
        res.doc = {
            category : 'wm',
            nav : 'safety',
            title : 'Safety Description',
            locale : locale
        };
        if (locale == 'us') {
            res.doc.title = 'Edit English Safety Description';
        } else if (locale == 'cn') {
            res.doc.title = 'Edit Simple Chinese Safety Description';
        } else if (locale == 'hk') {
            res.doc.title = 'Edit Traditional Chinese Safety Description';
        }
        WebsiteInfoModel.getInstance().getOne('info_key=?', ['safety_' + locale]).then(function(row){
            var desc = row && row.content;
            res.doc.desc = desc;
            res.render('wm/safety_desc', res);
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
        WebsiteInfoModel.getInstance().writeSafetyDesc(content, locale).then(function(){
            res.redirect('/wm/safety');
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
