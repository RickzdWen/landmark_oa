/**
 * Created by Administrator on 2014/9/21.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'app/staff/staffCommonModule',
    'moment',
    'ui/upload/directives/fileUpload',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives',
    'angular-bootstrap'
], function(doc, angular, params, common, moment){
    var app = angular.module('profileApp', ['ui.upload', 'lm.commonService', 'lm.commonDirectives', 'ui.bootstrap']);

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

    app.controller('birthCtrl', ['$scope',
        function($scope){
            $scope.opened = false;
            $scope.toggleOpen = function(e) {
                e.preventDefault();
                e.stopPropagation();
                $scope.opened = !$scope.opened;
            };
            $scope.$watch('staff.birth', function(birth){
                if (birth && typeof birth == 'object') {
                    $scope.staff.birth = moment(birth).format('MM/DD/YYYY');
                }
            });
            $scope.options = {
                'show-weeks' : false
            };
    }]);

    angular.bootstrap(angular.element('.main-container')[0], ['profileApp']);
});
