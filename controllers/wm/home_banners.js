/**
 * Created by Administrator on 2014/12/16.
 */

var express = require('express');
var router = express.Router();
var HomeBannerModel = require(ROOT_PATH + '/models/HomeBannerModel');

router.get('/', function(req, res, next){
    try {
        if (req.query.of != 'json') {
            res._view = 'wm/home_banners';
            res.doc = {
                category : 'wm',
                nav : 'home_banners',
                title : 'Home Banners'
            };
            res.render(res._view, res);
        } else {
            HomeBannerModel.getInstance().getAll().then(function(rows){
                res.json({
                    code : 0,
                    list : rows || []
                });
            }, function(err){
                next(err);
            });
        }
    } catch (err) {
        next(err);
    }
});

router.get('/:locale', function(req, res, next){
    try {
        var locale = req.params.locale;
        HomeBannerModel.getInstance().getAllBannersByLocale(locale).then(function(rows){
            res.json({
                list : rows || []
            });
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
