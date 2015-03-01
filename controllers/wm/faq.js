/**
 * Created by Administrator on 2015/3/1.
 */

var express = require('express');
var router = express.Router();
var FaqModel = require(ROOT_PATH + '/models/FaqModel');

router.get('/', function(req, res, next){
    try {
        res._view = 'wm/faq_list';
        res.doc = {
            category : 'wm',
            nav : 'faq',
            title : 'FAQ'
        };
        FaqModel.getInstance().getAll('1<>2', [], 'id, question_us, published').then(function(list){
            list = list || [];
            res.doc.listJson = JSON.stringify(list);
            res.render(res._view, res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.get('/add', function(req, res, next){
    try {
        res._view = 'wm/faq_add';
        res.doc = {
            category : 'wm',
            nav : 'faq',
            title : 'Add FAQ'
        };
        res.render(res._view, res);
    } catch (err) {
        next(err);
    }
});

router.post('/add', function(req, res, next){
    try {
        FaqModel.getInstance().addNewOne(req.body).then(function(){
            res.redirect('/wm/faq');
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:id', function(req, res, next){
    try {
        res._view = 'wm/faq_edit';
        res.doc = {
            category : 'wm',
            nav : 'faq',
            title : 'Edit FAQ'
        };
        FaqModel.getInstance().getOne('id=?', [req.params.id]).then(function(row){
            res.doc.faq = row;
            res.render(res._view, res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.post('/:id', function(req, res, next){
    try {
        FaqModel.getInstance().update(req.body, 'id=?', [req.params.id]).then(function(){
            res.redirect('/wm/faq');
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.put('/published/:id', function(req, res, next){
    try {
        FaqModel.getInstance().update({
            published : req.body.published ? 1 : 0
        }, 'id=?', [req.params.id]).then(function(){
            res.json({});
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', function(req, res, next){
    try {
        FaqModel.getInstance().delete('id=?', [req.params.id]).then(function(){
            res.json({});
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
