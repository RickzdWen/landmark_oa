/**
 * Created by zhangyun on 14-8-17.
 */
var mysql = require('mysql');
var dbConfig = require(DB_CONFIG_FILE);
var pools = {};

var manager = {
    getPool : function(db) {
        if (pools[db]) {
            return pools[db];
        }
        pools[db] = mysql.createPool(dbConfig[db]);
        return pools[db];
    },

    releasePool : function(db) {
        pools[db] && pools[db].end();
    },

    releaseAllPool : function() {
        for (var db in pools) {
            this.releasePool(db);
        }
    }
};

module.exports = manager;
