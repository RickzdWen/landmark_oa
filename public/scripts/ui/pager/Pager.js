/**
 * Created by rick on 2014/10/23.
 */

define([
    'futu/_base/declare',
    'ui/_Widget',
    'jquery'
], function(declare, _Widget, $){
    return declare(_Widget, {
        onClick : null,
        className : 'pagination',

        create : function() {
            this.$domNode = $('<ul class="' + this.className + '"></ul>');
            $(this.node).replaceWith(this.$domNode);
            this.domNode = this.$domNode[0];
            this._createPager();
        },

        postCreate : function() {
            var self = this;
            this.$domNode.on('click', 'li', function(e){
                e.preventDefault();
                if ($(this).hasClass('active') || $(this).hasClass('disabled')) {
                    return;
                }
                var page = $(this).attr('data-page');
                self.onClick && self.onClick(page);
            });
        },

        _createPager : function() {
            var info = this.info;
            if (info) {
                return;
            }
            var htmlArray = [];
            var maxPage = info.maxPage;
            if (maxPage > 1) {
                var pages = info.pages;
                var page = info.page;
                var prevClass = '';
                if (!info.prev) {
                    prevClass = ' class="disabled"';
                }
                htmlArray.push('<li' + prevClass + ' data-page="' + info.prev + '"><a href="javascript:void(0)">&laquo;</a></li>');
                if (info.startPage > 1) {
                    htmlArray.push('<li data-page="1"><a href="javascript:void(0)">1...</a>');
                }

                for (var i = 0, len = pages.length; i < len; ++i) {
                    var pageIndex = pages[i];
                    var className = '';
                    if (pageIndex == page) {
                        className = ' class="active"';
                    };
                    htmlArray.push('<li' + className + ' data-page="' + pageIndex + '"><a href="javascript:void(0)">' +
                        pageIndex + '</a></li>');
                }

                var endPage = info.endPage;
                if (endPage < maxPage) {
                    htmlArray.push('<li data-page="' + maxPage + '"><a href="javascript:void(0)">...' + maxPage + '</a></li>');
                }

                var next = info.next;
                var nextClass = '';
                if (!next) {
                    nextClass += ' class="disabled"';
                }
                htmlArray.push('<li' + nextClass + ' data-page="' + next + '"><a href="javascript:void(0)">&raquo;</a></li>');
            }
            this.$domNode.html(htmlArray.join(''));
        },

        _setInfoAttr : function(info) {
            this.info = info;
            this.$domNode.empty();
            this._createPageBox();
        }
    });
});
