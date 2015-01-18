/**
 * Created by Administrator on 2015/1/18.
 */

global.ROOT_PATH = __dirname + '/..';
global.DB_CONFIG_FILE = ROOT_PATH + '/configs/dbConfig';
var SalesProductModel = require(ROOT_PATH + '/models/SalesProductModel');
var ProductService = require(ROOT_PATH + '/services/ProductService');
var poolManager = require(ROOT_PATH + '/models/poolManager');
var q = require('q');

SalesProductModel.getInstance().getAll('special_offer=? AND deleted=?', [1, 0]).then(function(rows){
    rows = rows || [];
    var processes = rows.map(function(row){
        return ProductService.calculateOPrice(row.id);
    });
    q.all(processes).then(function(resArray){
        console.log('done!');
        console.log(resArray);
    }, function(err){
        console.log(err);
    }).fin(function(){
        poolManager.releaseAllPool();
    });
}, function(err){
    console.log(err);
    poolManager.releaseAllPool();
});
