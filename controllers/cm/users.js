/**
 * Created by Administrator on 2014/12/8.
 */

var express = require('express');
var router = express.Router();
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');
var UserModel = require(ROOT_PATH + '/models/UserModel');

router.get('/', function(req, res, next){
    try {
        res._view = 'cm/users';
        res.doc = {
            category : 'cm',
            nav : 'customers',
            title : 'Customers'
        };
        var page = req.query.page || 1;
        UserModel.getInstance().getByPage('1<>2',[], '*', page).then(function(ret){
            res.doc.users = ret.result || [];
            res.doc.pager = ret.pager;
            res.doc.pagerJson = JSON.stringify(ret.pager);
            res.render(res._view, res);
        }, function(err){
            next(err);
        });
    } catch (err){
        next(err);
    }
});

module.exports = router;
