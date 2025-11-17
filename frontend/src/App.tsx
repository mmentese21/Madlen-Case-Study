// In frontend/src/App.tsx
import React, { useState } from 'react';
import ModelSelector from './components/ModelSelector';
import ChatWindow from './components/ChatWindow';
import { ChatMessage } from './services/api';

// Import our new CSS file
import './components/App.css';

function App() {
  // State for the selected model
  const [model, setModel] = useState<string>('');
  
  // State for the *current session* chat history
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Callback to add a new message to the history
  const handleNewMessage = (message: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h3>Madlen Chat</h3>
        <ModelSelector 
          selectedModel={model} 
          onModelChange={setModel} 
        />
      </header>
      
      <ChatWindow 
        selectedModel={model}
        messages={messages}
        onNewMessage={handleNewMessage}
      />
    </div>
  );
}

export default App;