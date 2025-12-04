const API_URL = '';
let CURRENT_USER_ID = localStorage.getItem('currentUserId') || '000000000000000000000001';

let currentEvent = null;
let adCountdown = 5;
let currentUserName = '';

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
            currentUserName = user.name;
            document.getElementById('user-name-display').textContent = user.name;
        }
    } catch (error) {
        console.log('Could not load user name');
    }
}

function showAd(callback) {
    const buttonSection = document.getElementById('button-section');
    const adSection = document.getElementById('ad-section');
    const eventSection = document.getElementById('event-section');
    const countdownText = document.getElementById('ad-countdown');

    buttonSection.classList.add('hidden');
    adSection.classList.remove('hidden');
    eventSection.classList.add('hidden');

    adCountdown = 5; // Reset countdown

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
    const buttonSection = document.getElementById('button-section');
    const adSection = document.getElementById('ad-section');
    const eventSection = document.getElementById('event-section');

    try {
        const response = await fetch(`${API_URL}/api/events/user/${CURRENT_USER_ID}`);
        const event = await response.json();

        if (event && event._id) {
            buttonSection.classList.add('hidden');
            adSection.classList.add('hidden');
            eventSection.classList.remove('hidden');
            currentEvent = event;
            displayEvent(event);
        } else {
            // Show the button section, hide ad and event
            buttonSection.classList.remove('hidden');
            adSection.classList.add('hidden');
            eventSection.classList.add('hidden');
        }
    } catch (error) {
        // Show the button section, hide ad and event
        buttonSection.classList.remove('hidden');
        adSection.classList.add('hidden');
        eventSection.classList.add('hidden');
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

        const eventResponse = await fetch(`${API_URL}/api/events/user/${CURRENT_USER_ID}`);
        const finalEvent = await eventResponse.json();

        currentEvent = finalEvent;
        displayEvent(finalEvent);
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
    const userStatus = event.userStatus || 'pending';
    statusSpan.textContent = userStatus.charAt(0).toUpperCase() + userStatus.slice(1);
    statusSpan.className = `status-${userStatus}`;

    if (event.stats) {
        document.getElementById('stats-total').textContent = event.stats.total;
        document.getElementById('stats-accepted').textContent = event.stats.accepted;
        document.getElementById('stats-declined').textContent = event.stats.declined;
        document.getElementById('stats-pending').textContent = event.stats.pending;
        document.getElementById('event-stats').classList.remove('hidden');
    }

    const actionButtons = document.getElementById('action-buttons');
    if (userStatus !== 'pending') {
        actionButtons.classList.add('hidden');
    } else {
        actionButtons.classList.remove('hidden');
    }
}

async function acceptEvent() {
    if (!currentEvent) return;

    try {
        const response = await fetch(`${API_URL}/api/events/${currentEvent._id}/accept/${CURRENT_USER_ID}`, {
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
        const response = await fetch(`${API_URL}/api/events/${currentEvent._id}/decline/${CURRENT_USER_ID}`, {
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

document.getElementById('get-event-btn').addEventListener('click', function() {
    showAd(generateNewEvent);
});

document.getElementById('accept-btn').addEventListener('click', acceptEvent);
document.getElementById('decline-btn').addEventListener('click', declineEvent);

function initAdminPanel() {
    const arrow = document.getElementById('reset-arrow');
    const adminPanel = document.getElementById('admin-panel');
    const resetBtn = document.getElementById('reset-btn');
    const rulesBtn = document.getElementById('rules-btn');
    const rulesModal = document.getElementById('rules-modal');
    const closeRules = document.getElementById('close-rules');
    
    arrow.addEventListener('click', function() {
        arrow.classList.toggle('open');
        adminPanel.classList.toggle('hidden');
    });
    
    resetBtn.addEventListener('click', async function() {
        if (confirm('Delete all events? This will reset the demo.')) {
            try {
                await fetch(`${API_URL}/api/events/reset-all`, { method: 'DELETE' });
                alert('All events deleted! Refreshing...');
                window.location.reload();
            } catch (error) {
                alert('Error deleting events');
            }
        }
    });
    
    rulesBtn.addEventListener('click', function() {
        rulesModal.classList.add('show');
    });
    
    closeRules.addEventListener('click', function() {
        rulesModal.classList.remove('show');
    });
    
    rulesModal.addEventListener('click', function(e) {
        if (e.target === rulesModal) {
            rulesModal.classList.remove('show');
        }
    });
}

initUserSwitcher();
loadUserName();
checkExistingEvent();
initAdminPanel();
