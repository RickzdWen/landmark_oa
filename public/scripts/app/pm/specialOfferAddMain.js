/**
 * Created by Administrator on 2014/12/13.
 */

require([
    'domReady!',
    'angular',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives'
], function(doc, angular){
    var app = angular.module('specialOfferAddApp', ['lm.commonService', 'lm.commonDirectives']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            var offer = $scope.offer = {};

            var errorShow = $scope.errorShow = {
                'title_us' : false,
                'title_cn' : false,
                'title_hk' : false,
                'discount' : false
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
                if (!offer.title_us || !offer.title_cn || !offer.title_hk || !offer.discount) {
                    return;
                }
                submitting = true;
                _getService($http.post('/pm/special_offer', offer)).then(function(ret){
                    window.location.href = '/pm/special_offer/' + ret.insertId;
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
    angular.bootstrap(doc, ['specialOfferAddApp']);
});
