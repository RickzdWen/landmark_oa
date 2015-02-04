/**
 * Created by rick on 2014/9/30.
 */

var util = require('util');
var errorConfig = require(ROOT_PATH + '/configs/errorConfig');

function CommonError(msg, code, constr) {
    if (util.isError(msg)) {
        this.innerError = msg;
        msg = msg.message || msg.code;
    }
    Error.captureStackTrace(this, constr || this);
    this.code = code;
    this.message = this.getMessage() || msg;
}
util.inherits(CommonError, Error);

CommonError.prototype.name = 'Common Error';

CommonError.prototype.getMessage = function() {
    return this.code && errorConfig[this.code];
};

CommonError.prototype.getMessage4Production = function(lang) {
    if (this.code && lang) {
        var error = require(ROOT_PATH + '/configs/error_' + lang);
        return error[this.code] || error.other;
    }
    return this.message;
};

CommonError.prototype.getStack = function() {
    return this.innerError ? this.innerError.stack : this.stack;
};

module.exports = CommonError;
