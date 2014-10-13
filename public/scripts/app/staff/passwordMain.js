/**
 * Created by Administrator on 2014/10/12.
 */

require([
    'domReady!',
    'angular',
    'angular-md5',
    'landmark/angularjs/commonService'
], function(doc, angular){
    var app = angular.module('pwdApp', ['lm.commonService', 'angular-md5']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http', 'md5',
        function($scope, _getService, $http, md5){
            var data = $scope.data = {
                oldPwd : '',
                newPwd : '',
                pwdAgain : ''
            };
            $scope.$watch('data.oldPwd', function(opwd){
                if (!opwd) {
                    $scope.isOldPwdValid = false;
                } else {
                    $scope.isOldPwdValid = true;
                }
            });
            $scope.$watch('data.newPwd', function(newPwd){
                checkPwd(newPwd);
            });
            $scope.$watch('data.pwdAgain + data.newPwd', function(){
                var pwd = data.pwdAgain;
                if (!pwd) {
                    $scope.isPwdAgainValid = false;
                    $scope.pwdAgainTip = '';
                } else if (pwd != data.newPwd) {
                    $scope.isPwdAgainValid = false;
                    $scope.pwdAgainTip = 'not the same';
                } else {
                    $scope.isPwdAgainValid = true;
                    $scope.pwdAgainTip = '';
                }
            });

            var submitting = false;
            $scope.submit = function(e) {
                e && e.preventDefault();
                if (submitting) {
                    return;
                }
                if (!$scope.isOldPwdValid || !$scope.isNewPwdValid || !$scope.isPwdAgainValid) {
                    $scope.showOldPwdError = $scope.showNewPwdError = $scope.showPwdAgainError = true;
                    return;
                }
                submitting = true;
                _getService($http.post('/staff/password', {
                    oldPwd : md5.createHash(data.oldPwd),
                    newPwd : md5.createHash(data.newPwd),
                    pwdAgain : md5.createHash(data.pwdAgain)
                })).then(function(){
                    $http.get('/common/logout', {
                        params : {
                            of : 'json'
                        }
                    }).success(function(){
                        window.location.href = '/';
                    });
                }, function(error){
                    $scope.errMsg = error;
                })['finally'](function(){
                    submitting = false;
                });
            };

            function checkPwd(pwd) {
                if (!pwd) {
                    $scope.isNewPwdValid = false;
                    $scope.newPwdTip = '';
                } else if (/[^a-zA-Z0-9~!@#$%^&*()]/.test(pwd)) {
                    $scope.isNewPwdValid = false;
                    $scope.newPwdTip = 'not valid';
                } else if (pwd.length < 6 || pwd.length > 20) {
                    $scope.isNewPwdValid = false;
                    $scope.newPwdTip = 'password length at least 6 characters and maximum of 20';
                } else {
                    $scope.isNewPwdValid = true;
                    var score = 0;
                    if (/[a-zA-Z]/.test(pwd)) {
                        ++score;
                    }
                    if (/[0-9]/.test(pwd)) {
                        ++score;
                    }
                    if (/[~!@#$%^&*()]/.test(pwd)) {
                        ++score;
                    }
                    $scope.newPwdTip = '';
                }
            }
    }]);

    angular.bootstrap(angular.element('.main-container')[0], ['pwdApp']);
});
