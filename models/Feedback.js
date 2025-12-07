const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: Number,
    wouldMeetAgain: String,
    interactions: String,
    groupComments: String,
    proposedEvent: String,
    eventComments: String,
    additionalComments: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
