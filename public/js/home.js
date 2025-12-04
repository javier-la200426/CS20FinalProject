const API_URL = '';
let CURRENT_USER_ID = localStorage.getItem('currentUserId') || '000000000000000000000001';

function initUserSwitcher() {
    const switcher = document.getElementById('user-switcher');
    if (switcher) {
        switcher.value = CURRENT_USER_ID;
        switcher.addEventListener('change', function() {
            localStorage.setItem('currentUserId', this.value);
            window.location.reload();
        });
    }
}

async function loadUserName() {
    try {
        const response = await fetch(`${API_URL}/api/users/${CURRENT_USER_ID}`);
        const user = await response.json();
        if (user && user.name) {
            document.getElementById('user-name-display').textContent = user.name;
        }
    } catch (error) {
        console.log('Could not load user name');
    }
}

async function loadEventStatus() {
    const statusDiv = document.getElementById('event-status');
    
    try {
        const response = await fetch(`${API_URL}/api/events/user/${CURRENT_USER_ID}`);
        const event = await response.json();

        if (!event || !event._id) {
            statusDiv.innerHTML = `
                <p>You don't have an event for this week yet.</p>
                <a href="events.html" class="btn">Get Your Event</a>
            `;
            return;
        }

        const userStatus = event.userStatus || 'pending';

        if (userStatus === 'pending') {
            statusDiv.innerHTML = `
                <p>You have a pending event!</p>
                <a href="events.html" class="btn">View Event Details</a>
            `;
        } else if (userStatus === 'accepted') {
            statusDiv.innerHTML = `
                <div class="event-details">
                    <p><strong>Activity:</strong> ${event.activityName}</p>
                    <p><strong>When:</strong> ${event.scheduledTime}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <p><strong>Status:</strong> <span class="status-accepted">Accepted</span></p>
                </div>
                <a href="feedback.html" class="btn">Give Feedback</a>
            `;
        } else if (userStatus === 'declined') {
            statusDiv.innerHTML = `
                <p>You declined this week's event.</p>
                <p>Check back next week for a new match!</p>
            `;
        }
    } catch (error) {
        statusDiv.innerHTML = `
            <p>You don't have an event for this week yet.</p>
            <a href="events.html" class="btn">Get Your Event</a>
        `;
    }
}

initUserSwitcher();
loadUserName();
loadEventStatus();
