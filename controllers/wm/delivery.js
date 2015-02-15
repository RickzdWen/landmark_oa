/**
 * Created by Administrator on 2015/2/16.
 */

var express = require('express');
var router = express.Router();
var WebsiteInfoModel = require(ROOT_PATH + '/models/WebsiteInfoModel');

router.get('/', function(req, res, next){
    try {
        res._view = 'wm/about';
        res.doc = {
            category : 'wm',
            nav : 'delivery',
            title : 'Delivery & Returns'
        };
        var tmp = ['delivery_us', 'delivery_cn', 'delivery_hk'];
        WebsiteInfoModel.getInstance().getAll('info_key IN (\'' + tmp.join('\',\'') + '\')').then(function(rows){
            var delivery = {};
            rows = rows || [];
            rows.forEach(function(item){
                delivery[item.info_key] = item.content;
            });
            res.doc.delivery = delivery;
            res.render('wm/delivery', res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:locale', function(req, res, next){
    try {
        res._view = 'wm/delivery_desc';
        var locale = req.params.locale;
        res.doc = {
            category : 'wm',
            nav : 'delivery',
            locale : locale
        };
        if (locale == 'us') {
            res.doc.title = 'Edit English Description';
        } else if (locale == 'cn') {
            res.doc.title = 'Edit Simple Chinese Description';
        } else if (locale == 'hk') {
            res.doc.title = 'Edit Traditional Chinese Description';
        }
        WebsiteInfoModel.getInstance().getOne('info_key=?', ['delivery_' + locale]).then(function(row){
            var desc = row && row.content;
            res.doc.desc = desc;
            res.render('wm/delivery_desc', res);
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
        WebsiteInfoModel.getInstance().writeDeliveryDesc(content, locale).then(function(){
            res.redirect('/wm/delivery');
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
