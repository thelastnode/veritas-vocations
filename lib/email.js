var email = require('mailer');

var conf = require('../conf');

/* opts: to, subject, body */
/* cb: function(err, success) */
exports.send = function(opts, cb) {
    email.send({
        host: conf.sendgrid.host,
        port: conf.sendgrid.port,
        domain: conf.domain,
        to: opts.to,
        from: 'info@' + conf.domain,
        subject: opts.subject,
        body: opts.body,
        authentication: 'login',
        username: conf.sendgrid.username,
        password: conf.sendgrid.password,
    }, cb);
};