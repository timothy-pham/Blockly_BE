const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ticketSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    messages: {
        type: [{
            type: {
                type: String,
                required: true,
                enum: ['request', 'response'],
            },
            message: {
                type: String,
                required: true
            },
            meta_data: {
                type: Object
            },
            send_at: {
                type: Date,
                default: Date.now
            },
            timestamp: {
                type: Number,
                required: true
            }
        }],
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['open', 'responded', 'closed'],
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

ticketSchema.plugin(AutoIncrement, { inc_field: 'ticket_id' });
module.exports = mongoose.model('Ticket', ticketSchema);