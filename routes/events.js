const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

router.get('/user/:userId', async (req, res) => {
    try {
        const event = await Event.findOne({ 
            groupMembers: req.params.userId 
        }).sort({ createdAt: -1 });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/generate', async (req, res) => {
    try {
        const { userId } = req.body;
        const currentUser = await User.findById(userId);
        
        const matchingUsers = await User.find({
            _id: { $ne: userId },
            hobbies: { $in: currentUser.hobbies }
        }).limit(4);

        const allMembers = [userId, ...matchingUsers.map(u => u._id)];

        const event = new Event({
            activityName: 'Activity will be generated',
            activityDescription: 'Description pending',
            location: currentUser.location,
            scheduledTime: '2:00 PM',
            scheduledDate: 'Saturday',
            groupMembers: allMembers,
            status: 'pending'
        });

        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/accept', async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id, 
            { status: 'accepted' }, 
            { new: true }
        );
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/decline', async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id, 
            { status: 'declined' }, 
            { new: true }
        );
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

