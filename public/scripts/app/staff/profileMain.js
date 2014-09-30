/**
 * Created by Administrator on 2014/9/21.
 */

require([
    'domReady!',
    'jquery',
    'angular',
    'app/common/params',
    'ui/upload/directives/fileUpload'
], function(doc, $, angular, params){
    var app = angular.module('profileApp', ['ui.upload']);
    app.run(['$rootScope', function ($rootScope) {
        $rootScope.version = '';
        $rootScope.uploadCallBack = function(json){
            if (json && json.code === 0) {
                $rootScope.version = +new Date();
            }
        };
    }]);
    angular.bootstrap(angular.element('.main-part')[0], ['profileApp']);
});
