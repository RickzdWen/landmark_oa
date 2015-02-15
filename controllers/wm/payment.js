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
            nav : 'payment',
            title : 'Payment Policy'
        };
        var tmp = ['payment_us', 'payment_cn', 'payment_hk'];
        WebsiteInfoModel.getInstance().getAll('info_key IN (\'' + tmp.join('\',\'') + '\')').then(function(rows){
            var payment = {};
            rows = rows || [];
            rows.forEach(function(item){
                payment[item.info_key] = item.content;
            });
            res.doc.payment = payment;
            res.render('wm/payment', res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:locale', function(req, res, next){
    try {
        res._view = 'wm/payment_desc';
        var locale = req.params.locale;
        res.doc = {
            category : 'wm',
            nav : 'payment',
            locale : locale
        };
        if (locale == 'us') {
            res.doc.title = 'Edit English Description';
        } else if (locale == 'cn') {
            res.doc.title = 'Edit Simple Chinese Description';
        } else if (locale == 'hk') {
            res.doc.title = 'Edit Traditional Chinese Description';
        }
        WebsiteInfoModel.getInstance().getOne('info_key=?', ['payment_' + locale]).then(function(row){
            var desc = row && row.content;
            res.doc.desc = desc;
            res.render('wm/payment_desc', res);
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
        WebsiteInfoModel.getInstance().writePaymentDesc(content, locale).then(function(){
            res.redirect('/wm/payment');
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
