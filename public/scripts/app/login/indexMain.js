/**
 * Created by zhangyun on 14-9-8.
 */

define([
    'domReady!',
    'angular',
    'angular-md5'
], function(doc, angular){
    var module = angular.module('loginApp', ['angular-md5']);
    module.controller('loginCtrl', ['$scope', '$http', 'md5',
        function($scope, $http, md5) {
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
                $http.post('/login', {
                    nick : info.nick,
                    pwd : md5.createHash(info.pwd),
                    remember : info.remember
                }).success(function(ret){
                    var ref = ret.ref || '/';
                    window.location.href = ref;
                }).error(function(error){
                    $scope.errMsg = error.message;
                })['finally'](function(){
                    requesting = false;
                });
            }
    }]);
    angular.bootstrap(doc, ['loginApp']);
});
