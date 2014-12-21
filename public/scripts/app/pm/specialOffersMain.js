/**
 * Created by Administrator on 2014/12/13.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives'
], function(doc, angular, params){
    var app = angular.module('specialOffersApp', ['lm.commonService', 'lm.commonDirectives']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            var list = $scope.list = params.list;

            // confirm
            var confirmData = $scope.confirmData = {
                show :false
            };
            $scope.showDelete = function(e, index) {
                var offer = list[index];
                $scope.deleteIndex = index;
                confirmData.title = 'Delete "' + offer.title_us + '"';
                confirmData.show = true;
            };
            var submitting = false;
            $scope.delete = function(e) {
                e && e.preventDefault();
                if (submitting) {
                    return;
                }
                submitting = true;
                var category = list[$scope.deleteIndex];
                _getService($http.delete('/pm/special_offer/' + category.id)).then(function(ret){
                    list.splice($scope.deleteIndex, 1);
                    confirmData.show =false;
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submitting = false;
                });
            };

            $scope.togglePublished = function(e, offer) {
                e.preventDefault();
                if (submitting) {
                    return;
                }
                submitting = true;
                _getService($http.put('/pm/special_offer/published/' + offer.id, {
                    published : !offer.published
                })).then(function(){
                    offer.published = !offer.published;
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submitting = false;
                });
            };
        }]);

    angular.bootstrap(doc, ['specialOffersApp']);
});
