var mongoose = require('mongoose');

var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;

var User = new Schema({
    timestamp: {
        type: Date,
        index: true,
        required: true,
    },
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
    areas: {
        type: [String],
        required: true,
    },

    verified: {
        type: Boolean,
        default: false,
    },
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
exports.Completed = mongoose.model('Completed', User);
exports.Matching = mongoose.model('Matching', Matching);
