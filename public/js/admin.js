const API_URL = '';

function initUserSwitcher() {
    const switcher = document.getElementById('user-switcher');
    if (switcher) {
        switcher.addEventListener('change', function() {
            if (this.value !== 'admin') {
                localStorage.setItem('currentUserId', this.value);
                window.location.href = 'index.html';
            }
        });
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/api/users`);
        const users = await response.json();
        
        document.getElementById('user-count').textContent = users.length;
        
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = users.map(user => `
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3>${user.name}</h3>
                    <button class="btn-small" onclick="editUser('${user._id}')">Edit</button>
                </div>
                <div class="admin-card-body">
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Location:</strong> ${user.location}</p>
                    <p><strong>Hobbies:</strong> ${user.hobbies ? user.hobbies.join(', ') : 'None'}</p>
                    <p><strong>Availability:</strong></p>
                    <div class="availability-summary">
                        ${formatAvailability(user.availability)}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function formatAvailability(availability) {
    if (!availability) return 'Not set';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const slots = [];
    
    days.forEach(day => {
        if (availability[day]) {
            const times = [];
            if (availability[day].morning) times.push('morning');
            if (availability[day].afternoon) times.push('afternoon');
            if (availability[day].evening) times.push('evening');
            if (times.length > 0) {
                slots.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: ${times.join(', ')}`);
            }
        }
    });
    
    return slots.length > 0 ? slots.join('<br>') : 'No availability set';
}

async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/api/events/all`);
        const events = await response.json();
        
        document.getElementById('event-count').textContent = events.length;
        
        const eventsList = document.getElementById('events-list');
        
        if (events.length === 0) {
            eventsList.innerHTML = '<p>No events found.</p>';
            return;
        }
        
        eventsList.innerHTML = events.map(event => `
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3>${event.activityName || 'Unnamed Event'}</h3>
                </div>
                <div class="admin-card-body">
                    <p><strong>Description:</strong> ${event.activityDescription || 'N/A'}</p>
                    <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
                    <p><strong>Time:</strong> ${event.scheduledTime || 'N/A'}</p>
                    <p><strong>Members:</strong> ${event.groupMembers ? event.groupMembers.length : 0}</p>
                    <div class="member-status">
                        ${formatMemberStatus(event.groupMembers)}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

function formatMemberStatus(members) {
    if (!members || members.length === 0) return 'No members';
    
    const accepted = members.filter(m => m.status === 'accepted').length;
    const declined = members.filter(m => m.status === 'declined').length;
    const pending = members.filter(m => m.status === 'pending').length;
    
    return `
        <span class="status-accepted">${accepted} accepted</span> | 
        <span class="status-declined">${declined} declined</span> | 
        <span class="status-pending">${pending} pending</span>
    `;
}

let currentEditUser = null;

async function editUser(userId) {
    try {
        const response = await fetch(`${API_URL}/api/users/${userId}`);
        const user = await response.json();
        
        currentEditUser = user;
        
        document.getElementById('edit-user-id').value = user._id;
        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-location').value = user.location;
        
        document.querySelectorAll('#edit-hobbies input').forEach(cb => {
            cb.checked = user.hobbies && user.hobbies.includes(cb.value);
        });
        
        document.getElementById('edit-modal').classList.add('show');
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

document.getElementById('edit-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('edit-user-id').value;
    const hobbies = [];
    document.querySelectorAll('#edit-hobbies input:checked').forEach(cb => {
        hobbies.push(cb.value);
    });
    
    const data = {
        name: document.getElementById('edit-name').value,
        location: document.getElementById('edit-location').value,
        hobbies: hobbies
    };
    
    try {
        const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('User updated successfully!');
            document.getElementById('edit-modal').classList.remove('show');
            loadUsers();
        } else {
            alert('Error updating user');
        }
    } catch (error) {
        alert('Error updating user');
    }
});

document.getElementById('close-edit').addEventListener('click', function() {
    document.getElementById('edit-modal').classList.remove('show');
});

document.getElementById('edit-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('show');
    }
});

document.getElementById('users-tab').addEventListener('click', function() {
    document.getElementById('users-tab').classList.add('active');
    document.getElementById('events-tab').classList.remove('active');
    document.getElementById('users-section').classList.remove('hidden');
    document.getElementById('events-section').classList.add('hidden');
});

document.getElementById('events-tab').addEventListener('click', function() {
    document.getElementById('events-tab').classList.add('active');
    document.getElementById('users-tab').classList.remove('active');
    document.getElementById('events-section').classList.remove('hidden');
    document.getElementById('users-section').classList.add('hidden');
    loadEvents();
});

initUserSwitcher();
loadUsers();

