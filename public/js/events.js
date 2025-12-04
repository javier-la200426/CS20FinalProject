const API_URL = '';
const CURRENT_USER_ID = '000000000000000000000001';

let currentEvent = null;
let adCountdown = 5;

function showAd(callback) {
    const adSection = document.getElementById('ad-section');
    const eventSection = document.getElementById('event-section');
    const countdownText = document.getElementById('ad-countdown');

    adSection.classList.remove('hidden');
    eventSection.classList.add('hidden');

    const interval = setInterval(() => {
        adCountdown--;
        countdownText.textContent = `Skipping in ${adCountdown} seconds...`;

        if (adCountdown <= 0) {
            clearInterval(interval);
            adSection.classList.add('hidden');
            eventSection.classList.remove('hidden');
            callback();
        }
    }, 1000);
}

async function checkExistingEvent() {
    const adSection = document.getElementById('ad-section');
    const eventSection = document.getElementById('event-section');
    
    try {
        const response = await fetch(`${API_URL}/api/events/user/${CURRENT_USER_ID}`);
        const event = await response.json();

        if (event && event._id) {
            adSection.classList.add('hidden');
            eventSection.classList.remove('hidden');
            currentEvent = event;
            displayEvent(event);
        } else {
            showAd(generateNewEvent);
        }
    } catch (error) {
        showAd(generateNewEvent);
    }
}

async function generateNewEvent() {
    try {
        const response = await fetch(`${API_URL}/api/events/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: CURRENT_USER_ID })
        });
        const event = await response.json();

        const aiResponse = await fetch(`${API_URL}/api/ai/generate-activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: event._id })
        });
        const updatedEvent = await aiResponse.json();

        currentEvent = updatedEvent;
        displayEvent(updatedEvent);
    } catch (error) {
        document.getElementById('event-details').innerHTML = '<p>Error generating event. Please try again.</p>';
    }
}

function displayEvent(event) {
    document.getElementById('activity-name').textContent = event.activityName;
    document.getElementById('activity-description').textContent = event.activityDescription;
    document.getElementById('event-location').textContent = event.location;
    document.getElementById('event-time').textContent = event.scheduledTime;
    
    const statusSpan = document.getElementById('event-status');
    statusSpan.textContent = event.status.charAt(0).toUpperCase() + event.status.slice(1);
    statusSpan.className = `status-${event.status}`;

    const actionButtons = document.getElementById('action-buttons');
    if (event.status !== 'pending') {
        actionButtons.classList.add('hidden');
    }
}

async function acceptEvent() {
    if (!currentEvent) return;

    try {
        const response = await fetch(`${API_URL}/api/events/${currentEvent._id}/accept`, {
            method: 'PUT'
        });
        const updatedEvent = await response.json();
        currentEvent = updatedEvent;
        displayEvent(updatedEvent);
        showMessage('Event accepted! See you there!', 'success');
    } catch (error) {
        showMessage('Error accepting event. Please try again.', 'error');
    }
}

async function declineEvent() {
    if (!currentEvent) return;

    try {
        const response = await fetch(`${API_URL}/api/events/${currentEvent._id}/decline`, {
            method: 'PUT'
        });
        const updatedEvent = await response.json();
        currentEvent = updatedEvent;
        displayEvent(updatedEvent);
        showMessage('Event declined. Check back next week!', 'success');
    } catch (error) {
        showMessage('Error declining event. Please try again.', 'error');
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('status-message');
    messageDiv.textContent = text;
    messageDiv.className = `message message-${type}`;
    messageDiv.classList.remove('hidden');
}

document.getElementById('accept-btn').addEventListener('click', acceptEvent);
document.getElementById('decline-btn').addEventListener('click', declineEvent);

checkExistingEvent();

