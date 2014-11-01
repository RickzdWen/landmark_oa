/**
 * Created by Administrator on 2014/11/1.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives'
], function(doc, angular, params){
    var app = angular.module('productsApp', ['lm.commonService', 'lm.commonDirectives']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            $scope.info = params.productsInfo || {};
            var list = $scope.info.result;

            var confirmData = $scope.confirmData = {
                show :false
            };
            $scope.showDelete = function(e, index) {
                var product = list[index];
                $scope.deleteIndex = index;
                confirmData.title = 'Delete "' + product.name_us + '"';
                confirmData.show = true;
            };
            var submitting = false;
            $scope.delete = function(e) {
                e && e.preventDefault();
                if (submitting) {
                    return;
                }
                var product = list[$scope.deleteIndex];
                submitting = true;
                _getService($http.delete('/pm/product/' + product.id)).then(function(){
                    window.location.reload();
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submitting = false;
                });
            }
    }]);

    angular.bootstrap(doc, ['productsApp']);
});
