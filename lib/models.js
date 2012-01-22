var mongoose = require('mongoose');

var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;

var User = new Schema({
    register_timestamp: {
        type: Date,
        index: true,
        required: true,
    },
    confirm_timestamp: {
        type: Date,
        index: true,
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
    near_only: {
        type: Boolean,
        default: false,
    },
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
    first: {
        type: ObjectId,
        ref: 'Completed',
    },
    second: {
        type: ObjectId,
        ref: 'Completed',
    },
    time: Date,
});

exports.User = mongoose.model('User', User);
exports.Completed = mongoose.model('Completed', User);
exports.Matching = mongoose.model('Matching', Matching);
