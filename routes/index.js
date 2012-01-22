var fs = require('fs');

var models = require('../lib/models');
var email = require('../lib/email');
var conf = require('../conf');

var CONFIRM_EMAIL = fs.readFileSync('views/confirm.txt', 'utf8');
var MATCH_FOUND = fs.readFileSync('views/match.txt', 'utf8');

var send_confirm_email = function(user) {
    var body = CONFIRM_EMAIL.replace('URL_CONFIRM', 'http://' + conf.domain + '/confirm/' + user.id).replace('URL_DELETE', 'http://' + conf.domain + '/delete/' + user.id);
    email.send({
        to: user.email,
        subject: 'Veritas Vocations Verification',
        body: body,
    }, function(err, success) {
        if (!success) {
            console.error(err);
        }
    });
};

var find_match = function(user) {
    console.log('Finding match for ' + user.name); // TODO
};

var signup_post = function(req, res, next) {
    if (!req.body.name || !req.body.email || !req.body.house
            || !req.body.year) {
        return res.render('signup', {
            form: req.body,
            errors: ['Make sure to fill out everything!'],
        });
    }
    if (!req.body.areas || !req.body.areas.length
           || req.body.areas.length == 0) {
        return res.render('signup', {
            form: req.body,
            errors: ['You need to pick at least one area of study!'],
        });
    }
    var SUFFIX = '@college.harvard.edu';
    if (req.body.email.indexOf(SUFFIX)
            != req.body.email.length - SUFFIX.length) {
        return res.render('signup', {
            form: req.body,
            errors: ['You must use an @college.harvard.edu email'],
        });
    }

    models.User.findOne({email: req.body.email}, function(err, user) {
        if (err) return next(err);
        if (user != null) {
            return res.render('thanks', {
                already_registered: true,
                verified: user.verified,
            });
        }
        
        var user = new models.User({
            register_timestamp: new Date(),
            name: req.body.name,
            email: req.body.email,
            year: req.body.year,
            location: req.body.house,
            near_only: req.body.near_only,
            areas: req.body.areas,
        });

        user.save(function(err) {
            if (err) {
                next(err);
            }
            process.nextTick(function() {
                send_confirm_email(user);
            });
            res.render('thanks', {
                already_registered: false,
                verified: false,
            }); 
        });
    });
};

var confirm_email = function(req, res, next) {
    models.User.findOne(req.params.id, function(err, user) {
        if (err) return next(err);
        if (!user) return res.send(404);

        user.verified = true;
        user.confirm_timestamp = new Date();
        user.save();

        res.render('thanks', {
            already_registered: false,
            verified: true,
        });

        process.nextTick(function() {
            find_match(user);
        });
    });
};

var delete_email = function(req, res, next) {
    models.User.findOne(req.params.id, function(err, user) {
        if (err) return next(err);
        if (!user) return res.send(404);

        user.remove();

        res.render('delete');
    });
};

exports.registerOn = function(app) {
    app.get('/', function(req, res) {
        res.render('index');
    });

    app.get('/signup', function(req, res) {
        res.render('signup', {
            form: {},
        });
    });

    app.get('/confirm/:id', confirm_email);
    app.get('/delete/:id', delete_email);

    app.post('/signup', signup_post);
};
