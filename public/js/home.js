const API_URL = '';
let CURRENT_USER_ID = localStorage.getItem('currentUserId') || '000000000000000000000001';

const text = "Meet new friends through shared experiences."; // let the title appear from word to word
const typingElement = document.getElementById("typing-text");

let index = 0;
function typeLetter() {
    if (index < text.length) {
        typingElement.textContent += text.charAt(index);
        index++;
        setTimeout(typeLetter, 45); // typing speed (ms)
    }
}

typeLetter();

function animateCounters() {
    const counters = document.querySelectorAll(".metric-number");

    counters.forEach(counter => {
        const target = +counter.dataset.target;
        let current = 0;

        const increment = target / 140; // 60 animation frames

        function update() {
            current += increment;

            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(update);
            } else {
                counter.textContent = target.toLocaleString();
            }
        }

        update();
    });
}

// Detect when metrics are in view
const metricsSection = document.querySelector(".metrics");
let hasAnimated = false;

function startCountersIfVisible() {
    const rect = metricsSection.getBoundingClientRect();

    if (!hasAnimated && rect.top < window.innerHeight) {
        animateCounters();
        hasAnimated = true;
    }
}

// Run on scroll and on load
window.addEventListener("scroll", startCountersIfVisible);
window.addEventListener("load", startCountersIfVisible);


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

async function loadEventStatus() {
    const statusDiv = document.getElementById('event-status');
    
    try {
        const response = await fetch(`${API_URL}/api/events/user/${CURRENT_USER_ID}`);
        const event = await response.json();

        if (!event || !event._id) {
            statusDiv.innerHTML = `
                <p>You don't have an event for this week yet.</p>
                <div class="btn-row">
                <a href="events.html" class="btn">Get Your Event</a>
                <a href="register.html" class="btn-secondary">Register First</a>
                </div>
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
            const feedbackResponse = await fetch(`${API_URL}/api/feedback/check/${CURRENT_USER_ID}/${event._id}`);
            const feedbackData = await feedbackResponse.json();
            
            let feedbackButton = '<a href="feedback.html" class="btn">Give Feedback</a>';
            if (feedbackData.hasFeedback) {
                feedbackButton = '<p class="feedback-done">✓ Thanks for your feedback!</p>';
            }
            
            statusDiv.innerHTML = `
                <div class="event-details">
                    <p><strong>Activity:</strong> ${event.activityName}</p>
                    <p><strong>When:</strong> ${event.scheduledTime}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <p><strong>Status:</strong> <span class="status-accepted">Accepted</span></p>
                </div>
                ${feedbackButton}
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
