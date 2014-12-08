/**
 * Created by rick on 2014/12/8.
 */

var nodemailer = require('nodemailer');
var extend = require('extend');

var transporter = nodemailer.createTransport({
    service: 'QQ',
    auth: {
        user: 'xxx@example.com',
        pass: 'xxx'
    }
});

var mailOptions = {
    from: 'xxx <xxx@example.com>', // sender address
    to: 'to@example', // list of receivers
    subject: 'test email from landmark website', // Subject line
    text: 'Hello Landmark', // plaintext body
    html: '<b>Hello,this email is sent by backend program of our landmark website for test</b><br>' +
        '<b>if you can receive it,it means that my program run well</b><br>' +
        '<b>thanks, best regards</b><br>' +
        '<b>Zhengdong Wen</b>' // html body
};

exports.sendMail = function(options, cb) {
    var opts = extend(true, {}, mailOptions, options);
    transporter.sendMail(opts, cb);
};