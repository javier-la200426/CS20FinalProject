const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

router.post('/', async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.json(feedback);
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

