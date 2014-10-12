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
    pool.getConnection(function(err, connection){
        if (err) {
            defered.reject(new CommonError(err));
        } else {
            connection.query(sql, cond, function(err, rows){
                if (err) {
                    defered.reject(new CommonError(err));
                } else {
                    defered.resolve(rows);
                }
                connection.release();
//                pool.end();
            });
        }
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
        pool.getConnection(function(err, connection){
            if (err) {
                defered.reject(new CommonError(err));
            } else {
                cond = cond || [];
//                connection.query('SET NAMES utf8', [], function(){});
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

module.exports = ModelBase;
