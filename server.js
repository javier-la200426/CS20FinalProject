const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// let frontend talk to backend from anywhere
app.use(cors());
// parse JSON request bodies
app.use(express.json());
// serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// connect to mongodb - using env variable from the einv flile
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));

// set up all our api routes
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

