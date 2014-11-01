/**
 * Created by zhangyun on 14-10-11.
 */

require([
    'domReady!',
    'angular',
    'app/staff/staffCommonModule',
    'moment',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives',
    'angular-bootstrap'
], function(doc, angular, common, moment){
    var app = angular.module('addMemberApp', ['lm.commonService', 'lm.commonDirectives', 'ui.bootstrap']);

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

    angular.bootstrap(angular.element('.main-container')[0], ['addMemberApp']);
});
