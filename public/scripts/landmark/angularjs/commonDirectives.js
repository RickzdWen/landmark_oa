/**
 * Created by rick on 2014/10/13.
 */

define([
    'angular'
], function(angular){
    var module = angular.module('lm.commonDirectives', []);

    module.directive('removeDisplayNone', [function(){
        return {
            restrict : 'A',
            scope : false,
            replace : false,
            link : function(scope, elem) {
                elem[0].style.display = '';
            }
        };
    }]);

    return module;
});
