document.addEventListener('DOMContentLoaded', () => {
    const setupContainer = document.querySelector('.setup-container');
    const chatContainer = document.querySelector('.chat-container');
    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const startChatButton = document.getElementById('start-chat');
    const newChatButton = document.getElementById('new-chat');
    const assistantIdInput = document.getElementById('assistant-id');
    
    let threadId = null;
    let assistantId = null;
    
    startChatButton.addEventListener('click', async () => {
        assistantId = assistantIdInput.value.trim();
        
        if (!assistantId) {
            alert('Please enter your OpenAI Assistant ID');
            return;
        }
        
        try {
            const response = await fetch('/api/thread', {
                method: 'POST'
            });
            
            const data = await response.json();
            threadId = data.threadId;
            
            setupContainer.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            
            // Add welcome message
            addMessage('Hello! How can I help you today?', 'assistant');
            
        } catch (error) {
            console.error('Error starting chat:', error);
            alert('Failed to start chat. Please try again.');
        }
    });
    
    newChatButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/thread', {
                method: 'POST'
            });
            
            const data = await response.json();
            threadId = data.threadId;
            
            // Clear messages
            messagesContainer.innerHTML = '';
            
            // Add welcome message
            addMessage('Hello! How can I help you today?', 'assistant');
            
        } catch (error) {
            console.error('Error creating new chat:', error);
            alert('Failed to create new chat. Please try again.');
        }
    });
    
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    async function sendMessage() {
        const message = userInput.value.trim();
        
        if (!message) return;
        
        // Add user message to UI
        addMessage(message, 'user');
        
        // Clear input
        userInput.value = '';
        
        // Add loading indicator
        const loadingElement = document.createElement('div');
        loadingElement.className = 'message assistant-message';
        loadingElement.innerHTML = '<div class="loading"></div>';
        messagesContainer.appendChild(loadingElement);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    threadId,
                    assistantId,
                    message
                })
            });
            
            // Remove loading indicator
            messagesContainer.removeChild(loadingElement);
            
            if (!response.ok) {
                throw new Error('Failed to get response');
            }
            
            const data = await response.json();
            
            // Add assistant message to UI
            addMessage(data.response, 'assistant');
            
        } catch (error) {
            // Remove loading indicator
            messagesContainer.removeChild(loadingElement);
            
            console.error('Error sending message:', error);
            addMessage('Sorry, there was an error processing your request.', 'assistant');
        }
    }
    
    function addMessage(content, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.textContent = content;
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});