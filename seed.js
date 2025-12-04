const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await User.deleteMany({});
        console.log('Cleared existing users');

        const users = [
            {
                name: 'Taylor Smith',
                age: 24,
                email: 'taylor@email.com',
                phone: '555-111-1111',
                location: 'Boston, MA',
                hobbies: ['hiking', 'gaming', 'reading'],
                availability: {
                    monday: { morning: false, afternoon: false, evening: false },
                    tuesday: { morning: false, afternoon: false, evening: false },
                    wednesday: { morning: false, afternoon: false, evening: false },
                    thursday: { morning: false, afternoon: false, evening: false },
                    friday: { morning: false, afternoon: false, evening: false },
                    saturday: { morning: false, afternoon: true, evening: false },
                    sunday: { morning: false, afternoon: false, evening: false }
                },
                tier: 'free'
            },
            {
                name: 'Morgan Lee',
                age: 29,
                email: 'morgan@email.com',
                phone: '555-222-2222',
                location: 'Cambridge, MA',
                hobbies: ['hiking', 'music', 'cooking'],
                availability: {
                    monday: { morning: false, afternoon: false, evening: false },
                    tuesday: { morning: false, afternoon: false, evening: false },
                    wednesday: { morning: false, afternoon: false, evening: false },
                    thursday: { morning: false, afternoon: false, evening: false },
                    friday: { morning: false, afternoon: false, evening: false },
                    saturday: { morning: false, afternoon: true, evening: false },
                    sunday: { morning: false, afternoon: false, evening: false }
                },
                tier: 'free'
            },
            {
                name: 'Casey Wilson',
                age: 26,
                email: 'casey@email.com',
                phone: '555-333-3333',
                location: 'Somerville, MA',
                hobbies: ['gaming', 'music', 'movies'],
                availability: {
                    monday: { morning: false, afternoon: false, evening: false },
                    tuesday: { morning: false, afternoon: false, evening: false },
                    wednesday: { morning: false, afternoon: false, evening: false },
                    thursday: { morning: false, afternoon: false, evening: false },
                    friday: { morning: false, afternoon: false, evening: false },
                    saturday: { morning: false, afternoon: true, evening: false },
                    sunday: { morning: false, afternoon: false, evening: false }
                },
                tier: 'free'
            },
            {
                name: 'Riley Brown',
                age: 31,
                email: 'riley@email.com',
                phone: '555-444-4444',
                location: 'Newton, MA',
                hobbies: ['hiking', 'gaming', 'fitness'],
                availability: {
                    monday: { morning: false, afternoon: false, evening: false },
                    tuesday: { morning: false, afternoon: false, evening: false },
                    wednesday: { morning: false, afternoon: false, evening: false },
                    thursday: { morning: false, afternoon: false, evening: false },
                    friday: { morning: false, afternoon: false, evening: false },
                    saturday: { morning: false, afternoon: true, evening: false },
                    sunday: { morning: false, afternoon: false, evening: false }
                },
                tier: 'free'
            },
            {
                name: 'Quinn Davis',
                age: 27,
                email: 'quinn@email.com',
                phone: '555-555-5555',
                location: 'Brookline, MA',
                hobbies: ['reading', 'cooking', 'art'],
                availability: {
                    monday: { morning: true, afternoon: false, evening: false },
                    tuesday: { morning: true, afternoon: false, evening: false },
                    wednesday: { morning: false, afternoon: false, evening: false },
                    thursday: { morning: false, afternoon: false, evening: false },
                    friday: { morning: false, afternoon: false, evening: false },
                    saturday: { morning: false, afternoon: false, evening: false },
                    sunday: { morning: false, afternoon: false, evening: false }
                },
                tier: 'free'
            },
            {
                name: 'Avery Garcia',
                age: 23,
                email: 'avery@email.com',
                phone: '555-666-6666',
                location: 'Boston, MA',
                hobbies: ['sports', 'fitness', 'travel'],
                availability: {
                    monday: { morning: false, afternoon: false, evening: true },
                    tuesday: { morning: false, afternoon: false, evening: true },
                    wednesday: { morning: false, afternoon: false, evening: false },
                    thursday: { morning: false, afternoon: false, evening: false },
                    friday: { morning: false, afternoon: false, evening: false },
                    saturday: { morning: false, afternoon: false, evening: false },
                    sunday: { morning: false, afternoon: false, evening: false }
                },
                tier: 'free'
            },
            {
                name: 'Blake Miller',
                age: 30,
                email: 'blake@email.com',
                phone: '555-777-7777',
                location: 'Cambridge, MA',
                hobbies: ['movies', 'gaming', 'music'],
                availability: {
                    monday: { morning: false, afternoon: false, evening: false },
                    tuesday: { morning: false, afternoon: false, evening: false },
                    wednesday: { morning: false, afternoon: true, evening: false },
                    thursday: { morning: false, afternoon: true, evening: false },
                    friday: { morning: false, afternoon: false, evening: false },
                    saturday: { morning: false, afternoon: false, evening: false },
                    sunday: { morning: false, afternoon: false, evening: false }
                },
                tier: 'free'
            },
            {
                name: 'Drew Johnson',
                age: 28,
                email: 'drew@email.com',
                phone: '555-888-8888',
                location: 'Boston, MA',
                hobbies: ['hiking', 'music', 'art'],
                availability: {
                    monday: { morning: false, afternoon: false, evening: false },
                    tuesday: { morning: false, afternoon: false, evening: false },
                    wednesday: { morning: false, afternoon: false, evening: false },
                    thursday: { morning: false, afternoon: false, evening: false },
                    friday: { morning: false, afternoon: false, evening: true },
                    saturday: { morning: false, afternoon: true, evening: false },
                    sunday: { morning: false, afternoon: false, evening: false }
                },
                tier: 'free'
            },
            {
                name: 'Jamie Moore',
                age: 25,
                email: 'jamie@email.com',
                phone: '555-999-9999',
                location: 'Somerville, MA',
                hobbies: ['cooking', 'travel', 'reading'],
                availability: {
                    monday: { morning: false, afternoon: false, evening: false },
                    tuesday: { morning: false, afternoon: false, evening: false },
                    wednesday: { morning: false, afternoon: false, evening: false },
                    thursday: { morning: false, afternoon: false, evening: false },
                    friday: { morning: false, afternoon: false, evening: false },
                    saturday: { morning: true, afternoon: false, evening: true },
                    sunday: { morning: true, afternoon: false, evening: false }
                },
                tier: 'free'
            },
            {
                name: 'Sam Williams',
                age: 33,
                email: 'sam@email.com',
                phone: '555-000-0000',
                location: 'Newton, MA',
                hobbies: ['fitness', 'sports', 'hiking'],
                availability: {
                    monday: { morning: false, afternoon: false, evening: false },
                    tuesday: { morning: false, afternoon: false, evening: false },
                    wednesday: { morning: false, afternoon: false, evening: false },
                    thursday: { morning: false, afternoon: false, evening: false },
                    friday: { morning: false, afternoon: false, evening: false },
                    saturday: { morning: false, afternoon: true, evening: true },
                    sunday: { morning: false, afternoon: true, evening: false }
                },
                tier: 'free'
            }
        ];

        await User.insertMany(users);
        console.log('Created 10 hardcoded users');

        const demoUser1 = new User({
            _id: new mongoose.Types.ObjectId('000000000000000000000001'),
            name: 'Alex Demo',
            age: 25,
            email: 'alex@email.com',
            phone: '555-123-4567',
            location: 'Boston, MA',
            hobbies: ['hiking', 'gaming', 'music'],
            availability: {
                monday: { morning: false, afternoon: false, evening: false },
                tuesday: { morning: false, afternoon: false, evening: false },
                wednesday: { morning: false, afternoon: false, evening: false },
                thursday: { morning: false, afternoon: false, evening: false },
                friday: { morning: false, afternoon: false, evening: true },
                saturday: { morning: false, afternoon: true, evening: false },
                sunday: { morning: false, afternoon: false, evening: false }
            },
            tier: 'free'
        });
        await demoUser1.save();
        console.log('Created Demo User 1 (Alex) with ID:', demoUser1._id);

        const demoUser2 = new User({
            _id: new mongoose.Types.ObjectId('000000000000000000000002'),
            name: 'Jordan Demo',
            age: 28,
            email: 'jordan@email.com',
            phone: '555-987-6543',
            location: 'Cambridge, MA',
            hobbies: ['hiking', 'gaming', 'music'],
            availability: {
                monday: { morning: true, afternoon: false, evening: false },
                tuesday: { morning: true, afternoon: false, evening: false },
                wednesday: { morning: false, afternoon: false, evening: false },
                thursday: { morning: false, afternoon: false, evening: false },
                friday: { morning: false, afternoon: false, evening: false },
                saturday: { morning: false, afternoon: true, evening: false },
                sunday: { morning: false, afternoon: false, evening: false }
            },
            tier: 'free'
        });
        await demoUser2.save();
        console.log('Created Demo User 2 (Jordan) with ID:', demoUser2._id);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
