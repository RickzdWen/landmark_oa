/**
 * Created by Administrator on 2014/9/21.
 */

define([
    'jquery',
    'landmark/declare',
    'landmark/lang',
    'ui/_Widget'
], function($, declare, lang, _Widget){
    var FileUpload = declare([_Widget], {
        scope : null,
        node : null,

        create : function() {
            this.$node = $(this.node);
            this.$buttonNode = this.$node.find('button');
            this.$formNode = this.$node.find('form');
            this.$fileInputNode = this.$formNode.find('input[type=file]');
            this.$node.append('<iframe name="' + this.scope.iframeName + '" src="about:blank" style="display:none;"></iframe>');
            this.iframeNode = this.$node.find('iframe')[0];
        },

        postCreate : function() {
            this.$buttonNode.click(lang.hitch(this, function(){
                if (this.scope.uploading) {
                    return;
                }
                this.$fileInputNode.click();
            }));

            this.$fileInputNode.change(lang.hitch(this, function(){
                var scope = this.scope;
                scope.$apply(function(){
                    scope.uploading = true;
                });
                this.$formNode.submit();
            }));

            this.listenIframeLoad();
        },

        listenIframeLoad : function() {
            var iframeNode = this.iframeNode;
            var scope = this.scope;
            function onLoadFunc() {
                scope.$apply(function(){
                    scope.uploading = false;
                    scope.uploadCallBack && scope.uploadCallBack(iframeNode.contentWindow);
                });
            }
            if (iframeNode.attachEvent) {
                iframeNode.attachEvent('onload', function(){
                    onLoadFunc();
                });
            } else {
                iframeNode.onload = function(){
                    onLoadFunc();
                };
            }
        }
    });
    return FileUpload;
});
