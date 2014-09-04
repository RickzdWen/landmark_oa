/**
 * Created by zhangyun on 14-8-23.
 */

var _params;
require = {
    baseUrl : '/scripts',
    paths : {
        'jquery' : '/bower_components/jquery/dist/jquery.min',
        'angular' : '/bower_components/angular/angular.min',
        'bootstrap' : '/bower_components/bootstrap/dist/js/bootstrap.min',
        'text' : '/bower_components/requirejs-text/text',
        'domReady' : '/bower_components/requirejs-domready/domReady',
        'i18n' : '/bower_components/requirejs-i18n/i18n',
        'angular-route' : '/bower_components/angular-route/angular-route.min',
        'angular-resource' : '/bower_components/angular-resource/angular-resource.min'
    },
    shim : {
        'angular' : {
            'exports' : 'angular',
            'deps' : ['jquery']
        },
        'angular-route' : ['angular'],
        'angular-resource' : ['angular'],
        'bootstrap' : ['jquery']
    },
    config : {
        'app/common/params' : _params || {}
    }
};