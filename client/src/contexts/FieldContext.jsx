// client/src/contexts/FieldContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fieldsAPI } from '../services/api';

const FieldContext = createContext();

export const useField = () => {
  const context = useContext(FieldContext);
  if (!context) {
    throw new Error('useField must be used within a FieldProvider');
  }
  return context;
};

export const FieldProvider = ({ children }) => {
  const [selectedField, setSelectedField] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load fields and selected field on mount
  useEffect(() => {
    loadFields();
  }, []);

  // Save selected field to localStorage
  useEffect(() => {
    if (selectedField) {
      localStorage.setItem('farmer-selected-field', JSON.stringify(selectedField));
    }
  }, [selectedField]);

  const loadFields = async () => {
    try {
      setLoading(true);
      const response = await fieldsAPI.getAllFields();

      if (response.data.success && response.data.data.length > 0) {
        const fieldsData = response.data.data;
        setFields(fieldsData);

        // Try to restore previously selected field
        const savedField = localStorage.getItem('farmer-selected-field');
        if (savedField) {
          try {
            const parsedField = JSON.parse(savedField);
            const fieldExists = fieldsData.find(f => f.id === parsedField.id);
            if (fieldExists) {
              setSelectedField(fieldExists);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse saved field:', e);
          }
        }

        // If no saved field or field doesn't exist, select first field
        setSelectedField(fieldsData[0]);
      } else {
        setFields([]);
        setSelectedField(null);
      }
    } catch (err) {
      console.error('Error loading fields:', err);
      setError('Failed to load fields');
      setFields([]);
      setSelectedField(null);
    } finally {
      setLoading(false);
    }
  };

  const selectField = (field) => {
    setSelectedField(field);
  };

  const refreshFields = () => {
    loadFields();
  };

  const addField = (newField) => {
    setFields(prev => [newField, ...prev]);
    if (!selectedField) {
      setSelectedField(newField);
    }
  };

  const updateField = (updatedField) => {
    setFields(prev => prev.map(field =>
      field.id === updatedField.id ? updatedField : field
    ));
    if (selectedField && selectedField.id === updatedField.id) {
      setSelectedField(updatedField);
    }
  };

  const removeField = (fieldId) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
    if (selectedField && selectedField.id === fieldId) {
      const remainingFields = fields.filter(field => field.id !== fieldId);
      setSelectedField(remainingFields.length > 0 ? remainingFields[0] : null);
    }
  };

  const value = {
    selectedField,
    fields,
    loading,
    error,
    selectField,
    refreshFields,
    addField,
    updateField,
    removeField,
    hasFields: fields.length > 0
  };

  return (
    <FieldContext.Provider value={value}>
      {children}
    </FieldContext.Provider>
  );
};