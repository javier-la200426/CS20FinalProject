const API_URL = '';
let CURRENT_USER_ID = localStorage.getItem('currentUserId') || '000000000000000000000001';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const times = ['morning', 'afternoon', 'evening'];

function initUserSwitcher() {
    const switcher = document.getElementById('user-switcher');
    if (switcher) {
        switcher.value = CURRENT_USER_ID;
        switcher.addEventListener('change', function() {
            if (this.value === 'admin') {
                localStorage.setItem('currentUserId', 'admin');
                window.location.href = 'admin.html';
            } else {
                localStorage.setItem('currentUserId', this.value);
                window.location.reload();
            }
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

async function loadPreferences() {
    try {
        const response = await fetch(`${API_URL}/api/users/${CURRENT_USER_ID}`);
        const user = await response.json();

        if (user && user.location) {
            document.getElementById('location').value = user.location;
        }

        if (user && user.hobbies) {
            user.hobbies.forEach(hobby => {
                const checkbox = document.querySelector(`input[name="hobbies"][value="${hobby}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        if (user && user.availability) {
            days.forEach(day => {
                times.forEach(time => {
                    if (user.availability[day] && user.availability[day][time]) {
                        const checkbox = document.querySelector(`input[name="${day}-${time}"]`);
                        if (checkbox) checkbox.checked = true;
                    }
                });
            });
        }
    } catch (error) {
        console.log('Could not load preferences');
    }
}

const form = document.getElementById('preferences-form');

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const hobbies = [];
    document.querySelectorAll('input[name="hobbies"]:checked').forEach(cb => {
        hobbies.push(cb.value);
    });

    const availability = {};
    days.forEach(day => {
        availability[day] = {
            morning: document.querySelector(`input[name="${day}-morning"]`).checked,
            afternoon: document.querySelector(`input[name="${day}-afternoon"]`).checked,
            evening: document.querySelector(`input[name="${day}-evening"]`).checked
        };
    });

    const formData = {
        location: document.getElementById('location').value,
        hobbies: hobbies,
        availability: availability
    };

    try {
        const response = await fetch(`${API_URL}/api/users/${CURRENT_USER_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showMessage('Preferences saved successfully!', 'success');
        } else {
            showMessage('Error saving preferences. Please try again.', 'error');
        }
    } catch (error) {
        showMessage('Error saving preferences. Please try again.', 'error');
    }
});

function showMessage(text, type) {
    const messageDiv = document.getElementById('preferences-message');
    messageDiv.textContent = text;
    messageDiv.className = `message message-${type}`;
    messageDiv.classList.remove('hidden');
}

initUserSwitcher();
loadUserName();
loadPreferences();
