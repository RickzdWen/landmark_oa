/**
 * Created by Administrator on 2014/12/16.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.redirect('/wm/home_banners');
});

module.exports = router;
