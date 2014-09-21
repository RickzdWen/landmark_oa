/**
 * Created by zhangyun on 14-9-20.
 */

define([
    'landmark/declare'
], function(declare){

    function _Widget(props) {
        this.construct(props);
    }

    _Widget.prototype.construct = function(props) {
        this.preCreate(props);
        this.create();
        this.postCreate();
    };

    _Widget.prototype.preCreate = function(props){
        declare.mixin(this, props);
    };
    _Widget.prototype.create = function(){};
    _Widget.prototype.postCreate = function(){};
    _Widget.prototype.startup = function(){};

    _Widget.prototype.set = function(name, value) {
        if (name) {
            var funcName = name.charAt(0).toUpperCase() + name.slice(1);
            funcName = '_set' + funcName + 'Attr';
            if (this[funcName]) {
                this[funcName](value);
            } else {
                this[name] = value;
            }
        }
    };

    _Widget.prototype.get = function(name) {
        return this[name];
    };

    return _Widget;
});
