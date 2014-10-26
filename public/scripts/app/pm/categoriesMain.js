/**
 * Created by rick on 2014/10/25.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives'
], function(doc, angular, params){
    var app = angular.module('categoryApp', ['lm.commonService', 'lm.commonDirectives']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            var list = $scope.list = params.list;
            var modalData = $scope.modalData = {
                show : false,
                title : 'Add A New Category',
                saveTitle : 'Save'
            };
            $scope.data = {};

            $scope.showAdd = function(e) {
                e.preventDefault();
                $scope.data = {
                    remark : ''
                };
                resetErrorShow();
                modalData.title = 'Add A New Category';
                modalData.saveTitle = 'Save';
                modalData.show = true;
                $scope.save = add;
            };

            $scope.showEdit = function(e, category) {
                e.preventDefault();
                $scope.mCategory = category;
                $scope.data = angular.copy(category);
                resetErrorShow();
                modalData.title = 'Edit Category';
                modalData.saveTitle = 'Modify';
                modalData.show = true;
                $scope.save = modify;
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
                _getService($http.post('/pm/category', data)).then(function(ret){
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
                _getService($http.post('/pm/update-category', data)).then(function(){
                    $scope.mCategory = angular.extend($scope.mCategory, data);
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
                var category = list[index];
                $scope.deleteIndex = index;
                confirmData.title = 'Delete "' + category.name_us + '"';
                confirmData.show = true;
            };
            $scope.delete = function(e) {
                e && e.preventDefault();
                if (submitting) {
                    return;
                }
                submitting = true;
                var category = list[$scope.deleteIndex];
                _getService($http.post('/pm/delete-category', {
                    id : category.id
                })).then(function(ret){
                    list.splice($scope.deleteIndex, 1);
                    confirmData.show =false;
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submitting = false;
                });
            };
    }]);

    angular.bootstrap(doc, ['categoryApp']);
});
