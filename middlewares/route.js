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
    var hasIndex = false;
    fs.readdirSync(dirName).forEach(function(item){
        var filePath = path.join(dirName, item);
        if (isDictionary(filePath)) {
            var viewPath = path.join(viewDirName, item);
            initControllers(filePath, viewPath, trackPath + item.toLowerCase() + '/');
        } else if (/(.+)\.js$/.test(item)) {
            var fileName = RegExp.$1;
            verbose && console.log('loading: ' + filePath);
            verbose && console.log('view dir: ' + viewDirName);
            verbose && console.log('trackPath: ' + trackPath);
//            app.set('views', viewDirName);
            if (fileName == 'index') {
                hasIndex = true;
            } else {
                var controller = require(filePath);
                var app = express();
                var routePath = trackPath + fileName + '/';
                app.use(routePath, controller);
                parentApp.use(app);
                verbose && console.log('routePath: ' + routePath);
            }
        }
    });
    if (hasIndex) {
        var app = express();
        app.use(trackPath, require(path.join(dirName, 'index.js')));
        parentApp.use(app);
    }
}

module.exports = function(parent, options) {
    parentApp = parent;
    verbose = options.verbose;
    var controllerDirName = path.join(ROOT_PATH, 'controllers');
    var viewsDirName = path.join(ROOT_PATH, 'views');
    initControllers(controllerDirName, viewsDirName, '/', verbose);
};