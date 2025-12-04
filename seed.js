const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const hobbiesList = ['hiking', 'reading', 'gaming', 'cooking', 'music', 'sports', 'movies', 'travel', 'art', 'fitness'];
const locations = ['Boston, MA', 'Cambridge, MA', 'Somerville, MA', 'Brookline, MA', 'Newton, MA'];
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Blake', 'Drew'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];

function getRandomItems(arr, count) {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await User.deleteMany({});
        console.log('Cleared existing users');

        const users = [];

        for (let i = 0; i < 50; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            
            const user = {
                name: `${firstName} ${lastName}`,
                age: getRandomInt(20, 45),
                email: `${firstName.toLowerCase()}${i}@email.com`,
                phone: `555-${String(getRandomInt(100, 999))}-${String(getRandomInt(1000, 9999))}`,
                location: locations[Math.floor(Math.random() * locations.length)],
                hobbies: getRandomItems(hobbiesList, getRandomInt(2, 5)),
                availability: {
                    monday: { morning: Math.random() > 0.6, afternoon: Math.random() > 0.5, evening: Math.random() > 0.4 },
                    tuesday: { morning: Math.random() > 0.6, afternoon: Math.random() > 0.5, evening: Math.random() > 0.4 },
                    wednesday: { morning: Math.random() > 0.6, afternoon: Math.random() > 0.5, evening: Math.random() > 0.4 },
                    thursday: { morning: Math.random() > 0.6, afternoon: Math.random() > 0.5, evening: Math.random() > 0.4 },
                    friday: { morning: Math.random() > 0.7, afternoon: Math.random() > 0.5, evening: Math.random() > 0.3 },
                    saturday: { morning: Math.random() > 0.4, afternoon: Math.random() > 0.3, evening: Math.random() > 0.3 },
                    sunday: { morning: Math.random() > 0.4, afternoon: Math.random() > 0.3, evening: Math.random() > 0.5 }
                },
                tier: 'free'
            };

            users.push(user);
        }

        await User.insertMany(users);
        console.log('Created 50 users');

        const demoUser = new User({
            _id: new mongoose.Types.ObjectId('000000000000000000000001'),
            name: 'Demo User',
            age: 25,
            email: 'demo@email.com',
            phone: '555-123-4567',
            location: 'Boston, MA',
            hobbies: ['hiking', 'gaming', 'music'],
            availability: {
                monday: { morning: false, afternoon: false, evening: false },
                tuesday: { morning: false, afternoon: false, evening: false },
                wednesday: { morning: false, afternoon: true, evening: true },
                thursday: { morning: false, afternoon: true, evening: true },
                friday: { morning: false, afternoon: true, evening: true },
                saturday: { morning: true, afternoon: true, evening: true },
                sunday: { morning: true, afternoon: true, evening: false }
            },
            tier: 'free'
        });
        await demoUser.save();
        console.log('Created demo user with ID:', demoUser._id);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();

