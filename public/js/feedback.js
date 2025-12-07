const API_URL = '';
let CURRENT_USER_ID = localStorage.getItem('currentUserId') || '000000000000000000000001';
let currentEventId = null;

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

function submitFeedback() {
    rating = [...document.getElementsByClassName("rated")].length;

    meetAgain = ""
    options = [...document.getElementsByName("meet")];
    options.forEach(function(option){
        if(option.checked) {
            meetAgain = option.value;
        }
    });

    interactions = ""
    options = [...document.getElementsByName("interactions")];
    options.forEach(function(option){
        if(option.checked) {
            interactions = option.value;
        }
    });

    proposedEvent = ""
    options = [...document.getElementsByName("proposed")];
    options.forEach(function(option){
        if(option.checked) {
            proposedEvent = option.value;
        }
    });

    groupComments = document.getElementById("group-comments").value;
    eventComments = document.getElementById("event-comments").value;
    additionalComments = document.getElementById("comments").value;

    if (meetAgain == "") {
        alert("Form is incomplete. Please select an option for the second question.");
        document.getElementById("no").focus();
        return false;
    } else if (interactions == "") {
        alert("Form is incomplete. Please select an option for the third question.");
        document.getElementById("bad").focus();
        return false;
    } else if (proposedEvent == "") {
        alert("Form is incomplete. Please select an option for the fifth question.");
        document.getElementById("not-used").focus();
        return false;
    }

    push(rating, meetAgain, interactions, groupComments, proposedEvent, eventComments, additionalComments);
    return true;
}

async function push(rating, meetAgain, interactions, groupComments, proposedEvent, eventComments, additionalComments) {
    if (!currentEventId) {
        showMessage('No event found to give feedback for.', 'error');
        return;
    }

    const formData = {
        eventId: currentEventId,
        userId: CURRENT_USER_ID,
        rating: rating,
        wouldMeetAgain: meetAgain,
        interactions: interactions,
        groupComments: groupComments,
        proposedEvent: proposedEvent,
        eventComments: eventComments,
        additionalComments: additionalComments
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
}

initUserSwitcher();
loadUserName();
checkExistingFeedback();
