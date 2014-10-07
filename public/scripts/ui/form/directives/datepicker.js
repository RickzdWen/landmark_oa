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
                elem.datepicker().on('changeDate', function(){
                    scope.$digest();
                });
            }
        };
    }]);
});
