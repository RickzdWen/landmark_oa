/**
 * Created by zhangyun on 14-10-11.
 */

require([
    'domReady!',
    'angular',
    'app/staff/staffCommonModule',
    'ui/form/directives/datepicker',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives'
], function(doc, angular, common){
    var app = angular.module('addMemberApp', ['lm.commonService', 'ui.form', 'lm.commonDirectives']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            var staff = $scope.staff = {
                sex : 0
            };
            common.process($scope, $http, staff, _getService, _submit);

            function _submit() {
                $scope.submiting = true;
                _getService($http.post('/staff/add', staff)).then(function(ret){
                    window.location.href = '/staff/members';
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    $scope.submiting = false;
                });
            }
    }]);

    angular.bootstrap(angular.element('.main-container')[0], ['addMemberApp']);
});
