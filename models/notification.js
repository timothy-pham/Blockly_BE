const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'error', 'success', 'default'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    meta_data: {
        type: Object
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

notificationSchema.plugin(AutoIncrement, { inc_field: 'notification_id' });
module.exports = mongoose.model('Notification', notificationSchema);