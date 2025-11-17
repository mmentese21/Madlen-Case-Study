// In frontend/src/services/api.ts
import axios from 'axios';

// The base URL of our FastAPI backend
const API_URL = "http://localhost:8000";

// Define the structure of a message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Define the structure for a model
export interface AIModel {
  id: string;
  name: string;
}

/**
 * Fetches the list of available AI models from our backend.
 */
export const getModels = async (): Promise<AIModel[]> => {
  const response = await axios.get(`${API_URL}/api/v1/models`);
  return response.data;
};

/**
 * Sends the chat history to the backend to get a response.
 */
export const sendChat = async (model: string, messages: ChatMessage[]) => {
  const response = await axios.post(`${API_URL}/api/v1/chat`, {
    model,
    messages,
  });
  
  // The backend proxies the OpenRouter response, 
  // so we extract the assistant's message from it.
  return response.data.choices[0].message;
};