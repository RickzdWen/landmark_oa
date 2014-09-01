/**
 * Created by zhangyun on 14-8-23.
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res._view = 'index';
    res.doc = {
        title : 'my app',
        author : 'rick'
    };
    next();
});

module.exports = router;
