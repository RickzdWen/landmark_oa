/**
 * Created by Administrator on 2014/10/7.
 */

define([
    './formModule',
    'datepicker'
], function(module){
    module.directive('lmDatePicker', [function(){
        return {
            restrict : 'EA',
            require : 'ngModel',
            link : function(scope, elem, attr, ngModel) {
                var listener = scope.$watch(function(){
                    return ngModel.$modelValue;
                }, function(modelValue){
                    elem.datepicker('update');
                    listener();
                    elem.on('changeDate', function(){
                        scope.$digest();
                    });
                });
                elem.datepicker({
                    autoclose : true
                });
            }
        };
    }]);
});
