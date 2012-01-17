var signup_post = function(req, res) {
    if (!req.body.name || !req.body.email || !req.body.house
            || !req.body.year) {
        return res.render('signup', {
            form: req.body,
            errors: ['Make sure to fill out everything!'],
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
    res.send(404); // TODO
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
