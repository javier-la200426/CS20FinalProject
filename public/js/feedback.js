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

const form = document.getElementById('feedback-form');

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
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
            showMessage('Thank you for your feedback!', 'success');
            form.reset();
        } else {
            showMessage('Error submitting feedback. Please try again.', 'error');
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
