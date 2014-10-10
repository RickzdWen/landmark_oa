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
        res.doc.staffJson = JSON.stringify(row);
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
                        StaffModel.getInstance().updateIconVersion(sid).then(function(version){
                            res.json({
                                code : 0,
                                icon_version : version
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

/**
 * 下载个人头像
 */
router.get('/icon/:sid', function(req, res, next){
    try {
        var sid = req.params.sid;
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

/**
 * 校验昵称唯一
 */
router.get('/exist', function(req, res, next){
    try {
        var sid = res.logon.id;
        var nick = req.query.nick;
        if (!sid) {
            throw new CommonError('', 50000);
        } else if (!nick) {
            throw new CommonError('', 50002);
        }
        StaffModel.getInstance().checkExist('nick', nick, sid).then(function(staff){
            var exist = 0;
            if (staff) {
                exist = 1;
            }
            res.json({exist:exist});
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.post('/update', function(req, res, next){
    try {
        var sid = res.logon.id;
        var staff = _createStaff(req);
        if (!sid || !staff.nick) {
            throw new CommonError('', 50002);
        }
        StaffModel.getInstance().update(staff, 'id=?', [sid]).then(function(){
            res.json({code:0});
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.get('/members', function(req, res, next){
    try {
        StaffModel.getInstance().getAll('', [], 'id,nick,nick_cn').then(function(rows){
            res._view = 'staff/members';
            res.doc = {
                members : rows,
                category : 'staff',
                nav : 'members',
                title : 'Staff Members'
            };
            res.render(res._view, res);
        }, function(err){
            next(err);
        });
    } catch (err) {
        next(err);
    }
});

router.get('/member/:sid', function(req, res, next){
    try {
        StaffModel.getInstance().getStaffById(req.params.sid).then(function(staff){
            res._view = 'staff/member';
            res.doc = {
                category : 'staff',
                nav : 'members',
                title : 'Staff Member',
                staff : staff
            };
            res.render(res._view, res);
        }, function(err){
            next(err);
        })
    } catch (err) {
        next(err);
    }
});

router.get('/add', function(req, res, next){
    try {
        res._view = 'staff/add';
        res.doc = {
            category : 'staff',
            nav : 'members',
            title : 'Add New Member'
        };
        res.render(res._view, res);
    } catch (err) {
        next(err);
    }
});

router.post('/add', function(req, res, next){
    try {
        var staff = _createStaff(req);
        if (!staff.nick) {
            throw new CommonError('', 50002);
        }
        StaffModel.getInstance().create(staff).then(function(result){
            res.json({code : 0});
        }, function(err){
            next(err);
        })
    } catch (err) {
        next(err);
    }
});

function _createStaff(req) {
    var staff = {};
    staff.nick = req.body.nick || '';
    staff.nick_cn = req.body.nick_cn || '';
    staff.qq = req.body.qq || '';
    staff.email = req.body.email || '';
    staff.birth = req.body.birth || '';
    staff.sex = req.body.sex || 0;
    staff.address = req.body.address || '';
    staff.descp = req.body.descp || '';
    staff.phone = req.body.phone || '';
    return staff;
}

module.exports = router;
