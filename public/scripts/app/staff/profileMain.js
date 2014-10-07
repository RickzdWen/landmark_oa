/**
 * Created by Administrator on 2014/9/21.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'ui/upload/directives/fileUpload',
    'ui/form/directives/datepicker',
    'landmark/angularjs/commonService'
], function(doc, angular, params){
    var app = angular.module('profileApp', ['ui.upload', 'lm.commonService', 'ui.form']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            var staff = $scope.staff = params.staff;
            $scope.uploadCallBack = function(json) {
                if (json && json.code === 0) {
                    staff.icon_version = json.icon_version;
                }
            };

            var vInfo = $scope.validInfo = {
                isNickValid : false,
                isNickUnique : false,
                isEmailValid : false,
                isQqValid : false
            };
            $scope.nickError = '';
            $scope.$watch('staff.nick', function(nick){
                vInfo.isNickUnique = false;
                vInfo.isNickValid = nick ? true : false;
                $scope.nickError = vInfo.isNickValid ? '' : 'nick is required';
            });
            $scope.$watch('staff.email', function(email){
                if (email && !/^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i.test(email)) {
                    vInfo.isEmailValid = false;
                } else {
                    vInfo.isEmailValid = true;
                }
            });
            $scope.$watch('staff.qq', function(qq){
                if (qq && isNaN(qq)) {
                    vInfo.isQqValid = false;
                } else {
                    vInfo.isQqValid = true;
                }
            });

            $scope.validNick = function(withSubmit) {
                if (vInfo.isNickValid) {
                    _getService($http.get('/staff/exist', {
                        params : {
                            nick : staff.nick
                        }
                    })).then(function(res){
                        if (res.exist) {
                            $scope.nickError = 'the nick has been existed';
                        } else {
                            vInfo.isNickUnique = true;
                            withSubmit && submit();
                        }
                    });
                }
            };

            var submiting = false;
            $scope.update = function(e) {
                e.preventDefault();
                if (submiting) {
                    return;
                }
                if (vInfo.isNickValid && vInfo.isEmailValid && vInfo.isQqValid) {
                    if (!vInfo.isNickUnique) {
                        $scope.validNick(true);
                    } else {
                        submit();
                    }
                }
            };

            function submit() {
                submiting = true;
                _getService($http.post('/staff/update', staff)).then(function(ret){
                    alert('success');
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submiting = false;
                });
            }
    }]);

    angular.bootstrap(angular.element('.main-container')[0], ['profileApp']);
});
