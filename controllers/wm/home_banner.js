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

router.put('/:id', function(req, res, next){
    try {
        var id = req.params.id;
        var data = constructFormData(req);
        delete data.id;
        HomeBannerModel.getInstance().update(data, 'id=?', [id]).then(function(){
            res.json({
                code : 0
            });
        }, function(err) {
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.post('/upload-image/:id', function(req, res, next){
    try {
        var id = req.params.id;
        var fileHandler = require(ROOT_PATH + '/libs/fileHandler');
        var fs = require('fs');
        var targetPath = require(ROOT_PATH + '/configs/commonConfig').HOME_BANNER_IMGS_PATH;
        var exists = fs.existsSync(targetPath);
        if (!exists) {
            fs.mkdirSync(targetPath);
        }
        fs.lstat(targetPath, function(err, stats){
            if (err) {
                next(new CommonError(err));
            } else {
                if (!stats.isDirectory()) {
                    next(new CommonError('', 51004));
                }
                fileHandler.handleImageUpload({
                    targetPath : targetPath,
                    targetName : id
                }, req, res, function(err, target, fields, extension){
                    if (err) {
                        next(err);
                    } else {
                        var version = +new Date();
                        HomeBannerModel.getInstance().update({
                            img_version : version,
                            extension : extension
                        }, 'id=?', [id]).then(function(){
                            res.json({
                                code : 0,
                                img_version : version,
                                extension : extension
                            });
                        }, function(err){
                            next(err);
                        });
                    }
                });
            }
        });
    } catch (err) {
        next(err);
    }
});

function constructFormData(req) {
    var extend = require('extend');
    var data = extend({}, req.body);
    delete data.created;
    delete data.updated;
    if (typeof data.display !== 'undefined') {
        data.display = data.display ? 1 : 0;
    }
    if (typeof data.open_new !== 'undefined') {
        data.open_new = data.open_new ? 1 : 0;
    }
    return data;
}

module.exports = router;
