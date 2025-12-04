const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    age: Number,
    email: String,
    phone: String,
    location: String,
    hobbies: [String],
    availability: {
        monday: { morning: Boolean, afternoon: Boolean, evening: Boolean },
        tuesday: { morning: Boolean, afternoon: Boolean, evening: Boolean },
        wednesday: { morning: Boolean, afternoon: Boolean, evening: Boolean },
        thursday: { morning: Boolean, afternoon: Boolean, evening: Boolean },
        friday: { morning: Boolean, afternoon: Boolean, evening: Boolean },
        saturday: { morning: Boolean, afternoon: Boolean, evening: Boolean },
        sunday: { morning: Boolean, afternoon: Boolean, evening: Boolean }
    },
    tier: {
        type: String,
        default: 'free'
    }
});

module.exports = mongoose.model('User', userSchema);

