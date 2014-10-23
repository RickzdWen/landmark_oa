/**
 * Created by rick on 2014/10/23.
 */

module.getPagerInfo = function(page, maxPage, reqUrl, params) {
    var info = {
        page : page,
        maxPage : maxPage,
        prev : page > 1 ? (page - 1) : 0,
        next : page < maxPage ? (page + 1) : 0,
        last : maxPage,
        url : '#'
    };

    var pageBarLen = 5;
    var pageBeforeHalf = Math.floor(pageBarLen * 0.3);
    var startPage = Math.max(page - pageBeforeHalf + 1, 1);
    pageBeforeHalf = page - startPage + 1;
    var pageAfterHalf = pageBarLen - pageBeforeHalf + 1;
    var endPage = Math.min(page + pageAfterHalf - 1, maxPage);
    pageAfterHalf = endPage - page;
    if (endPage - startPage + 1 < pageBarLen) {
        startPage = Math.max(page - (pageBarLen - pageAfterHalf) + 1, 1);
        pageBeforeHalf = page - startPage + 1;
    }

    var pages = [];
    for (var i = startPage; i <= endPage; ++i) {
        pages.push(i);
    }
    info.startPage = startPage;
    info.endPage = endPage;
    info.pages = pages;

    if (reqUrl) {
        info.url = reqUrl + '?' + getUrlParams(params) + 'page=' + page;
    }
    return info;
};

function getUrlParams(params) {
    var str = '';
    params = params || {};
    for (var i in params) {
        str += i + '=' + params[i] + '&';
    }
    return str;
}
