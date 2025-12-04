const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

function getState(location) {
    if (!location) return '';
    const parts = location.split(',');
    if (parts.length < 2) return location.trim().toLowerCase();
    return parts[1].trim().toLowerCase();
}

function countCommonHobbies(arr1, arr2) {
    if (!arr1 || !arr2) return 0;
    return arr1.filter(hobby => arr2.includes(hobby)).length;
}

function hasOverlappingAvailability(avail1, avail2) {
    if (!avail1 || !avail2) return false;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const times = ['morning', 'afternoon', 'evening'];
    
    for (const day of days) {
        for (const time of times) {
            if (avail1[day] && avail2[day] && 
                avail1[day][time] && avail2[day][time]) {
                return true;
            }
        }
    }
    return false;
}

router.get('/all', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
        
        const currentState = getState(currentUser.location);
        const allUsers = await User.find({ _id: { $ne: userId } });
        
        const DEMO_USER_IDS = ['000000000000000000000001', '000000000000000000000002'];
        
        const matchingUsers = allUsers.filter(user => {
            const commonHobbies = countCommonHobbies(user.hobbies, currentUser.hobbies);
            const sameState = getState(user.location) === currentState;
            const hasTimeOverlap = hasOverlappingAvailability(user.availability, currentUser.availability);
            
            return commonHobbies >= 2 && sameState && hasTimeOverlap;
        }).sort((a, b) => {
            const aIsDemo = DEMO_USER_IDS.includes(a._id.toString());
            const bIsDemo = DEMO_USER_IDS.includes(b._id.toString());
            if (aIsDemo && !bIsDemo) return -1; // Demo user goes first
            if (!aIsDemo && bIsDemo) return 1; // Non-demo goes after
            return 0; // Keep same order
        }).slice(0, 4);

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
