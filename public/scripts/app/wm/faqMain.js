/**
 * Created by Administrator on 2015/3/1.
 */

require([
    'domReady!',
    'angular',
    'app/common/params',
    'landmark/angularjs/commonService',
    'landmark/angularjs/commonDirectives',
    'angular-bootstrap'
], function(doc, angular, params){
    var app = angular.module('faqApp', ['lm.commonService', 'lm.commonDirectives', 'ui.bootstrap']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            var list = $scope.list = params.list;

            var confirmData = $scope.confirmData = {
                show :false
            };
            $scope.showDelete = function(e, index) {
                var item = list[index];
                $scope.deleteIndex = index;
                confirmData.title = 'Delete "' + item.question_us + '"';
                confirmData.show = true;
            };
            var submitting = false;
            $scope.delete = function(e) {
                e && e.preventDefault();
                if (submitting) {
                    return;
                }
                var item = list[$scope.deleteIndex];
                submitting = true;
                _getService($http.delete('/wm/faq/' + item.id)).then(function(){
                    window.location.reload();
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submitting = false;
                });
            };

            $scope.togglePublished = function(e, item) {
                e.preventDefault();
                if (submitting) {
                    return;
                }
                submitting = true;
                _getService($http.put('/wm/faq/published/' + item.id, {
                    published : !item.published
                })).then(function(){
                    item.published = !item.published;
                }, function(error){
                    alert(error);
                })['finally'](function(){
                    submitting = false;
                });
            };
        }]);

    angular.bootstrap(doc, ['faqApp']);
});
