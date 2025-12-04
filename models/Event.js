const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    activityName: String,
    activityDescription: String,
    location: String,
    scheduledTime: String,
    scheduledDate: String,
    groupMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);

