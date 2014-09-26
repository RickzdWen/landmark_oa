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
    angular.bootstrap(angular.element('.main-part')[0], ['profileApp']);
});
