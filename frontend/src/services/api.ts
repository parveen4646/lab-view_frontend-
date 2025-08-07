// src/services/api.ts
import { MedicalData, PatientInfo, APIResponse, HealthStatus, SystemStatus } from '../types/medical';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
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
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
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
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/api/upload`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

      const result = await this.handleResponse<MedicalData>(response);
      return result.data as MedicalData;
    } catch (error) {
      console.error('PDF upload failed:', error);
      throw error;
    }
  }

  // Text Analysis
  async analyzeText(text: string, tables?: any[]): Promise<MedicalData> {
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
  handleApiError(error: any): string {
    if (error.message) {
      return error.message;
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