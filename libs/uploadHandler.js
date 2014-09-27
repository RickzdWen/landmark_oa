/**
 * Created by rick on 2014/9/27.
 */

var busboy = require('connect-busboy');

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

            req.busboy.on('file', function(fieldName, file, fileName, encoding, mimeType){
                if (!/^image\//.test(mimeType)) {
                    file.resume();
                    delay.reject();
                    return;
                }
                !targetName && (targetName = fileName);
                var fileDelay = q.defer();
                file.on('end', function(){
                    file.truncated ? fileDelay.reject() : fileDelay.resolve();
                });
                var writeStream = fs.createWriteStream(targetPath + '/' + targetName);
                file.pipe(writeStream);
                writeStream.on('close', function(){
                    fileDelay.promise.then(function(){
                        delay.resolve();
                    }, function(){
                        fs.unlink(targetPath + '/' + targetName);
                        delay.reject();
                    });
                });
            });

            req.busboy.on('field', function(fieldName, val, valTruncated, keyTruncated){
                fields[fieldName] = val;
            });

            req.busboy.on('finish', function(){
                delay.promise.then(function(){
                    cb && cb(targetPath + '/' + targetName, fields);
                }, function(error){
                    errCb && errCb(error);
                })
            });
        });
    }
}
