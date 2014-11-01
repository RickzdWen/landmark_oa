/**
 * Created by Administrator on 2014/11/1.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives',
    'angular-bootstrap'
], function(doc, angular, params){
    var app = angular.module('productAddApp', ['lm.commonService', 'lm.commonDirectives', 'ui.bootstrap']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            var product = $scope.product = {};

            $scope.selectCategory = function(e, cid, name) {
                $scope.categoryName = name;
                product.cid = cid;
            };

            var errorShow = $scope.errorShow = {
                'name_us' : false,
                'name_cn' : false,
                'name_hk' : false
            };
            $scope.valid = function(name) {
                errorShow[name] = true;
            };

            var submitting = false;
            $scope.submit = function(e) {
                e && e.preventDefault();
                if (submitting) {
                    return;
                }
                showAllError();
                if (!product.name_us || !product.name_cn || !product.name_hk) {
                    return;
                }
                submitting = true;
                _getService($http.post('/pm/product', product)).then(function(ret){
                    window.location.href = '/pm/products';
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submitting = false;
                });
            };

            function showAllError() {
                for (var i in errorShow) {
                    errorShow[i] = true;
                }
            }
    }]);
    angular.bootstrap(doc, ['productAddApp']);
});
