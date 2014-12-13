/**
 * Created by Administrator on 2014/12/13.
 */

var express = require('express');
var router = express.Router();
var SalesProductModel = require(ROOT_PATH + '/models/SalesProductModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.get('/', function(req, res, next){
    try {
        res.doc = {
            category : 'pm',
            nav : 'special_offers',
            title : 'Special Offers'
        };
        res._view = 'pm/special_offers';
        SalesProductModel.getInstance().getAllExistSpecialOffers().then(function(rows){
            rows = rows || [];
            res.doc.list = rows;
            res.doc.listJson = JSON.stringify(rows);
            res.render(res._view, res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
