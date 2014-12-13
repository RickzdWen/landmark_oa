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
    var app = angular.module('productsApp', ['lm.commonService', 'lm.commonDirectives', 'ui.bootstrap']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            $scope.info = params.productsInfo || {};
            var list = $scope.info.result;
            var pager = $scope.pager = $scope.info.pager;

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
            };

            $scope.pageChanged = function() {
                window.location.href = getReqUrl() + '&page=' + pager.page;
            };

            var search = $scope.search = params.search;
            $scope.selectCategory = function(e, cid, name) {
                search.categoryName = name;
                search.cid = cid;
            };
            $scope.selectBrand = function(e, bid, name) {
                search.brandName = name;
                search.bid = bid;
            };
            $scope.submitSearch = function(e) {
                e.preventDefault();
                window.location.href = getReqUrl();
            };

            function getReqUrl() {
                var s = [];
                s.push('name=' + search.name || '');
                s.push('cid=' + search.cid || '');
                s.push('bid=' + search.bid || '');
                return '/pm/products?' + s.join('&');
            }
    }]);

    angular.bootstrap(doc, ['productsApp']);
});
