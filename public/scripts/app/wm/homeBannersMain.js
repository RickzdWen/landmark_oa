/**
 * Created by Administrator on 2014/12/16.
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
    var app = angular.module('homeBannersApp', ['lm.commonService', 'lm.commonDirectives', 'ui.bootstrap', 'ui.upload']);

    app.controller('mainCtrl', ['$scope', '_getService', '$http',
        function($scope, _getService, $http){
            $scope.usList = [];
            $scope.cnList = [];
            $scope.hkList = [];
            $scope.list = [];
            $scope.locale = 'us';

            $scope.selectLocale = function(locale){
                $scope.locale = locale;
                $scope.list = $scope[locale + 'List'];
            };

            $scope.uploadCallBack = function(json, index) {
                var item = $scope.list[index];
                if (json && json.code === 0 && item) {
                    item.img_version = json.img_version;
                    item.extension = json.extension;
                }
            };

            $scope.addNewOne = function() {
                (function(locale){
                    _getService($http.post('/wm/home_banner', {
                        locale : locale
                    })).then(function(ret){
                        var item = {
                            id : ret.result.insertId,
                            display : 0,
                            open_new : 0
                        };
                        $scope[locale + 'List'].push(item);
                    }, function(error){
                        alert(error);
                    });
                })($scope.locale);
            };

            $scope.save = function(item) {
                _getService($http.put('/wm/home_banner/' + item.id, item)).then(function(){
                    alert('ok');
                }, function(error){
                    alert(error);
                });
            };

            $scope.toggleDisplay = function(item) {
                _getService($http.put('/wm/home_banner/' + item.id, {
                    display : !item.display
                })).then(function(){
                    item.display = !item.display
                }, function(error){
                    alert(error);
                });
            };

            _getService($http.get('/wm/home_banners', {
                params : {
                    of : 'json'
                }
            })).then(function(ret){
                var result = ret.list;
                for (var i = 0, len = result.length; i < len; ++i) {
                    var item = result[i];
                    $scope[item.locale + 'List'].push(item);
                }
            }, function(error){
                alert(error);
            });
        }]);

    angular.bootstrap(doc, ['homeBannersApp']);
});
