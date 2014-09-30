/**
 * Created by zhangyun on 14-9-10.
 */

var express = require('express');
var router = express.Router();
var StaffModel = require(ROOT_PATH + '/models/StaffModel');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

var profileCtrl = function(req, res, next){
    res._view = 'staff/profile';
    res.doc = {
        category : 'staff',
        nav : 'profile',
        title : 'Staff Profile'
    };
    StaffModel.getInstance().getStaffById(res.logon.id).then(function(row){
        row && (delete row.pwd);
        res.doc.staff = row;
        res.render(res._view, res);
    }, function(err){
        next(err);
    });
};

router.get('/', profileCtrl);
router.get('/profile', profileCtrl);

/**
 * 上传个人头像
 */
router.post('/upload', function(req, res, next){
    try {
        var fileHandler = require(ROOT_PATH + '/libs/fileHandler');
        var commonConfig = require(ROOT_PATH + '/configs/commonConfig');
        var fs = require('fs');
        var sid = res.logon.id;
        var targetPath = commonConfig.STAFF_IMG_PATH + '/' + sid;
        fs.lstat(targetPath, function(err, stats){
            if (err) {
                next(new CommonError(err));
            } else {
                if (!stats.isDirectory()) {
                    fs.mkdirSync(targetPath);
                }
                fileHandler.handleImageUpload({
                    targetPath : targetPath,
                    targetName : sid
                }, req, res, function(err){
                    if (err) {
                        next(err);
                    } else {
                        res.json({code:0});
                    }
                });
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * 下载个人头像
 */
router.get('/icon', function(req, res, next){
    try {
        var sid = res.logon.id;
        var fileHandler = require(ROOT_PATH + '/libs/fileHandler');
        var commonConfig = require(ROOT_PATH + '/configs/commonConfig');
        var fs = require('fs');
        var targetPath = commonConfig.STAFF_IMG_PATH + '/' + sid;
        fs.readdir(targetPath, function(err, files){
            var target = null;
            if (err || !files.length) {
                target = commonConfig.STAFF_IMG_PATH + '/default.jpg';
            } else {
                target = targetPath + '/' + files[0];
            }
            fileHandler.handleImageDownload({
                target : target
            }, req, res, next);
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
