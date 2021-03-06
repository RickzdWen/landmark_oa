/**
 * Created by zhangyun on 14-8-23.
 */

var _params;
require = {
    baseUrl : '/scripts',
    paths : {
        'jquery' : '/bower_components/jquery/dist/jquery.min',
        'angular' : '/bower_components/angular/angular',
        'bootstrap' : '/bower_components/bootstrap/dist/js/bootstrap.min',
        'text' : '/bower_components/requirejs-text/text',
        'domReady' : '/bower_components/requirejs-domready/domReady',
        'i18n' : '/bower_components/requirejs-i18n/i18n',
        'angular-route' : '/bower_components/angular-route/angular-route.min',
        'angular-resource' : '/bower_components/angular-resource/angular-resource.min',
        'angular-md5' : '/bower_components/angular-md5/angular-md5.min',
        'datepicker' : '/bower_components/bootstrap-datepicker/js/bootstrap-datepicker',
        'angular-bootstrap' : '/bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-ui-select' : '/bower_components/angular-ui-select/dist/select.min',
        'moment' : '/bower_components/moment/min/moment.min'
    },
    shim : {
        'angular' : {
            'exports' : 'angular',
            'deps' : ['jquery']
        },
        'angular-route' : ['angular'],
        'angular-resource' : ['angular'],
        'angular-md5' : ['angular'],
        'bootstrap' : ['jquery'],
        'datepicker' : ['jquery', 'bootstrap'],
        'angular-bootstrap' : ['angular', 'bootstrap'],
        'angular-ui-select' : ['angular', 'bootstrap']
    },
    config : {
        'app/common/params' : _params || {}
    }
};