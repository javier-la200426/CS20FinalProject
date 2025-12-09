const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

// pull state from location string (e.g., "Boston, MA" -> "ma")
function getState(location) {
    if (!location) return '';
    const parts = location.split(',');
    if (parts.length < 2) return location.trim().toLowerCase();
    return parts[1].trim().toLowerCase();
}

// count how many hobbies two people share
function countCommonHobbies(arr1, arr2) {
    if (!arr1 || !arr2) return 0;
    return arr1.filter(hobby => arr2.includes(hobby)).length;
}

// check if two people have at least one overlapping time slot
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

// admin endpoint - get all events with member info
router.get('/all', async (req, res) => {
    try {
        const events = await Event.find()
            .populate('groupMembers.userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get a user's event with their status and group stats
router.get('/user/:userId', async (req, res) => {
    try {
        const event = await Event.findOne({
            'groupMembers.userId': req.params.userId
        }).populate('groupMembers.userId', 'name email').sort({ createdAt: -1 });

        if (event) {
            const userMember = event.groupMembers.find(
                m => m.userId._id.toString() === req.params.userId
            );
            
            // get member details with emails
            const memberDetails = event.groupMembers.map(m => ({
                name: m.userId.name,
                email: m.userId.email,
                status: m.status,
                isCurrentUser: m.userId._id.toString() === req.params.userId
            }));
            
            // add user's specific status and overall group stats
            const response = {
                ...event.toObject(),
                userStatus: userMember ? userMember.status : 'pending',
                stats: {
                    total: event.groupMembers.length,
                    accepted: event.groupMembers.filter(m => m.status === 'accepted').length,
                    declined: event.groupMembers.filter(m => m.status === 'declined').length,
                    pending: event.groupMembers.filter(m => m.status === 'pending').length
                },
                memberDetails: memberDetails
            };
            res.json(response);
        } else {
            res.json(null);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// matchmaking algorithm - this is the core of the whole app
router.post('/generate', async (req, res) => {
    try {
        const { userId } = req.body;
        const currentUser = await User.findById(userId);

        // check if user already has an event
        const existingEvent = await Event.findOne({
            'groupMembers.userId': userId
        }).sort({ createdAt: -1 });

        if (existingEvent) {
            return res.json(existingEvent);
        }

        const currentState = getState(currentUser.location);
        const allUsers = await User.find({ _id: { $ne: userId } });

        // hardcoded demo users that we want to prioritize in matches
        const DEMO_USER_IDS = ['000000000000000000000001', '000000000000000000000002'];

        // New algorithm: Build group where ALL members share 2+ hobbies
        // Prioritize demo users, then find matches that maintain universal overlap
        const demoUsers = allUsers.filter(user => DEMO_USER_IDS.includes(user._id.toString()));
        const regularUsers = allUsers.filter(user => !DEMO_USER_IDS.includes(user._id.toString()));
        const usersToCheck = [...demoUsers, ...regularUsers];

        // start with current user's hobbies, narrow down as we add people
        let mustHaveHobbies = [...currentUser.hobbies];
        const matchedUsers = [];

        // try to build a group of up to 4 people
        for (const user of usersToCheck) {
            if (matchedUsers.length >= 4) break;
            if (mustHaveHobbies.length < 2) break; // can't match if we don't have 2+ shared hobbies

            const commonWithMustHave = countCommonHobbies(user.hobbies, mustHaveHobbies);
            const sameState = getState(user.location) === currentState;
            const hasTimeOverlap = hasOverlappingAvailability(user.availability, currentUser.availability);

            // only add user if they share 2+ hobbies with everyone, same state, and have overlapping availability
            if (commonWithMustHave >= 2 && sameState && hasTimeOverlap) {
                matchedUsers.push(user);
                // Update mustHaveHobbies to only hobbies ALL matched users share
                mustHaveHobbies = mustHaveHobbies.filter(hobby => user.hobbies.includes(hobby));
            }
        }

        const matchingUsers = matchedUsers;

        // build the group with current user + matched users
        const groupMembers = [
            { userId: userId, status: 'pending' },
            ...matchingUsers.map(u => ({ userId: u._id, status: 'pending' }))
        ];

        // create event with placeholder info (AI will fill in details later)
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

// user accepts their event invitation
router.put('/:id/accept/:userId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('groupMembers.userId', 'name email');
        const memberIndex = event.groupMembers.findIndex(
            m => m.userId._id.toString() === req.params.userId
        );

        if (memberIndex !== -1) {
            event.groupMembers[memberIndex].status = 'accepted';
            await event.save();
        }

        // get member details with emails
        const memberDetails = event.groupMembers.map(m => ({
            name: m.userId.name,
            email: m.userId.email,
            status: m.status,
            isCurrentUser: m.userId._id.toString() === req.params.userId
        }));

        const response = {
            ...event.toObject(),
            userStatus: 'accepted',
            stats: {
                total: event.groupMembers.length,
                accepted: event.groupMembers.filter(m => m.status === 'accepted').length,
                declined: event.groupMembers.filter(m => m.status === 'declined').length,
                pending: event.groupMembers.filter(m => m.status === 'pending').length
            },
            memberDetails: memberDetails
        };
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// user declines their event invitation
router.put('/:id/decline/:userId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('groupMembers.userId', 'name email');
        const memberIndex = event.groupMembers.findIndex(
            m => m.userId._id.toString() === req.params.userId
        );

        if (memberIndex !== -1) {
            event.groupMembers[memberIndex].status = 'declined';
            await event.save();
        }

        // get member details with emails
        const memberDetails = event.groupMembers.map(m => ({
            name: m.userId.name,
            email: m.userId.email,
            status: m.status,
            isCurrentUser: m.userId._id.toString() === req.params.userId
        }));

        const response = {
            ...event.toObject(),
            userStatus: 'declined',
            stats: {
                total: event.groupMembers.length,
                accepted: event.groupMembers.filter(m => m.status === 'accepted').length,
                declined: event.groupMembers.filter(m => m.status === 'declined').length,
                pending: event.groupMembers.filter(m => m.status === 'pending').length
            },
            memberDetails: memberDetails
        };
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// admin only - delete all events to reset demo
router.delete('/reset-all', async (req, res) => {
    try {
        await Event.deleteMany({});
        res.json({ message: 'All events deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
