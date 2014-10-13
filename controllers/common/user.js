/**
 * Created by Administrator on 2014/10/12.
 */

var express = require('express');
var router = express.Router();

router.get('/logout', function(req, res, next){
    try {
        res.doc = {code : 0};
        res.clearCookie('auth', {
            path : '/'
        });
        if (req.query.of != 'json') {
            res.redirect('/');
        } else {
            res.json(res.doc);
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
