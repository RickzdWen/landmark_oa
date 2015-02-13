/**
 * Created by Administrator on 2015/2/14.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'angular-bootstrap'
], function(doc, angular, params){
    var app = angular.module('safetyApp', ['ui.bootstrap']);

    app.controller('mainCtrl', ['$scope',
        function($scope){
            $scope.locale = 'us';
            $scope.selectLocale = function(locale){
                $scope.locale = locale;
            };
        }]);

    angular.bootstrap(doc, ['safetyApp']);
});
