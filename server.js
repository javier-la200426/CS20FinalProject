const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));

const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const aiRoutes = require('./routes/ai');
const feedbackRoutes = require('./routes/feedback');

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

