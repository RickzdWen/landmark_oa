/**
 * Created by rick on 2014/10/25.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'landmark/angularjs/commonService'
], function(doc, angular, params){
    var app = angular.module('categoryApp', ['lm.commonService']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            $scope.list = params.list;
    }]);

    angular.bootstrap(doc, ['categoryApp']);
});
