var fs = require('fs');

var models = require('../lib/models');
var email = require('../lib/email');
var conf = require('../conf');

var CONFIRM_EMAIL = fs.readFileSync('views/confirm.txt', 'utf8');
var MATCH_FOUND = fs.readFileSync('views/match.txt', 'utf8');

var ONE_DAY = 1000 * 60 * 60 * 24;

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

var send_match_emails = function(user1, user2) {
    var body1 = MATCH_FOUND.replace('X_1', user1.name)
        .replace('X_2', user2.name)
        .replace('X_2EMAIL', user2.email);
    var body2 = MATCH_FOUND.replace('X_1', user2.name)
        .replace('X_2', user1.name)
        .replace('X_2EMAIL', user1.email);

    email.send({
        to: user1.email,
        subject: 'Veritas Vocations Match',
        body: body1,
    }, function(err, success) {
        if (!success) {
            console.error(err);
        }
    });
    email.send({
        to: user2.email,
        subject: 'Veritas Vocations Match',
        body: body2,
    }, function(err, success) {
        if (!success) {
            console.error(err);
        }
    });
};

var find_match = function(user) {
    var areas = [];
    user.areas.map(function(x) {
        areas.push({
            areas: x
        });
    });
    var q = models.User.findOne().or(areas)
        .notEqualTo('_id', user.id)
        .where('verified', true);

    if (user.near_only) {
        q = q.where('location', user.location);
    } else {
        q = q.or([{near_only: false}, {location: user.location}]);
    }

    if (user.year == 'Senior') {
        q = q.where('year', 'Junior');
    } else if (user.year == 'Junior') {
        q = q.or([{year: 'Junior'}, {year: 'Senior'}]);
    } else {
        q = q.where('year', user.year);
    }
    
    q.run(function(err, match) {
            if (err) {
                return console.error(err);
            }
            if (match) {
                // send emails, move users to completed
                send_match_emails(user, match);
                var u1 = new models.Completed({
                    register_timestamp: user.register_timestamp,
                    confirm_timestamp: user.confirm_timestamp,
                    name: user.name,
                    email: user.email,
                    year: user.year,
                    location: user.location,
                    near_only: user.near_only,
                    areas: user.areas,
                    verified: user.verified,
                });
                var u2 = new models.Completed({
                    register_timestamp: match.register_timestamp,
                    confirm_timestamp: match.confirm_timestamp,
                    name: match.name,
                    email: match.email,
                    year: match.year,
                    location: match.location,
                    near_only: match.near_only,
                    areas: match.areas,
                    verified: match.verified,
                });
                u1.save();
                u2.save();
                new models.Matching({
                    first: u1,
                    second: u2,
                    time: new Date(),
                }).save();
                user.remove();
                match.remove();
            }
        });
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
    var SUFFIX1 = '@college.harvard.edu';
    var SUFFIX2 = '@fas.harvard.edu';
    if ((req.body.email.indexOf(SUFFIX1)
            != req.body.email.length - SUFFIX1.length)
            && (req.body.email.indexOf(SUFFIX2)
            != req.body.email.length - SUFFIX2.length)) {
        return res.render('signup', {
            form: req.body,
            errors: ['You must use an @college.harvard.edu or @fas.harvard.edu email'],
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

        models.Completed.find({email: req.body.email}).desc('confirm_timestamp').run(function(err, users) {
            var user = new models.User({
                register_timestamp: new Date(),
                name: req.body.name,
                email: req.body.email,
                year: req.body.year,
                location: req.body.house,
                near_only: req.body.near_only,
                areas: req.body.areas,
            });
            var save_cb = function(err) {
                if (err) {
                    return next(err);
                }
                process.nextTick(function() {
                    send_confirm_email(user);
                });
                res.render('thanks', {
                    already_registered: false,
                    verified: false,
                }); 
            };
            
            if (err) {
                return next(err);
            }
            if (users[0]) {
                var u = users[0];
                return models.Matching.find()
                    .or([{first: u._id}, {second: u._id}])
                    .desc('time')
                    .run(function(err, matches) {
                        if (err) return next(err);
                        if (matches[0]) {
                            var diff = matches[0].time - new Date();
                            if (Math.abs(diff) < ONE_DAY) {
                                return res.render('wait');
                            }
                        }

                        return user.save(save_cb);
                    });
            }

            user.save(save_cb);
        });
    });
};

var confirm_email = function(req, res, next) {
    models.User.findOne({_id: req.params.id}, function(err, user) {
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
    models.User.findOne({_id: req.params.id}, function(err, user) {
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
