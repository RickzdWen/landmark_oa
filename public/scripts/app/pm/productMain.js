/**
 * Created by Administrator on 2014/11/2.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'ui/upload/directives/fileUpload',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives',
    'angular-bootstrap'
], function(doc, angular, params){
    var app = angular.module('productApp', ['lm.commonService', 'lm.commonDirectives', 'ui.bootstrap', 'ui.upload']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            var product = $scope.product = params.product;
            var editModalData = $scope.editModalData = {
                show : false
            };
            $scope.data = {};

            $scope.showEdit = function(e) {
                e.preventDefault();
                $scope.data = angular.copy(product);
                resetErrorShow();
                editModalData.show = true;
            };

            var submitting = false;
            $scope.modify = function(e) {
                e && e.preventDefault();
                if (submitting) {
                    return;
                }
                setErrorShow();
                var data = $scope.data;
                if (!data.name_us || !data.name_cn || !data.name_hk) {
                    return;
                }
                submitting = true;
                _getService($http.put('/pm/product/' + product.id, data)).then(function(ret){
                    product = angular.extend(product, data);
                    editModalData.show = false;
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submitting = false;
                });
            };

            $scope.uploadCallBack = function(json) {
                if (json) {
                    if (json.code === 0) {
                        product.img_version = json.img_version;
                    } else {
                        alert('only jpg image is allowed!');
                    }
                }
            };

            var errorShow = $scope.errorShow = {};
            $scope.valid = function(name) {
                errorShow[name] = true;
            };

            function resetErrorShow() {
                errorShow.name_us = errorShow.name_cn = errorShow.name_hk = false;
            }

            function setErrorShow() {
                errorShow.name_us = errorShow.name_cn = errorShow.name_hk = true;
            }

            $scope.selectCategory = function(e, cid, name) {
                e.preventDefault();
                $scope.data.category_us = name;
                $scope.data.cid = cid;
            };

            $scope.selectBrand = function(e, bid, name) {
                e.preventDefault();
                $scope.data.brand_us = name;
                $scope.data.bid = bid;
            };

            $scope.featureType = 'us';
            $scope.parametersType = 'us';
            $scope.usageType = 'us';
            $scope.selectType = function(name, value){
                $scope[name + 'Type'] = value;
            };
    }]);

    angular.bootstrap(doc, ['productApp']);
});
