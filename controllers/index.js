/**
 * Created by zhangyun on 14-8-23.
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    console.log('index!!');
    res._view = 'index';
    res.doc = {
        title : 'my app',
        author : 'rick'
    };
    res.render(res._view, res.doc);
    res.end();
});

module.exports = router;
