/**
 * Created by Administrator on 2014/9/21.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'app/staff/staffCommonModule',
    'ui/upload/directives/fileUpload',
    'ui/form/directives/datepicker',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives'
], function(doc, angular, params, common){
    var app = angular.module('profileApp', ['ui.upload', 'lm.commonService', 'ui.form', 'lm.commonDirectives']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            var staff = $scope.staff = params.staff;
            $scope.uploadCallBack = function(json) {
                if (json && json.code === 0) {
                    staff.icon_version = json.icon_version;
                }
            };

            common.process($scope, $http, staff, _getService, _submit);

            function _submit() {
                $scope.submiting = true;
                _getService($http.post('/staff/update', staff)).then(function(ret){
                    window.location.href = '/staff/member/' + staff.id;
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    $scope.submiting = false;
                });
            }
    }]);

    angular.bootstrap(angular.element('.main-container')[0], ['profileApp']);
});
