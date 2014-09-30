/**
 * Created by zhangyun on 14-8-17.
 */
var mysql = require('mysql');
var path = require('path');
var dbConfig = require(DB_CONFIG_FILE);
var pools = {};

var manager = {
    getPool : function(db) {
        if (pools[db]) {
            return pools[db];
        }
        pools[db] = mysql.createPool(dbConfig[db]);
        return pools[db];
    }
};

module.exports = manager;
