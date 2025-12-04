const API_URL = '';
const CURRENT_USER_ID = '000000000000000000000001';

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

        if (event.status === 'pending') {
            statusDiv.innerHTML = `
                <p>You have a pending event!</p>
                <a href="events.html" class="btn">View Event Details</a>
            `;
        } else if (event.status === 'accepted') {
            statusDiv.innerHTML = `
                <div class="event-details">
                    <p><strong>Activity:</strong> ${event.activityName}</p>
                    <p><strong>When:</strong> ${event.scheduledTime} on ${event.scheduledDate}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <p><strong>Status:</strong> <span class="status-accepted">Accepted</span></p>
                </div>
                <a href="feedback.html" class="btn">Give Feedback</a>
            `;
        } else if (event.status === 'declined') {
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

loadEventStatus();

