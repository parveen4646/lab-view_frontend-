// src/services/api.ts
import { MedicalData, PatientInfo, APIResponse, HealthStatus, SystemStatus } from '../types/medical';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

class ApiService {
  private baseUrl: string;
  private getAuthToken?: () => Promise<string | null>;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Set auth token getter function
  setAuthTokenGetter(getter: () => Promise<string | null>) {
    this.getAuthToken = getter;
  }

  private async handleResponse<T>(response: Response): Promise<APIResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();
    
    // Get auth token if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.getAuthToken) {
      try {
        const token = await this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        logger.warn('Failed to get auth token', 'API', { error });
      }
    }

    const defaultOptions: RequestInit = {
      headers,
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);
      const duration = Date.now() - startTime;
      
      // Log API call
      logger.logApiCall(
        options.method || 'GET',
        endpoint,
        response.status,
        duration,
        response.ok ? undefined : response.statusText
      );
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        throw new Error('Authentication required. Please sign in again.');
      }
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logApiCall(
        options.method || 'GET',
        endpoint,
        0,
        duration,
        error instanceof Error ? error.message : 'Unknown error'
      );
      logger.error(`API request failed: ${endpoint}`, 'API', { error, url });
      throw error;
    }
  }

  // Health and Status endpoints
  async getHealth(): Promise<HealthStatus> {
    const response = await this.makeRequest<HealthStatus>('/health');
    return response.data || response as any;
  }

  async getStatus(): Promise<SystemStatus> {
    const response = await this.makeRequest<{ status: SystemStatus }>('/api/status');
    return response.data?.status || {} as SystemStatus;
  }

  // PDF Upload and Processing
  async uploadPDF(file: File, onProgress?: (progress: number) => void): Promise<MedicalData> {
    const startTime = Date.now();
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/upload`;

    // Get auth token if available
    const headers: Record<string, string> = {};
    if (this.getAuthToken) {
      try {
        const token = await this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        logger.warn('Failed to get auth token for upload', 'API', { error });
      }
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
      
      logger.info(`Starting PDF upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`, 'API');
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
        signal: controller.signal,
        // Don't set Content-Type header - let browser set it with boundary
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      // Log upload attempt
      logger.logApiCall('POST', '/upload', response.status, duration);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        throw new Error('Authentication required. Please sign in again.');
      }

      const result = await this.handleResponse<MedicalData>(response);
      logger.info(`PDF upload completed successfully: ${file.name} in ${(duration / 1000).toFixed(2)}s`, 'API');
      return result.data as MedicalData;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`PDF upload failed: ${file.name}`, 'API', { error, duration });
      
      // Handle timeout errors specifically
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Upload timed out. Large files may take several minutes to process. Please try again.');
      }
      
      throw error;
    }
  }

  // Text Analysis
  async analyzeText(text: string, tables?: unknown[]): Promise<MedicalData> {
    const response = await this.makeRequest<MedicalData>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        text,
        tables: tables || []
      }),
    });

    return response.data as MedicalData;
  }

  // Patient Data
  async getPatientData(patientId: string): Promise<MedicalData> {
    const response = await this.makeRequest<MedicalData>(`/api/patient/${patientId}`);
    return response.data as MedicalData;
  }

  // Available Models (FastAPI only)
  async getAvailableModels(): Promise<{ current_model: string; available_models: string[] }> {
    const response = await this.makeRequest<{ current_model: string; available_models: string[] }>('/api/models');
    return response.data as { current_model: string; available_models: string[] };
  }

  // Utility methods
  async ping(): Promise<boolean> {
    try {
      await this.getHealth();
      return true;
    } catch {
      return false;
    }
  }

  async isOllamaAvailable(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.ollama === 'available';
    } catch {
      return false;
    }
  }

  // File validation
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 16 * 1024 * 1024; // 16MB
    const allowedTypes = ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only PDF files are allowed'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 16MB'
      };
    }

    return { valid: true };
  }

  // Error handling utility
  handleApiError(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    
    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred';
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export individual functions for convenience
export const {
  getHealth,
  getStatus,
  uploadPDF,
  analyzeText,
  getPatientData,
  getAvailableModels,
  ping,
  isOllamaAvailable,
  validateFile,
  handleApiError
} = apiService;

export default apiService;