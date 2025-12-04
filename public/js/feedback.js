const API_URL = '';
let CURRENT_USER_ID = localStorage.getItem('currentUserId') || '000000000000000000000001';
let currentEventId = null;

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

async function checkExistingFeedback() {
    try {
        const eventResponse = await fetch(`${API_URL}/api/events/user/${CURRENT_USER_ID}`);
        const event = await eventResponse.json();
        
        if (!event || !event._id) {
            document.getElementById('feedback-form').classList.add('hidden');
            document.getElementById('no-event-message').classList.remove('hidden');
            return;
        }
        
        currentEventId = event._id;
        
        const feedbackResponse = await fetch(`${API_URL}/api/feedback/check/${CURRENT_USER_ID}/${event._id}`);
        const feedbackData = await feedbackResponse.json();
        
        if (feedbackData.hasFeedback) {
            document.getElementById('feedback-form').classList.add('hidden');
            document.getElementById('already-submitted').classList.remove('hidden');
        }
    } catch (error) {
        console.log('Could not check feedback status');
    }
}

const form = document.getElementById('feedback-form');

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!currentEventId) {
        showMessage('No event found to give feedback for.', 'error');
        return;
    }

    const formData = {
        eventId: currentEventId,
        userId: CURRENT_USER_ID,
        rating: parseInt(document.getElementById('rating').value),
        hadFun: document.getElementById('had-fun').value,
        wouldMeetAgain: document.getElementById('meet-again').value,
        comments: document.getElementById('comments').value
    };

    try {
        const response = await fetch(`${API_URL}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            document.getElementById('feedback-form').classList.add('hidden');
            document.getElementById('already-submitted').classList.remove('hidden');
        } else {
            const error = await response.json();
            showMessage(error.error || 'Error submitting feedback.', 'error');
        }
    } catch (error) {
        showMessage('Error submitting feedback. Please try again.', 'error');
    }
});

function showMessage(text, type) {
    const messageDiv = document.getElementById('feedback-message');
    messageDiv.textContent = text;
    messageDiv.className = `message message-${type}`;
    messageDiv.classList.remove('hidden');
}

initUserSwitcher();
loadUserName();
checkExistingFeedback();
