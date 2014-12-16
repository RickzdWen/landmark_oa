/**
 * Created by Administrator on 2014/9/21.
 */

define([
    'angular',
    './uploadModule',
    '../FileUpload',
    'text!../templates/FileUpload.html'
], function(angular, module, FileUpload, template){
    module.directive('lmpFileUpload', [function(){
        return {
            restrict : 'EA',
            replace : true,
            template : template,
            scope : {
                title : '@',
                uploadingTitle : '@',
                fileInputName : '@',
                iframeName : '@',
                uploadUrl : '@',
                accept : '@',
                index : '@',
                customizedInputs : '=',
                uploadCallBack : '=',
                customizedInputs : '='
            },
            compile : function($scope, $attrs) {
                init($attrs);
                return function(scope, elem) {
                    convertCustomizedInputs(scope, scope.customizedInputs);
                    var fu = new FileUpload({
                        node : elem[0],
                        scope : scope
                    });
                    scope.$watch('uploading', function(uploading){
                        if (uploading) {
                            scope.showTitle = scope.uploadingTitle;
                        } else {
                            scope.showTitle = scope.title;
                        }
                    });
                }
            }
        };
    }]);

    function init($attrs) {
        $attrs.title = $attrs.title || 'upload';
        $attrs.uploadingTitle = $attrs.uploadingTitle || 'uploading';
        $attrs.showTitle = $attrs.title;
        $attrs.fileInputName = $attrs.fileInputName || 'file';
        $attrs.accept = $attrs.accept || 'image/*';
        $attrs.iframeName = $attrs.iframeName || 'tmpIframe';
        $attrs.uploading = false;
    }

    function convertCustomizedInputs(scope, inputs) {
        if (!inputs || !angular.isObject(inputs)) {
            return;
        }
        var tmp = [];
        for (var i in inputs) {
            tmp.push({
                name : i,
                value : inputs[i]
            });
        }
        scope.customizedInputs = tmp;
    }
});
