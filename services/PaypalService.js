/**
 * Created by Administrator on 2015/4/15.
 */

var paypal_sdk = require('paypal-rest-sdk');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

console.log('config-----------------');
paypal_sdk.configure({
    'host': 'api.sandbox.paypal.com',
    'client_id': 'ATPW5jxAISD1e_RQ5c9ngoZjDI6QoMJujlgt8zvC0yawLCkF35xzKCbPWSM_gwK7Y8b0vYGcGXDRg2iX',
    'client_secret': 'EDA_tSLZRaR6mRmGsUEEgaMP_m0DDvTOuryaabFkyf0-CviVL6_hnm_DO0ntGjqsoXTtp8NpPD6zSGto'
});

exports.createPayment = function(data) {
    var delay = q.defer();
    this.getWebProfileId().then(function(profileId){
        var details = {
            intent : 'sale',
            experience_profile_id : profileId,
            payer : {
                payment_method : data.method || 'paypal',
                payer_info : data.payerInfo
            },
            transactions : [data.transaction],
            redirect_urls : {
                return_url : data.returnUrl || 'http://localhost:3000/account/paypal/return',
                cancel_url : data.cancelUrl || 'http://localhost:3000/account/paypal/return_cancel'
            }
        };
        paypal_sdk.payment.create(details, function(error, payment){
            if (error) {
                console.log(JSON.stringify(error));
                delay.reject(error);
            } else {
                delay.resolve(payment);
            }
        });
    }, function(error){
        console.log(JSON.stringify(error));
        delay.reject(error);
    });

    return delay.promise;
};

exports.executePayment = function(payerId, paymentId, transaction) {
    if (!payerId || !paymentId) {
        throw new CommonError('', 500002);
    }
    var details = {
        payer_id : payerId,
        transactions : [transaction]
    };
    var delay = q.defer();
    paypal_sdk.payment.execute(paymentId, details, function(error, payment){
        if(error){
            delay.reject(error);
        } else {
            delay.resolve(payment);
        }
    });
    return delay.promise;
};

var paypalProfileId = null;
exports.getWebProfileId = function() {
    var delay = q.defer();
    if (paypalProfileId) {
        delay.resolve(paypalProfileId);
    } else {
        paypal_sdk.webProfile.list(function(error, ret){
            if (error) {
                delay.reject(error);
            } else {
                var profiles = ret.filter(function(item){
                    return item.name == 'Landmark Shop';
                });
                if (profiles[0]) {
                    paypalProfileId = profiles[0].id;
                    delay.resolve(paypalProfileId);
                } else {
                    paypal_sdk.webProfile.create({
                        name : 'Landmark Shop',
                        input_fields : {
                            allow_note : true,
                            no_shipping : 1,
                            address_override : 1
                        }
                    }, function(error, ret){
                        if (error) {
                            delay.reject(error);
                        } else {
                            paypalProfileId = ret.id;
                            delay.resolve(paypalProfileId);
                        }
                    });
                }
            }
        });
    }
    return delay.promise;
};

exports.lookupPayment = function(paymentId) {
    if (!paymentId) {
        throw new CommonError('', 50002);
    }
    var delay = q.defer();
    paypal_sdk.payment.get(paymentId, function(error, payment){
        if (error) {
            delay.reject(error);
        } else {
            delay.resolve(payment);
        }
    });
    return delay.promise;
};
