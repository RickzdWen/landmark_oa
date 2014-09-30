/**
 * Created by rick on 2014/9/30.
 */

define([
    'angular'
], function(angular){
    var module = angular.module('lm.commonService', []);

    module.factory('_getService', ['$q', function($q){
        return function(req) {
            var delay = $q.defer();
            req.success(function(ret){
                if (!ret.code) {
                    delay.resolve(ret);
                } else {
                    delay.reject(ret.message);
                }
            }).error(function(){
                delay.reject('Network Error');
            });
            return delay.promise;
        };
    }]);
});
