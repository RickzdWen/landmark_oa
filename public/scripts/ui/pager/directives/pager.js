/**
 * Created by rick on 2014/10/23.
 */

define([
    './pagerModule',
    'ui/pager/Pager'
], function(module, Pager){
    module.directive('lmPager', [function(){
        return {
            restrict : 'EA',
            replace : false,
            scope : {
                info : '=',
                pagerCallBack : '='
            },
            link : function(scope, elem) {
                var pager = new Pager({
                    node : elem[0],
                    info : scope.info,
                    onClick : function(page){
                        if (scope.pagerCallBack) {
                            scope.$apply(function(){
                                scope.pagerCallBack(page);
                            });
                        }
                    }
                });
            }
        };
    }]);
});
