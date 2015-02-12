/**
 * Created by Administrator on 2015/1/10.
 */

var ProductModel = require(ROOT_PATH + '/models/ProductModel');
var SalesProductModel = require(ROOT_PATH + '/models/SalesProductModel');
var SalesProductRelationModel = require(ROOT_PATH + '/models/SalesProductRelationModel');
var BrandModel = require(ROOT_PATH + '/models/BrandModel');
var q = require('q');
var numeral = require('numeral');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

exports.getHomeProductList = function(lang) {
    lang = lang || 'us';
    var defer = q.defer();
    q.all([
        ProductModel.getInstance().getByPage('published=? AND deleted=? ORDER BY updated DESC', [1, 0], '*', 1, 8),
        BrandModel.getInstance().getAllMap()
    ]).then(function(resArray){
        var products = resArray[0].result;
        var brands = resArray[1];
        defer.resolve(mergeProductAndBrand(products, brands, lang));
    }, function(err){
        defer.reject(err);
    });
    return defer.promise;
};

exports.getLatestSpecialOffers = function(lang) {
    lang = lang || 'us';
    var defer = q.defer();
    SalesProductModel.getInstance().getByPage('special_offer=? AND deleted=? AND published=? ORDER BY updated DESC', [1, 0, 1], '*', 1, 8).
        then(function(res){
            var offers = res.result || [];
            offers.forEach(function(offer){
                offer.price = numeral(offer.price / 1000).format('0.00');
                offer.oprice = numeral(offer.oprice / 1000).format('0.00');
                offer.title = offer['title_' + lang];
            });
            defer.resolve(offers);
        }, function(err){
            defer.reject(err);
        });
    return defer.promise;
};

exports.searchProducts = function(query, lang) {
    var page = query.page || 1;
    var ret = _getSqlAndCond(query, {
        cid : query.cid,
        bid : query.bid
    });
    var defer = q.defer();
    q.all([
        ProductModel.getInstance().getByPage(ret.sql, ret.cond, '*', page, 15),
        BrandModel.getInstance().getAllMap()
    ]).then(function(resArray){
        var info = resArray[0];
        var productsList = info.result;
        var brands = resArray[1];
        var list = mergeProductAndBrand(productsList, brands, lang);
        info.result = list;
        defer.resolve(info);
    }, function(err){
        defer.reject(err);
    });
    return defer.promise;
};

exports.searchSpecialOffers = function(query, lang) {
    var page = query.page || 1;
    var pid = query.pid;
    var defer = q.defer();
    if (pid) {
        SalesProductRelationModel.getInstance().getAll('pid=? GROUP BY sid', [pid], 'sid').then(function(rows){
            rows = rows || [];
            var ret = [];
            rows.forEach(function(item){
                ret.push(item.sid);
            });
            defer.resolve(ret);
        }, function(err){
            defer.reject(err);
        });
    } else {
        defer.resolve(null);
    }

    var defer2 = q.defer();
    defer.promise.then(function(rows){
        var ret = _getSqlAndCond(query, {
            id : rows,
            special_offer : 1
        });
        SalesProductModel.getInstance().getByPage(ret.sql, ret.cond, '*', page, 15).then(function(info){
            info.result = getSimpleSpecialOffers(info.result, lang);
            defer2.resolve(info);
        }, function(err){
            defer2.reject(err);
        });
    }, function(err){
        defer2.reject(err);
    });
    return defer2.promise;
};

function _getSqlAndCond(query, params) {
    var sortBy = query.sort_by;
    var sortDirect = query.sort_direct;
    var priceLeft = query.price_left;
    var priceRight = query.price_right;

    switch (sortBy) {
        case 'p' :
            sortBy = 'price';
            break;
        default :
            sortBy = 'created';
            break;
    }

    if (sortDirect) {
        sortDirect = 'ASC';
    } else {
        sortDirect = 'DESC';
    }
    var sql = 'published=? AND deleted=?';
    var cond = [1, 0];
    params = params || {};
    var util = require('util');
    for (var key in params) {
        if (params[key]) {
            if (util.isArray(params[key]) && params[key].length > 0) {
                sql += ' AND ' + key + ' IN (\'' + params[key].join('\',\'') + '\')';
            } else {
                sql += ' AND ' + key + '=?';
                cond.push(params[key]);
            }
        }
    }
    if (!isNaN(priceLeft) && !isNaN(priceRight)) {
        sql += ' AND price BETWEEN ? AND ?';
        cond.push(priceLeft * 1000);
        cond.push(priceRight * 1000);
    }
    sql += ' ORDER BY ' + sortBy + ' ' + sortDirect;
    return {
        sql : sql,
        cond : cond
    };
}

function mergeProductAndBrand(products, brands, lang) {
    var ret = [];
    products = products || [];
    products.forEach(function(product){
        var obj = {};
        obj.name = product['name_' + lang];
        var brand = product.bid && brands[product.bid];
        if (brand) {
            obj.brand = brand['name_' + lang];
        }
        obj.price = numeral(product.price / 1000).format('0.00');
        obj.id = product.id;
        obj.img_version = product.img_version;
        obj.cid = product.cid;
        obj.bid = product.bid;
        obj.qty = product.qty;
        obj.sid = product.sid;
        ret.push(obj);
    });
    return ret;
}

function getSimpleSpecialOffers(offers, lang) {
    var ret = [];
    offers = offers || [];
    offers.forEach(function(offer){
        var obj = {};
        obj.name = offer['title_' + lang];
        obj.price = numeral(offer.price / 1000).format('0.00');
        obj.oprice = numeral(offer.oprice / 1000).format('0.00');
        obj.id = offer.id;
        obj.img_version = offer.img_version;
        ret.push(obj);
    });
    return ret;
}

exports.getOneProductInfo = function(id, lang) {
    var defer = q.defer();
    ProductModel.getInstance().getOne('id=? AND published=? AND deleted=?', [id, 1, 0]).then(function(product){
        if (!product) {
            defer.reject(new CommonError('', 50005));
        } else {
            product['name'] = product['name_' + lang];
            product['feature'] = product['feature_' + lang];
            product['parameters'] = product['parameters_' + lang];
            product['summary'] = product['summary_' + lang];
            product['usage'] = product['usage_' + lang];
            product['price_s'] = numeral(product.price / 1000).format('0.00');
            defer.resolve(product);
        }
    }, function(err){
        defer.reject(err);
    });
    return defer.promise;
};

exports.getRelatedSpecialOffers = function(pid, lang) {
    var defer = q.defer();
    SalesProductRelationModel.getInstance().getAll('pid=?', [pid], 'sid').then(function(rels){
        rels = rels || [];
        if (!rels.length) {
            defer.resolve([]);
        } else {
            var sql = 'published=? AND deleted=? AND id IN (';
            var sids = rels.map(function(rel){
                return rel.sid;
            });
            sql += sids.join(',') + ')';
            SalesProductModel.getInstance().getAll(sql, [1, 0]).then(function(offers){
                defer.resolve(getSimpleSpecialOffers(offers, lang));
            }, function(err){
                next(err);
            });
        }
    }, function(err){
        defer.reject(err);
    });
    return defer.promise;
};

exports.getOneSpecialOfferInfo = function(sid, lang) {
    var defer = q.defer();
    SalesProductModel.getInstance().getOne('id=? AND special_offer=? AND published=? AND deleted=?', [sid, 1, 1, 0]).then(function(offer){
        if (!offer) {
            defer.reject(new CommonError('', 50005));
        } else {
            offer.title = offer['title_' + lang];
            offer.desc = offer['desc_' + lang];
            offer.oprice = numeral(offer.oprice / 1000).format('0.00');
            offer.price = numeral(offer.price / 1000).format('0.00');
            defer.resolve(offer);
        }
    }, function(err){
        defer.reject(err);
    });
    return defer.promise;
};

exports.getRelatedProducts = function(sid, lang) {
    var defer = q.defer();
    SalesProductRelationModel.getInstance().getAll('sid=?', [sid]).then(function(rels){
        rels = rels || [];
        if (!rels.length) {
            defer.resolve([]);
        } else {
            var sql = 'published=? AND deleted=? AND id IN (';
            var pids = [];
            var numMap = {};
            rels.forEach(function(rel){
                pids.push(rel.pid);
                numMap[rel.pid] = rel.qty;
            });
            sql += pids.join(',') + ')';
            ProductModel.getInstance().getAll(sql, [1, 0]).then(function(products){
                products = products || [];
                products.forEach(function(product){
                    product.name = product['name_' + lang];
                    product.relQty = numMap[product.id] || 0;
                });
                defer.resolve(products);
            }, function(err){
                defer.reject(err);
            });
        }
    }, function(err){
        defer.reject(err);
    });
    return defer.promise;
};

exports.calculateOPrice = function(sid) {
    var defer = q.defer();
    SalesProductRelationModel.getInstance().getRelationsBySid(sid).then(function(rows){
        rows = rows || [];
        var pidArray = [];
        var numMap = {};
        rows.forEach(function(row){
            pidArray.push(row.pid);
            numMap[row.pid] = row.qty;
        });
        var oPrice = 0;
        var defer2 = q.defer();
        if (pidArray.length) {
            ProductModel.getInstance().getAll('id IN (\'' + pidArray.join('\',\'') + '\')').then(function(products){
                products = products || [];
                products.forEach(function(product){
                    oPrice += product.price * numMap[product.id];
                });
                oPrice = +oPrice.toFixed(0);
                defer2.resolve(oPrice);
            }, function(err){
                defer2.reject(err);
            });
        } else {
            defer2.resolve(oPrice);
        }
        defer2.promise.then(function(oPrice){
            SalesProductModel.getInstance().update({
                oprice : oPrice
            }, 'id=?', [sid]).then(function(){
                defer.resolve(oPrice);
            }, function(err){
                defer.reject(err);
            });
        }, function(err){
            defer.reject(err);
        });
    }, function(err){
        defer.reject(err);
    });
    return defer.promise;
};

exports.calculateRelatedSpecialOffersOPrice = function(pid) {
    var defer = q.defer();
    SalesProductRelationModel.getInstance().getAll('pid=?', [pid]).then(function(rows){
        rows = rows || [];
        var sidArray = rows.map(function(row){
            return row.sid;
        });
        if (sidArray.length) {
            SalesProductModel.getInstance().getAll('id IN (\'' + sidArray.join(',') + '\') AND ' +
                'special_offer=? AND published=? AND deleted=?', [1, 1, 0]).then(function(offers){
                offers = offers || [];
                var searchs = offers.map(function(offer){
                    return exports.calculateOPrice(offer.id);
                });
                q.all(searchs).then(function(resArray){
                    defer.resolve(resArray);
                }, function(err){
                    defer.reject(err);
                });
            }, function(err){
                defer.reject(err);
            });
        } else {
            defer.resolve();
        }
    }, function(err){
        defer.reject(err);
    });
    return defer.promise;
};

exports.getCertificates = function(lang){
    var delay = q.defer();
    ProductModel.getInstance().getAll('cimg_version!=0', []).then(function(rows){
        rows = rows || [];
        rows.forEach(function(item){
            item.name = item['name_' + lang];
        });
        delay.resolve(rows);
    }, function(err){
        delay.reject(err);
    });
    return delay.promise;
};
