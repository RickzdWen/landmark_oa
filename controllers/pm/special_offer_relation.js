/**
 * Created by Administrator on 2014/12/14.
 */

var express = require('express');
var router = express.Router();
var SalesProductRelationModel = require(ROOT_PATH + '/models/SalesProductRelationModel');
var ProductService = require(ROOT_PATH + '/services/ProductService');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

router.post('/', function(req, res, next){
    try {
        var data = constructFormData(req);
        SalesProductRelationModel.getInstance().addNewRelation(data).then(function(){
            ProductService.calculateOPrice(data.sid).then(function(){
                res.json({code : 0});
            }, function(err){
                next(err);
            });
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/:sid/:pid', function(req, res, next){
    try {
        var sid = req.params.sid;
        var pid = req.params.pid;
        SalesProductRelationModel.getInstance().delete('sid=? AND pid=?', [sid, pid]).then(function(){
            ProductService.calculateOPrice(sid).then(function(){
                res.json({code : 0});
            }, function(err){
                next(err);
            });
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

function constructFormData(req) {
    var data = {};
    data.sid = req.body.sid;
    data.pid = req.body.pid;
    data.qty = req.body.qty;
    return data;
}

module.exports = router;
