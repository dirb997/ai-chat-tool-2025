const API_ENDPOINT = '/chat';

let loading = false;

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const chatArea = document.getElementById('chatArea');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    if (loading || !userInput.value.trim()) return;
    
    loading = true;
    loadingIndicator.style.display = 'block';
    
    try {
        console.log('Sending message:', userInput.value);
        displayUserMessage(userInput.value);
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userInput.value
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received response:', data);
        
        if (data.reply) {
            displayBotMessage(data.reply);
        } else {
            throw new Error('Invalid response format from server');
        }
        
    } catch (error) {
        console.error('Error in sendMessage:', error);
        displayBotMessage('Sorry, I encountered an error. Please try again.');
    } finally {
        loading = false;
        loadingIndicator.style.display = 'none';
        userInput.value = '';
    }
}

function displayUserMessage(message) {
    const chatArea = document.getElementById('chatArea');
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.textContent = message;
    chatArea.appendChild(userDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function displayBotMessage(message) {
    const chatArea = document.getElementById('chatArea');
    const botDiv = document.createElement('div');
    botDiv.className = 'message bot-message';
    botDiv.textContent = message;
    chatArea.appendChild(botDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Handle Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
