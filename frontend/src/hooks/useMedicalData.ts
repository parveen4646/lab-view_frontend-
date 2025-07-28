// src/hooks/useMedicalData.ts
import { useState, useCallback } from 'react';
import { MedicalData, UseMedicalDataReturn, ApiError } from '../types/medical';
import { apiService } from '../services/api';

export const useMedicalData = (): UseMedicalDataReturn => {
  const [data, setData] = useState<MedicalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadPDF = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      // Validate file first
      const validation = apiService.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const result = await apiService.uploadPDF(file);
      setData(result);
    } catch (err) {
      const errorMessage = apiService.handleApiError(err);
      setError(errorMessage);
      console.error('PDF upload error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeText = useCallback(async (text: string, tables?: any[]) => {
    setLoading(true);
    setError(null);

    try {
      if (!text.trim()) {
        throw new Error('Text content is required');
      }

      const result = await apiService.analyzeText(text, tables);
      setData(result);
    } catch (err) {
      const errorMessage = apiService.handleApiError(err);
      setError(errorMessage);
      console.error('Text analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    setError(null);
    // Could implement retry logic here if needed
  }, []);

  return {
    data,
    loading,
    error,
    uploadPDF,
    analyzeText,
    retry,
    clearError
  };
};

// src/hooks/useApiStatus.ts
import { useState, useEffect, useCallback } from 'react';
import { SystemStatus, UseApiStatusReturn } from '../types/medical';
import { apiService } from '../services/api';

export const useApiStatus = (checkInterval: number = 30000): UseApiStatusReturn => {
  const [isOnline, setIsOnline] = useState(false);
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const [pingResult, status] = await Promise.all([
        apiService.ping(),
        apiService.getStatus()
      ]);

      setIsOnline(pingResult);
      setSystemStatus(status);
      setIsOllamaAvailable(status.ollama === 'available');
      setLastChecked(new Date());
    } catch (error) {
      console.error('Status check failed:', error);
      setIsOnline(false);
      setIsOllamaAvailable(false);
    }
  }, []);

  useEffect(() => {
    // Check status immediately
    checkStatus();

    // Set up interval for periodic checks
    const interval = setInterval(checkStatus, checkInterval);

    return () => clearInterval(interval);
  }, [checkStatus, checkInterval]);

  return {
    isOnline,
    isOllamaAvailable,
    systemStatus,
    lastChecked,
    checkStatus
  };
};

// src/hooks/useFileUpload.ts
import { useState, useCallback } from 'react';
import { UploadProgress, FileValidation } from '../types/medical';

interface UseFileUploadReturn {
  isDragging: boolean;
  progress: UploadProgress | null;
  validation: FileValidation | null;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetUpload: () => void;
}

export const useFileUpload = (
  onFileSelect: (file: File) => void,
  onError?: (error: string) => void
): UseFileUploadReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [validation, setValidation] = useState<FileValidation | null>(null);

  const validateAndProcessFile = useCallback((file: File) => {
    // Reset previous validation
    setValidation(null);

    // Validate file
    const validation = {
      valid: true,
      error: undefined
    };

    const maxSize = 16 * 1024 * 1024; // 16MB
    const allowedTypes = ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      validation.valid = false;
      validation.error = 'Only PDF files are allowed';
    } else if (file.size > maxSize) {
      validation.valid = false;
      validation.error = 'File size must be less than 16MB';
    }

    setValidation(validation);

    if (validation.valid) {
      onFileSelect(file);
    } else if (onError && validation.error) {
      onError(validation.error);
    }
  }, [onFileSelect, onError]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  }, [validateAndProcessFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  }, [validateAndProcessFile]);

  const resetUpload = useCallback(() => {
    setProgress(null);
    setValidation(null);
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    progress,
    validation,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    resetUpload
  };
};

// src/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// src/hooks/useFilteredResults.ts
import { useMemo } from 'react';
import { LabResult, TestFilter, SortConfig } from '../types/medical';

export const useFilteredResults = (
  results: LabResult[],
  filter: TestFilter,
  sortConfig?: SortConfig
) => {
  return useMemo(() => {
    let filtered = results.filter(result => {
      // Category filter
      if (filter.categories.length > 0 && !filter.categories.includes(result.category)) {
        return false;
      }

      // Status filter
      if (filter.statuses.length > 0 && !filter.statuses.includes(result.status)) {
        return false;
      }

      // Date range filter
      if (filter.dateRange.start || filter.dateRange.end) {
        const resultDate = new Date(result.date);
        
        if (filter.dateRange.start && resultDate < new Date(filter.dateRange.start)) {
          return false;
        }
        
        if (filter.dateRange.end && resultDate > new Date(filter.dateRange.end)) {
          return false;
        }
      }

      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        return (
          result.testName.toLowerCase().includes(searchLower) ||
          result.unit.toLowerCase().includes(searchLower) ||
          result.category.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [results, filter, sortConfig]);
};