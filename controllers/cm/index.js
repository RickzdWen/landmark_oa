/**
 * Created by Administrator on 2014/12/8.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.redirect('/cm/users');
});

module.exports = router;
