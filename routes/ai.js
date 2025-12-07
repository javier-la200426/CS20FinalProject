const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const Event = require('../models/Event');
const User = require('../models/User');

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
});

router.post('/generate-activity', async (req, res) => {
    try {
        const { eventId } = req.body;
        const event = await Event.findById(eventId);
        
        const userIds = event.groupMembers.map(m => m.userId);
        const users = await User.find({ _id: { $in: userIds } });

        // Find hobbies that ALL users share (universal overlap)
        let universalHobbies = users[0].hobbies;
        for (let i = 1; i < users.length; i++) {
            universalHobbies = universalHobbies.filter(hobby => users[i].hobbies.includes(hobby));
        }

        const locations = users.map(user => user.location);
        const uniqueLocations = [...new Set(locations)];

        const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 400,
            messages: [{
                role: 'user',
                content: `Suggest one activity for 5 friends who ALL enjoy: ${universalHobbies.join(', ')}.

User locations: ${uniqueLocations.join(', ')}

IMPORTANT:
1. The activity MUST involve one of the hobbies listed above
2. Find a CENTRAL or CONVENIENT location that works for all users based on their locations
3. Provide a SPECIFIC venue name and exact street address, not just a generic location
4. Choose a location that minimizes travel for everyone

Respond ONLY in this exact format with no extra text:
Activity Name | Short description (1-2 sentences) | Specific Venue Name, Full Street Address | Day and Time

Example: Beach Volleyball | Play volleyball at Carson Beach with amazing ocean views. | Carson Beach, 1 Day Boulevard, Boston, MA 02125 | Saturday 2:00 PM`
            }]
        });

        const response = message.content[0].text;
        const parts = response.split('|').map(p => p.trim());

        const updatedEvent = await Event.findByIdAndUpdate(eventId, {
            activityName: parts[0] || 'Group Activity',
            activityDescription: parts[1] || 'A fun activity for the group',
            location: parts[2] || uniqueLocations[0],
            scheduledTime: parts[3] || '2:00 PM Saturday'
        }, { new: true });

        res.json(updatedEvent);
    } catch (error) {
        console.log('AI Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

