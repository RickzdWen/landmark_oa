/**
 * Created by Administrator on 2015/4/15.
 */

var paypal_sdk = require('paypal-rest-sdk');
var q = require('q');
var CommonError = require(ROOT_PATH + '/libs/errors/CommonError');

paypal_sdk.configure({
    'host': 'api.sandbox.paypal.com',
    'client_id': 'ATPW5jxAISD1e_RQ5c9ngoZjDI6QoMJujlgt8zvC0yawLCkF35xzKCbPWSM_gwK7Y8b0vYGcGXDRg2iX',
    'client_secret': 'EDA_tSLZRaR6mRmGsUEEgaMP_m0DDvTOuryaabFkyf0-CviVL6_hnm_DO0ntGjqsoXTtp8NpPD6zSGto' });

exports.createPayment = function(data) {
    var details = {
        intent : 'sale',
        payer : {
            payment_method : data.method || 'paypal'
        },
        transactions : [{
            amount : data.amount,
            description : data.desc || 'landmark shop payment'
        }],
        redirect_urls : {
            return_url : data.returnUrl || 'http://localhost:3000/account/paypal/return',
            cancel_url : data.cancelUrl || 'http://localhost:3000/account/paypal/return_cancel'
        }
    };
    var delay = q.defer();
    paypal_sdk.payment.create(details, function(error, payment){
        if (error) {
            delay.reject(error);
        } else {
            delay.resolve(payment);
        }
    });
    return delay.promise;
};

exports.executePayment = function(payerId, paymentId) {
    if (!payerId || !paymentId) {
        throw new CommonError('', 500002);
    }
    var details = {
        pasyer_id : payerId
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
