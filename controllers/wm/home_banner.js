/**
 * Created by Administrator on 2014/12/16.
 */

var express = require('express');
var router = express.Router();
var HomeBannerModel = require(ROOT_PATH + '/models/HomeBannerModel');

router.post('/', function(req, res, next){
    try {
        var data = constructFormData(req);
        HomeBannerModel.getInstance().createOneWithTime(data).then(function(ret){
            res.json({
                code : 0,
                result : ret
            });
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

function constructFormData(req) {
    var data = req.body || {};
    data.display = data.display ? 1 : 0;
    return data;
}

module.exports = router;
