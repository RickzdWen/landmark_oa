/**
 * Created by zhangyun on 14-9-8.
 */

define([
    'domReady!',
    'angular',
    'angular-md5',
    'landmark/angularjs/commonService'
], function(doc, angular){
    var module = angular.module('loginApp', ['angular-md5', 'lm.commonService']);
    module.controller('loginCtrl', ['$scope', '$http', 'md5', '_getService',
        function($scope, $http, md5, _getService) {
            var info = $scope.info = {
                nick : '',
                pwd : '',
                remember : true
            };
            $scope.errMsg = '';

            var requesting = false;
            $scope.login = function(e) {
                e.preventDefault();
                if (requesting || !info.nick || !info.pwd) {
                    return;
                }
                requesting = true;
                _getService($http.post('/login', {
                    nick : info.nick,
                    pwd : md5.createHash(info.pwd),
                    remember : info.remember
                })).then(function(ret){
                    var ref = ret.ref || '/';
                    window.location.href = ref;
                }, function(error){
                    $scope.errMsg = error;
                })['finally'](function(){
                    requesting = false;
                });
            };
    }]);
    angular.bootstrap(doc, ['loginApp']);
});
