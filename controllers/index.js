/**
 * Created by zhangyun on 14-8-23.
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    console.log('index!!');
    res.redirect('/staff/profile');
    res.end();
});

module.exports = router;
