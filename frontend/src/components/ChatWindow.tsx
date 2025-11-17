// In frontend/src/components/ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, sendChat } from '../services/api';
import './ChatWindow.css';

interface Props {
  selectedModel: string;
  messages: ChatMessage[];
  onNewMessage: (message: ChatMessage) => void;
}

const ChatWindow: React.FC<Props> = ({ selectedModel, messages, onNewMessage }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedModel || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    onNewMessage(userMessage);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const assistantMessage = await sendChat(selectedModel, newMessages);
      onNewMessage(assistantMessage);
    } catch (err) {
      console.error("Error sending chat:", err);
      setError("Failed to get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <h3>Start a conversation</h3>
            <p>Send a message to begin chatting with {selectedModel || 'AI'}</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-header">
                {msg.role === 'user' ? 'You' : selectedModel}
              </div>
              <div className="message-text">{msg.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message-wrapper assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-header">{selectedModel}</div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="message-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedModel ? "Type your message..." : "Select a model first..."}
            disabled={isLoading || !selectedModel}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={isLoading || !selectedModel || !input.trim()}
            className="send-button"
          >
            <span className="send-icon">➤</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;