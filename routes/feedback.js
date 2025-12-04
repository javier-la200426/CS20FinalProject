const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

router.post('/', async (req, res) => {
    try {
        const { eventId, userId } = req.body;
        
        const existingFeedback = await Feedback.findOne({ eventId, userId });
        if (existingFeedback) {
            return res.status(400).json({ error: 'Feedback already submitted for this event' });
        }
        
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/check/:userId/:eventId', async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ 
            userId: req.params.userId,
            eventId: req.params.eventId
        });
        res.json({ hasFeedback: !!feedback, feedback });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/event/:eventId', async (req, res) => {
    try {
        const feedback = await Feedback.find({ eventId: req.params.eventId });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
