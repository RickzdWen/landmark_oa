var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

global.ROOT_PATH = __dirname;
global.DB_CONFIG_FILE = __dirname + '/configs/dbConfig';
if (/^win/.test(process.platform)) {
    global.DATA_PATH = __dirname + '/../lm_data';
} else {
    global.DATA_PATH = '/lm_data';
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(require(path.join(ROOT_PATH, 'middlewares/loginChecker')).checkOaLogin());

app.use('/landmark_ueditor/ue', require(path.join(ROOT_PATH, 'middlewares/ueditorProcessor'))());

require(path.join(ROOT_PATH, 'middlewares/route'))(app, {
    verbose : false
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    !res.doc && !res._view && next(err);
});

/// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        !err.code && res.status(err.status || 500);
        console.log((err.getStack && err.getStack()) || err.stack);
        if (res._view) {
            res.render('error', {
                message: err.getMessage(),
                error: err
            });
        } else {
            res.json(err);
        }
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if (res._view) {
        res.render('error', {
            message: err.message,
            error: err
        });
    } else {
        res.render(err);
    }
});


//module.exports = app;
app.listen(3000);