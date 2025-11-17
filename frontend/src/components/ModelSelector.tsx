// In frontend/src/components/ModelSelector.tsx
import React, { useState, useEffect, useRef } from 'react';
import { getModels, AIModel } from '../services/api';
import './ModelSelector.css';

interface Props {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const ModelSelector: React.FC<Props> = ({ selectedModel, onModelChange }) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch models when the component mounts
    const fetchModels = async () => {
      try {
        setLoading(true);
        const fetchedModels = await getModels();
        setModels(fetchedModels);
        // Set the default model if one isn't already selected
        if (!selectedModel && fetchedModels.length > 0) {
          onModelChange(fetchedModels[0].id);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [onModelChange, selectedModel]); // Dependency array

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectModel = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  if (loading) {
    return (
      <div className="model-selector loading">
        <div className="selector-header">
          <div className="skeleton-icon"></div>
          <div className="skeleton-text"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="model-selector" ref={dropdownRef}>
      <div className="selector-label">
        <span className="label-icon">🤖</span>
        AI Model
      </div>
      
      <div 
        className={`selector-header ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-model">
          <span className="model-icon">✨</span>
          <span className="model-name">
            {selectedModelData?.name || 'Select a model'}
          </span>
        </div>
        <span className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {models.map((model) => (
            <div
              key={model.id}
              className={`dropdown-item ${selectedModel === model.id ? 'selected' : ''}`}
              onClick={() => handleSelectModel(model.id)}
            >
              <div className="model-info">
                <span className="model-icon">✨</span>
                <div className="model-details">
                  <span className="model-name">{model.name}</span>
                  <span className="model-id">{model.id}</span>
                </div>
              </div>
              {selectedModel === model.id && (
                <span className="check-icon">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;