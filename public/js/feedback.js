const API_URL = '';
const CURRENT_USER_ID = '000000000000000000000001';

const form = document.getElementById('feedback-form');

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        odI: CURRENT_USER_ID,
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

