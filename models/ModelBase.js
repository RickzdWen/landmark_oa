/**
 * Created by zhangyun on 14-8-17.
 */
var poolManager = require('./poolManager');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');
var q = require('q');

function ModelBase() {

}

ModelBase.prototype.getOne = function(sql, cond, selector) {
    var defered = q.defer();
    sql = sql || '1<>2';
    this.getAll(sql + ' LIMIT 1', cond, selector).then(function(rows){
        var row = rows && rows[0];
        defered.resolve(row);
    }, function(err){
        defered.reject(err);
    });
    return defered.promise;
};

ModelBase.prototype.getAll = function(sql, cond, selector) {
    var pool = poolManager.getPool(this.rdb);
    sql = sql || '1<>2';
    cond = cond || [];
    selector = selector || '*';
    sql = 'SELECT ' + selector + ' FROM ' + this.table + ' WHERE ' + sql;
    var defered = q.defer();
    var time1 = +new Date();
    pool.getConnection(function(err, connection){
        var time2 = +new Date();
        console.log('getConnection : ' + (time2 - time1) + 'ms');
        if (err) {
            defered.reject(new CommonError(err));
        } else {
            connection.query(sql, cond, function(err, rows){
                console.log(sql);
                var time3 = +new Date();
                console.log('query : ' + (time3 - time2) + 'ms');
                if (err) {
                    defered.reject(new CommonError(err));
                } else {
                    defered.resolve(rows || []);
                }
                connection.release();
//                pool.end();
            });
        }
    });
    return defered.promise;
};

ModelBase.prototype.pageLimit = 20;
ModelBase.prototype.getByPage = function(sql, cond, selector, page, pageLimit) {
    page = +page || 1;
    pageLimit = +pageLimit || this.pageLimit;
    var defered = q.defer();
    var self = this;
    this.getOne(sql, cond, 'COUNT(*) AS count').then(function(row){
        var ret = {};
        var pager = {};
        pager.count = row && row['count'];
        pager.totalPage = Math.ceil(pager.count/ pageLimit);
        page = page > pager.totalPage ? pager.totalPage : page;
        pager.page = page;
        pager.size = pageLimit;
        ret.pager = pager;
        if (pager.totalPage) {
            var from = (page - 1) * pageLimit;
            sql = sql || '1<>2';
            sql += ' LIMIT ' + from + ',' + pageLimit;
            self.getAll(sql, cond, selector).then(function(rows){
                ret.result = rows || [];
                defered.resolve(ret);
            }, function(err){
                defered.reject(err);
            });
        } else {
            defered.resolve(ret);
        }
    }, function(err){
        defered.reject(err);
    });
    return defered.promise;
};

ModelBase.prototype.create = function(data) {
    var pool = poolManager.getPool(this.wdb);
    var sql = 'INSERT INTO ' + this.table + ' SET ?';
    var defered = q.defer();
    pool.getConnection(function(err, connection){
        if (err) {
            defered.reject(new CommonError(err));
        } else {
            connection.query(sql, data, function(err, result){
                if (err) {
                    defered.reject(new CommonError(err));
                } else {
                    defered.resolve(result);
                }
                connection.release();
            });
        }
    });
    return defered.promise;
};

ModelBase.prototype.replace = function(data) {
    var pool = poolManager.getPool(this.wdb);
    var sql = 'REPLACE INTO ' + this.table + ' SET ?';
    var defered = q.defer();
    pool.getConnection(function(err, connection){
        if (err) {
            defered.reject(new CommonError(err));
        } else {
            connection.query(sql, data, function(err, result){
                if (err) {
                    defered.reject(new CommonError(err));
                } else {
                    defered.resolve(result);
                }
                connection.release();
            });
        }
    });
    return defered.promise;
};

ModelBase.prototype.update = function(data, sql, cond) {
    var pool = poolManager.getPool(this.wdb);
    var defered = q.defer();
    var setTmp = [];
    var condTmp = [];
    for (var k in data) {
        setTmp.push(k + '=?');
        condTmp.push(data[k]);
    }
    if (!setTmp.length) {
        defered.reject(new CommonError('', 50002));
    } else {
        sql = sql || '1<>2';
        sql = 'UPDATE ' + this.table + ' SET ' + setTmp.join(',') + ' WHERE ' + sql;
        console.log(sql);
        pool.getConnection(function(err, connection){
            if (err) {
                defered.reject(new CommonError(err));
            } else {
                cond = cond || [];
                connection.query(sql, condTmp.concat(cond), function(err, result){
                    if (err) {
                        defered.reject(new CommonError(err));
                    } else {
                        defered.resolve(result);
                    }
                    connection.release();
                });
            }
        });
    }
    return defered.promise;
};

ModelBase.prototype.delete = function(sql, cond) {
    var pool = poolManager.getPool(this.wdb);
    var defered = q.defer();
    sql = sql || '1<>1';
    cond = cond || [];
    sql = 'DELETE FROM ' + this.table + ' WHERE ' + sql;
    pool.getConnection(function(err, connection){
        if (err) {
            defered.reject(new CommonError(err));
        } else {
            connection.query(sql, cond, function(err, result){
                if (err) {
                    defered.reject(new CommonError(err));
                } else {
                    defered.resolve(result);
                }
                connection.release();
            });
        }
    });
    return defered.promise;
};

ModelBase.prototype.deleteAll = function(sql, cond) {
    return this.delete('1<>2');
};

ModelBase.prototype.getMap = function(rows, key) {
    rows = rows || [];
    var map = {};
    for (var i = 0, len = rows.length; i < len; ++i) {
        var item = rows[i];
        map[item[key]] = item;
    }
    return map;
};

module.exports = ModelBase;
