/**
 * Created by zhangyun on 14-8-10.
 */

var express = require('express');
var fs = require('fs');
var path = require('path');

var parentApp = null;
var verbose = true;

function isDictionary(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.statSync(filePath).isDirectory();
    }
}

function initControllers(dirName, viewDirName, trackPath) {
    trackPath = trackPath || '/';
    fs.readdirSync(dirName).forEach(function(item){
        var filePath = path.join(dirName, item);
        if (isDictionary(filePath)) {
            var viewPath = path.join(viewDirName, item);
            initControllers(filePath, viewPath, trackPath + item.toLowerCase() + '/');
        } else if (/\.js$/.test(item)) {
            var controller = require(filePath);
            verbose && console.log('loading: ' + filePath);
            var app = express();
            verbose && console.log('view dir: ' + viewDirName);
            verbose && console.log('trackPath: ' + trackPath);
            app.set('views', viewDirName);
            app.use(trackPath, controller);
//            app.use(trackPath, function(req, res, next){
//                console.log('xxxxx');
//                console.log(req.url);
//                if (res._view) {
//                    console.log(res._view);
//                    // 有_view的话认为其需要展现页面
//                    res.render(res._view, {
//                        doc : res.doc
//                    });
//                } else if (res.doc) {
//                    // 有doc的话则返回json数据
//                    console.log('doccc');
//                    res.json(res.doc);
//                    res.end();
//                } else {
//                    // 都没有的话就出错了，交给后面处理
//                    console.log('nnnnn');
//                    next();
//                }
//            });
            parentApp.use(app);
        }
    });
}

module.exports = function(parent, options) {
    parentApp = parent;
    verbose = options.verbose;
    var controllerDirName = path.join(ROOT_PATH, 'controllers');
    var viewsDirName = path.join(ROOT_PATH, 'views');
    initControllers(controllerDirName, viewsDirName, '/', verbose);
};