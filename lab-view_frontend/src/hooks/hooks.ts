import { useState, useEffect, useCallback } from 'react';

// Types
interface MedicalData {
  patient_info?: {
    name?: string;
    age?: number;
    gender?: string;
    id?: string;
  };
  test_results?: Array<{
    test_name: string;
    value: string;
    reference_range?: string;
    unit?: string;
    status?: 'normal' | 'high' | 'low' | 'abnormal';
    category?: string;
  }>;
  summary?: {
    total_tests: number;
    abnormal_count: number;
    categories: string[];
  };
}

interface ApiStatus {
  isOnline: boolean;
  isOllamaAvailable: boolean;
  systemStatus?: {
    ollama_model: string;
    api_version: string;
  };
}

// Custom hooks
export const useMedicalData = () => {
  const [data, setData] = useState<MedicalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPDF = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeText = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    uploadPDF,
    analyzeText,
    clearError,
  };
};

export const useApiStatus = () => {
  const [status, setStatus] = useState<ApiStatus>({
    isOnline: false,
    isOllamaAvailable: false,
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) {
          const data = await response.json();
          setStatus({
            isOnline: true,
            isOllamaAvailable: data.services?.ollama === 'available',
            systemStatus: data.services,
          });
        } else {
          setStatus(prev => ({ ...prev, isOnline: false }));
        }
      } catch {
        setStatus(prev => ({ ...prev, isOnline: false }));
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  return status;
};

export const useFileUpload = (
  onFileSelect: (file: File) => void,
  onError?: (error: string) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validation, setValidation] = useState<{
    valid: boolean;
    message?: string;
  } | null>(null);

  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Only PDF files are allowed' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, message: 'File size must be less than 10MB' };
    }
    
    return { valid: true, message: 'File is valid' };
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validationResult = validateFile(file);
    setValidation(validationResult);
    
    if (validationResult.valid) {
      onFileSelect(file);
    } else if (onError) {
      onError(validationResult.message || 'Invalid file');
    }
  };

  const resetUpload = () => {
    setValidation(null);
    setIsDragging(false);
  };

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
