/**
 * Created by Administrator on 2015/1/10.
 */
global.ROOT_PATH = __dirname + '/..';
global.DB_CONFIG_FILE = ROOT_PATH + '/configs/dbConfig';
var ProductModel = require('../models/ProductModel');
var SalesProductModel = require('../models/SalesProductModel');
var SalesProductRelationModel = require('../models/SalesProductRelationModel');
var CommonError = require('../libs/errors/CommonError');
var q = require('q');

ProductModel.getInstance().getAll('sid=?', [0]).then(function(rows){
    if (rows) {
        rows.forEach(function(product){
            SalesProductModel.getInstance().addNewOne({
                discount : 100
            }).then(function(sret){
                q.all([
                    ProductModel.getInstance().update({sid:sret.insertId}, 'id=?', [product.id]),
                    SalesProductRelationModel.getInstance().addNewRelation({
                        pid : product.id,
                        sid : sret.insertId,
                        qty : 1
                    })
                ]).then(function(){
                    console.log(product.id + '  done!');
                }, function(){
                    console.log(product.id + '  fail!');
                });
            }, function(){
                console.log(product.id + '  addSalesProduct fail!');
            });
        });
    }
}, function(err){
    console.log(err.getManager());
});
