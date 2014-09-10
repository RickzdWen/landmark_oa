/**
 * Created by zhangyun on 14-9-10.
 */

var express = require('express');
var router = express.Router();
var StaffModel = require(ROOT_PATH + '/models/StaffModel');

var profileCtrl = function(req, res, next){
    res._view = 'staff/profile';
    res.doc = {
        category : 'staff',
        nav : 'profile',
        title : 'Staff Profile'
    };
    StaffModel.getInstance().getStaffById(res.logon.id).then(function(row){
        row && (delete row.pwd);
        console.log(row);
        res.doc.staff = row;
        res.render(res._view, res);
        res.end();
    }, function(err){
        next(err);
    });
};

router.get('/', profileCtrl);
router.get('/profile', profileCtrl);

module.exports = router;
