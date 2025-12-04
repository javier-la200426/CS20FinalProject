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
        
        const hobbies = users.flatMap(user => user.hobbies);
        const uniqueHobbies = [...new Set(hobbies)];
        const location = users[0].location;

        const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 300,
            messages: [{
                role: 'user',
                content: `Suggest one activity for 5 friends who enjoy: ${uniqueHobbies.join(', ')}. Location: ${location}. 

Respond ONLY in this exact format with no extra text:
Activity Name | Short description (1-2 sentences) | Day and Time

Example: Beach Volleyball | Play volleyball at Carson Beach with amazing ocean views. | Saturday 2:00 PM`
            }]
        });

        const response = message.content[0].text;
        const parts = response.split('|').map(p => p.trim());

        const updatedEvent = await Event.findByIdAndUpdate(eventId, {
            activityName: parts[0] || 'Group Activity',
            activityDescription: parts[1] || 'A fun activity for the group',
            scheduledTime: parts[2] || '2:00 PM Saturday'
        }, { new: true });

        res.json(updatedEvent);
    } catch (error) {
        console.log('AI Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

