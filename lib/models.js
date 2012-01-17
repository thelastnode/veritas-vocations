var mongoose = require('mongoose');

var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;

var User = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    near_only: Boolean,
});

var Request = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
    },
    verified: Boolean,
});

var Matching = new Schema({
    user: {
        first: {
            type: ObjectId,
            ref: 'User',
        },
        second: {
            type: ObjectId,
            ref: 'User',
        },
    },
    time: Date,
});

exports.User = mongoose.model('User', User);
exports.Request = mongoose.model('Request', Request);
exports.Matching = mongoose.model('Matching', Matching);
