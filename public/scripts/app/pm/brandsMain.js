/**
 * Created by Administrator on 2014/12/13.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives',
    'angular-bootstrap'
], function(doc, angular, params){
    var app = angular.module('brandsApp', ['lm.commonService', 'lm.commonDirectives', 'ui.bootstrap']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            var list = $scope.list = params.list;
            var modalData = $scope.modalData = {
                show : false,
                title : 'Add A New Brand',
                saveTitle : 'Save'
            };
            $scope.data = {};

            $scope.showAdd = function(e) {
                e.preventDefault();
                $scope.data = {
                    remark : '',
                    country : 'US',
                    country_name : 'United States'
                };
                resetErrorShow();
                modalData.title = 'Add A New Brand';
                modalData.saveTitle = 'Save';
                modalData.show = true;
                $scope.save = add;
            };

            $scope.showEdit = function(e, brand) {
                e.preventDefault();
                $scope.mBrand = brand;
                $scope.data = angular.copy(brand);
                resetErrorShow();
                modalData.title = 'Edit Brand';
                modalData.saveTitle = 'Modify';
                modalData.show = true;
                $scope.save = modify;
            };

            $scope.selectCountry = function(e, countryValue, countryName) {
                e && e.preventDefault();
                $scope.data.country = countryValue;
                $scope.data.country_name = countryName;
            };

            var errorShow = $scope.errorShow = {};
            $scope.valid = function(name) {
                errorShow[name] = true;
            };

            var submitting = false;
            function add(e) {
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
                _getService($http.post('/pm/brand', data)).then(function(ret){
                    list.push(angular.extend({
                        id : ret.insertId,
                        product_num : 0
                    }, data));
                    modalData.show = false;
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submitting = false;
                });
            }

            function modify(e) {
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
                _getService($http.put('/pm/brand/' + data.id, data)).then(function(){
                    $scope.mBrand = angular.extend($scope.mBrand, data);
                    modalData.show = false;
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submitting = false;
                });
            }

            function resetErrorShow() {
                errorShow.name_us = errorShow.name_cn = errorShow.name_hk = false;
            }

            function setErrorShow() {
                errorShow.name_us = errorShow.name_cn = errorShow.name_hk = true;
            }

            // confirm
            var confirmData = $scope.confirmData = {
                show :false
            };
            $scope.showDelete = function(e, index) {
                var brand = list[index];
                $scope.deleteIndex = index;
                confirmData.title = 'Delete "' + brand.name_us + '"';
                confirmData.show = true;
            };
            $scope.delete = function(e) {
                e && e.preventDefault();
                if (submitting) {
                    return;
                }
                submitting = true;
                var category = list[$scope.deleteIndex];
                _getService($http.delete('/pm/brand/' + category.id)).then(function(ret){
                    list.splice($scope.deleteIndex, 1);
                    confirmData.show =false;
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submitting = false;
                });
            };
        }]);

    angular.bootstrap(doc, ['brandsApp']);
});
