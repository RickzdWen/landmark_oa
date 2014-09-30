/**
 * Created by rick on 2014/9/27.
 */

var busboy = require('connect-busboy');
var util = require('util');
var uuid = require('node-uuid');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

function getExtension(fileName) {
    var i = fileName.lastIndexOf('.');
    return i < 0 ? '' : fileName.substr(i);
}

module.exports = {
    handle : function(options, req, res, cb) {
        options = options || {};
        options.immediate = true;
        busboy(options)(req, res, cb);
    },

    handleImage : function(options, req, res, cb, errCb) {
        var extend = require('extend');
        var fs = require('fs');
        var q = require('q');
        var opts = {
            limits : {
                fileSize : 10 * 1024 * 1024
            }
        };
        options = options || {};
        var targetPath = options.targetPath;
        var targetName = options.targetName;
        extend(true, opts, options);
        this.handle(opts, req, res, function(){
            var delay = q.defer();
            var fields = {};
            var target = '';
            var extension = '';

            req.busboy.on('file', function(fieldName, file, fileName, encoding, mimeType){
                if (!/^image\//.test(mimeType)) {
                    file.resume();
                    delay.reject(new CommonError('', 51001));
                    return;
                }
                var extension = getExtension(fileName);
                !extension && (extension = '.' + extension);
                var targetFileName = '';
                !targetName && (targetFileName = fileName);
                if (util.isFunction(targetName)) {
                    targetFileName = uuid.v1() + extension;
                }
                var fileDelay = q.defer();
                file.on('end', function(){
                    file.truncated ? fileDelay.reject() : fileDelay.resolve();
                });
                target = targetPath + '/' + targetFileName;
                var writeStream = fs.createWriteStream(target);
                file.pipe(writeStream);
                writeStream.on('close', function(){
                    fileDelay.promise.then(function(){
                        delay.resolve();
                    }, function(){
                        fs.unlink(target);
                        delay.reject('', 51000);
                    });
                });
            });

            req.busboy.on('field', function(fieldName, val, valTruncated, keyTruncated){
                fields[fieldName] = val;
            });

            req.busboy.on('finish', function(){
                delay.promise.then(function(){
                    if (util.isFunction(targetName)) {
                        var newName = targetName(fields);
                        fs.rename(target, targetPath + '/' + newName + extension);
                    }
                    cb && cb(target, fields);
                }, function(error){
                    errCb && errCb(error);
                });
            });
        });
    }
};
