let currentRole = 'math'; // Default role

async function toggleSlidingMenu() {
    const slidingMenu = document.getElementById('sliding-menu');
    if (slidingMenu.classList.contains('hidden')) {
        slidingMenu.classList.remove('hidden');
        slidingMenu.style.left = '0';
    } else {
        slidingMenu.style.left = '-250px';
        setTimeout(() => slidingMenu.classList.add('hidden'), 400); // Wait for animation
    }
}

async function switchTutor(role) {
    currentRole = role;

    // Clear chat history on the frontend
    document.getElementById('chat-history').innerHTML = '';

    try {
        // Notify the backend to clear history
        await fetch('https://my-node-backend-0f59b9fb4442.herokuapp.com/api/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
        });

        toggleSlidingMenu();
        alert(`Switched to ${role.charAt(0).toUpperCase() + role.slice(1)} Tutor.`);
    } catch (error) {
        console.error('Error switching tutor:', error);
        alert('Failed to switch tutor. Please try again.');
    }
}

async function loadHistory() {
    try {
        const response = await fetch(`https://my-node-backend-0f59b9fb4442.herokuapp.com/api/history?role=${currentRole}`);
        const history = await response.json();
        const chatHistory = document.getElementById('chat-history');
        chatHistory.innerHTML = ''; // Clear existing messages

        history.forEach(entry => {
            addMessage(entry.content, entry.role === 'User' ? 'user-message' : 'response-message');
        });
    } catch (error) {
        console.error('Error loading chat history:', error);
        alert('Failed to load chat history.');
    }
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, 'user-message');

    try {
        const response = await fetch('https://my-node-backend-0f59b9fb4442.herokuapp.com/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, role: currentRole })
        });

        const data = await response.json();
        addMessage(data.response, 'response-message');
    } catch (error) {
        console.error('Error sending message:', error);
        addMessage('Error: Unable to get a response.', 'response-message');
    }

    input.value = '';
    input.style.height = '40px'; // Reset height
}

function addMessage(content, className) {
    const chatHistory = document.getElementById('chat-history');
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `message-wrapper ${className}`;
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    messageElement.textContent = content;
    messageWrapper.appendChild(messageElement);
    chatHistory.appendChild(messageWrapper);
    chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
}

// Ensure the sliding menu and chat UI initializes correctly
document.addEventListener('DOMContentLoaded', () => {
    loadHistory(); // Load history on page load
    document.getElementById('message-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});
