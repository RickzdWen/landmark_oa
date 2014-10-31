/**
 * Created by rick on 2014/10/31.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.redirect('/pm/categories');
});

module.exports = router;
