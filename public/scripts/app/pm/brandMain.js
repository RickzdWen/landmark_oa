/**
 * Created by Administrator on 2015/2/28.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'angular-bootstrap'
], function(doc, angular, params){
    var app = angular.module('brandApp', ['ui.bootstrap']);

    app.controller('mainCtrl', ['$scope',
        function($scope){
            $scope.locale = 'us';
            $scope.selectLocale = function(locale){
                $scope.locale = locale;
            };
        }]);

    angular.bootstrap(doc, ['brandApp']);
});

