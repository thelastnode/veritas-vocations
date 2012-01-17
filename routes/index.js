var models = require('../lib/models');

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

    var user = new models.User({
        timestamp: new Date(),
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
            find_match(user);
        });
        res.redirect('/thanks');
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

    app.post('/signup', signup_post);
};
