const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

router.get('/user/:userId', async (req, res) => {
    try {
        const event = await Event.findOne({ 
            'groupMembers.userId': req.params.userId 
        }).sort({ createdAt: -1 });
        
        if (event) {
            const userMember = event.groupMembers.find(
                m => m.userId.toString() === req.params.userId
            );
            const response = {
                ...event.toObject(),
                userStatus: userMember ? userMember.status : 'pending',
                stats: {
                    total: event.groupMembers.length,
                    accepted: event.groupMembers.filter(m => m.status === 'accepted').length,
                    declined: event.groupMembers.filter(m => m.status === 'declined').length,
                    pending: event.groupMembers.filter(m => m.status === 'pending').length
                }
            };
            res.json(response);
        } else {
            res.json(null);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/generate', async (req, res) => {
    try {
        const { userId } = req.body;
        const currentUser = await User.findById(userId);
        
        const existingEvent = await Event.findOne({
            'groupMembers.userId': userId
        }).sort({ createdAt: -1 });
        
        if (existingEvent) {
            return res.json(existingEvent);
        }
        
        const matchingUsers = await User.find({
            _id: { $ne: userId },
            hobbies: { $in: currentUser.hobbies }
        }).limit(4);

        const groupMembers = [
            { userId: userId, status: 'pending' },
            ...matchingUsers.map(u => ({ userId: u._id, status: 'pending' }))
        ];

        const event = new Event({
            activityName: 'Activity will be generated',
            activityDescription: 'Description pending',
            location: currentUser.location,
            scheduledTime: '2:00 PM',
            scheduledDate: 'Saturday',
            groupMembers: groupMembers
        });

        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/accept/:userId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const memberIndex = event.groupMembers.findIndex(
            m => m.userId.toString() === req.params.userId
        );
        
        if (memberIndex !== -1) {
            event.groupMembers[memberIndex].status = 'accepted';
            await event.save();
        }
        
        const response = {
            ...event.toObject(),
            userStatus: 'accepted',
            stats: {
                total: event.groupMembers.length,
                accepted: event.groupMembers.filter(m => m.status === 'accepted').length,
                declined: event.groupMembers.filter(m => m.status === 'declined').length,
                pending: event.groupMembers.filter(m => m.status === 'pending').length
            }
        };
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/decline/:userId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const memberIndex = event.groupMembers.findIndex(
            m => m.userId.toString() === req.params.userId
        );
        
        if (memberIndex !== -1) {
            event.groupMembers[memberIndex].status = 'declined';
            await event.save();
        }
        
        const response = {
            ...event.toObject(),
            userStatus: 'declined',
            stats: {
                total: event.groupMembers.length,
                accepted: event.groupMembers.filter(m => m.status === 'accepted').length,
                declined: event.groupMembers.filter(m => m.status === 'declined').length,
                pending: event.groupMembers.filter(m => m.status === 'pending').length
            }
        };
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/reset-all', async (req, res) => {
    try {
        await Event.deleteMany({});
        res.json({ message: 'All events deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
