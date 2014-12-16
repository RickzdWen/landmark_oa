/**
 * Created by rick on 2014/9/27.
 */

var busboy = require('connect-busboy');
var uuid = require('node-uuid');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

module.exports = {
    handleUpload : function(options, req, res, cb) {
        options = options || {};
        options.immediate = true;
        busboy(options)(req, res, cb);
    },

    handleImageUpload : function(options, req, res, cb) {
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
        var self = this;
        this.handleUpload(opts, req, res, function(){
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
                extension = self.getExtension(fileName);
                if ((opts.extension && !opts.extension.test(extension)) || !extension) {
                    file.resume();
                    delay.reject(new CommonError('', 51005));
                    return;
                }
                extension = '.' + extension;
                var targetFileName = '';
                if (!targetName) {
                    targetFileName = fileName
                } else if (typeof targetName == 'function') {
                    targetFileName = uuid.v1() + extension;
                } else {
                    targetFileName = targetName + extension;
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
                        delay.reject(new CommonError('', 51000));
                    });
                });
            });

            req.busboy.on('field', function(fieldName, val, valTruncated, keyTruncated){
                fields[fieldName] = val;
            });

            req.busboy.on('finish', function(){
                delay.promise.then(function(){
                    if (typeof targetName == 'function') {
                        var newName = targetName(fields);
                        var newTarget = targetPath + '/' + newName + extension;
                        fs.rename(target, newTarget, function(err){
                            cb && cb(err && new CommonError(err), newTarget, fields, extension.substr(1));
                        });
                    } else {
                        cb && cb(null, target, fields, extension.substr(1));
                    }
                }, function(error){
                    console.log('error!!');
                    cb && cb(error);
                });
            });
        });
    },

    getExtension : function(fileName) {
        var i = fileName.lastIndexOf('.');
        return i < 0 ? '' : fileName.substr(i + 1);
    },

    handleImageDownload : function(options, req, res, cb) {
        var fs = require('fs');
        var target = options.target;
        var extension = this.getExtension(target);
        fs.lstat(target, function(err, stat){
            if (err) {
                cb && cb(new CommonError(err));
            } else if (stat.isFile()) {
                res.writeHead(200, {
                    'Content-Type' : 'image/' + extension,
                    'Cache-Control': 'max-age=10000000'
                });
                var readStream = fs.createReadStream(target);
                readStream.pipe(res);
            } else {
                cb && cb(new CommonError('', 51003));
            }
        });
    }
};
