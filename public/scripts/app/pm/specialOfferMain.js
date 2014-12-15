/**
 * Created by Administrator on 2014/12/14.
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
    var app = angular.module('specialOfferApp', ['lm.commonService', 'lm.commonDirectives', 'ui.bootstrap', 'ui.upload']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            var offer = $scope.offer = params.offer;
            var editModalData = $scope.editModalData = {
                show : false
            };
            $scope.data = {};

            $scope.showEdit = function(e) {
                e.preventDefault();
                $scope.data = angular.copy(offer);
                resetErrorShow();
                editModalData.show = true;
            };

            $scope.discountValid = false;
            $scope.$watch('data.discount', function(discount){
                discount += '';
                if (!discount || isNaN(discount)) {
                    $scope.discountValid = false;
                } else {
                    $scope.discountValid = true;
                }
            });

            var submitting = false;
            $scope.modify = function(e) {
                e && e.preventDefault();
                if (submitting) {
                    return;
                }
                setErrorShow();
                var data = $scope.data;
                if (!data.title_us || !data.title_cn || !data.title_hk || !$scope.discountValid) {
                    return;
                }
                submitting = true;
                _getService($http.put('/pm/special_offer/' + offer.id, data)).then(function(ret){
                    offer = angular.extend(offer, data);
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
                        offer.img_version = json.img_version;
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
                errorShow.title_us = errorShow.title_cn = errorShow.title_hk = errorShow.discount = false;
            }

            function setErrorShow() {
                errorShow.title_us = errorShow.title_cn = errorShow.title_hk = errorShow.discount = true;
            }

            var plist = $scope.plist = params.plist;
            var plistMap = $scope.plistMap = {};
            for (var i = 0, len = plist.length; i < len; ++i) {
                var item = plist[i];
                plistMap[item.pid] = 1;
            }
            var relationData = $scope.relationData = {
                sid : offer.id
            };
            $scope.selectProduct = function(e, pid, name) {
                e.preventDefault();
                relationData.product_name = name;
                relationData.pid = pid;
            };
            $scope.$watch('relationData.qty', function(qty){
                if (!qty || isNaN(qty)) {
                    $scope.qtyValid = false;
                } else {
                    relationData.qty = Math.floor(qty);
                    $scope.qtyValid = true;
                }
            });
            var adding = false;
            $scope.addProduct = function(e) {
                e.preventDefault();
                if (adding) {
                    return;
                }
                $scope.qtyErrorShow = true;
                if (!$scope.qtyValid || !relationData.pid || plistMap[relationData.pid]) {
                    return;
                }
                adding = true;
                _getService($http.post('/pm/special_offer_relation', relationData)).then(function(){
                    plist.push({
                        pid : relationData.pid,
                        product_name : relationData.product_name,
                        qty : relationData.qty
                    });
                    plistMap[relationData.pid] = 1;
                    $scope.qtyErrorShow = false;
                    relationData.qty = relationData.pid = relationData.product_name = '';
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    adding = false;
                });
            };

            var deleting = false;
            $scope.deleteProduct = function(e, index){
                e.preventDefault();
                if (deleting) {
                    return;
                }
                deleting = true;
                var item = plist[index];
                _getService($http.delete('/pm/special_offer_relation/' + offer.id + '/' + item.pid)).then(function(){
                    plistMap[item.pid] = 0;
                    plist.splice(index, 1);
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    deleting = false;
                });
            };
//
//            $scope.selectBrand = function(e, bid, name) {
//                e.preventDefault();
//                $scope.data.brand_us = name;
//                $scope.data.bid = bid;
//            };

            $scope.descType = 'us';
            $scope.selectType = function(name, value){
                $scope[name + 'Type'] = value;
            };
        }]);

    angular.bootstrap(doc, ['specialOfferApp']);
});
