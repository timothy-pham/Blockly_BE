const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'student', 'teacher', 'parent'],
        default: 'student'
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    refresh_token: {
        type: String
    },
    meta_data: {
        type: Object,
        default: {}
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    timestamp: {
        type: Number
    }
});

userSchema.plugin(AutoIncrement, { inc_field: 'user_id' });

module.exports = mongoose.model('User', userSchema);
