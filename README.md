# FriendFinder

A social app that matches users based on hobbies, location, and availability, then suggests group activities using AI.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
Create a `.env` file in the root directory:
```
MONGODB_URI=mongodb+srv:.............mongodb.net/friendfinder (your connection string)
CLAUDE_API_KEY=your_claude_api_key
PORT=3000
```

**MongoDB Atlas:**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string (Database → Connect → Drivers)
4. Add `/friendfinder` to the end of the connection string

**Claude API:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key

### 3. Seed the database
```bash
node seed.js
```

### 4. Start the server
```bash
npm start
```

### 5. Open in browser
```
http://localhost:3000
```

## Demo Users
- **Alex Demo** - Main test user
- **Jordan Demo** - Second test user (shares event with Alex)
- **Admin** - View all users and events

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB Atlas
- AI: Claude (Anthropic)

