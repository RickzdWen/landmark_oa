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

    module.directive('lmModal', ['$timeout', function($timeout){
        return {
            restrict : 'A',
            scope : {
                passData : '='
            },
            replace : false,
            link : function(scope, elem) {
                var fadePromise = null;
                var bgElem = null;
                var bodyElem = angular.element('body');
                scope.$watch('passData.show', function(show){
                    elem.css('display', show ? 'block' : 'none');
                    $timeout.cancel(fadePromise);
                    fadePromise = $timeout(function(){
                        if (show) {
                            elem.addClass('in');
                        } else {
                            elem.removeClass('in');
                        }
                    }, 10);
                    if (show) {
                        bgElem = angular.element('<div class="modal-backdrop fade in"></div>').appendTo(bodyElem);
                    } else {
                        bgElem && bgElem.remove() && (bgElem = null);
                    }
                });
                scope.$on('$destroy', function(){
                    $timeout.cancel(fadePromise);
                });
            }
        }
    }]);

    return module;
});
