import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { MedicalData, HealthStatus, SystemStatus } from '@/types/medical';

// Initialize API service with auth token getter
export const useApiService = () => {
  const { getToken } = useAuth();
  
  useEffect(() => {
    apiService.setAuthTokenGetter(getToken);
  }, [getToken]);

  return apiService;
};

// Authenticated Medical Data Hook
export const useAuthenticatedMedicalData = () => {
  const [data, setData] = useState<MedicalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiService = useApiService();

  const uploadPDF = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.uploadPDF(file);
      setData(result);
    } catch (err) {
      const errorMessage = apiService.handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const analyzeText = useCallback(async (text: string, tables?: unknown[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.analyzeText(text, tables);
      setData(result);
    } catch (err) {
      const errorMessage = apiService.handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    data,
    loading,
    error,
    uploadPDF,
    analyzeText,
    clearError,
    clearData,
  };
};

// API Status Hook (using authenticated service)
export const useAuthenticatedApiStatus = () => {
  const [status, setStatus] = useState<{
    isOnline: boolean;
    isOllamaAvailable: boolean;
    healthStatus?: HealthStatus;
    systemStatus?: SystemStatus;
  }>({
    isOnline: false,
    isOllamaAvailable: false,
  });
  const [loading, setLoading] = useState(true);
  const apiService = useApiService();

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check health
      const healthStatus = await apiService.getHealth();
      const systemStatus = await apiService.getStatus();
      
      setStatus({
        isOnline: true,
        isOllamaAvailable: systemStatus.ollama === 'available',
        healthStatus,
        systemStatus,
      });
    } catch (error) {
      console.warn('API status check failed:', error);
      setStatus(prev => ({ 
        ...prev, 
        isOnline: false,
        isOllamaAvailable: false 
      }));
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    ...status,
    loading,
    refresh: checkStatus,
  };
};

// File Upload Hook with Authentication
export const useAuthenticatedFileUpload = (
  onFileSelect: (file: File) => void,
  onError?: (error: string) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validation, setValidation] = useState<{
    valid: boolean;
    message?: string;
  } | null>(null);
  const apiService = useApiService();

  const validateFile = useCallback((file: File) => {
    return apiService.validateFile(file);
  }, [apiService]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileSelect = useCallback((file: File) => {
    const validationResult = validateFile(file);
    setValidation(validationResult);
    
    if (validationResult.valid) {
      onFileSelect(file);
    } else if (onError && validationResult.error) {
      onError(validationResult.error);
    }
  }, [validateFile, onFileSelect, onError]);

  const resetUpload = useCallback(() => {
    setValidation(null);
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    validation,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    resetUpload,
  };
};