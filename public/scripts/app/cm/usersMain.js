/**
 * Created by Administrator on 2014/12/9.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'angular-bootstrap'
], function(doc, angular, params){
    var app = angular.module('usersApp', ['ui.bootstrap']);

    app.controller('mainCtrl', ['$scope',
        function($scope){
            var pager = $scope.pager = params.pager;

            $scope.pageChanged = function() {
                window.location.href = '/cm/users?page=' + pager.page;
            };
    }]);
});
