import { supabase } from '@/lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserData {
  user: {
    id: string;
    email: string;
    full_name?: string;
    created_at?: string;
  };
  patients: Array<{
    id: string;
    name: string;
    age?: number;
    gender?: string;
    date_of_birth?: string;
    created_at?: string;
    lab_results: Array<{
      id: string;
      test_name: string;
      value: any;
      unit?: string;
      is_numeric: boolean;
      reference_range_min?: number;
      reference_range_max?: number;
      status: string;
      test_date: string;
      category: string;
      created_at?: string;
    }>;
  }>;
}

export interface TrendData {
  trends: Record<string, Array<{
    date: string;
    value: any;
    status: string;
    unit?: string;
    reference_range_min?: number;
    reference_range_max?: number;
    patient_name: string;
  }>>;
}

class UserDataService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.access_token) {
      throw new Error('No valid session found');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  async getUserData(): Promise<UserData> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/user/data`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<UserData> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch user data');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  async getTrendData(patientId?: string): Promise<TrendData> {
    try {
      const headers = await this.getAuthHeaders();
      const url = new URL(`${API_BASE_URL}/api/user/trends`);
      
      if (patientId) {
        url.searchParams.append('patient_id', patientId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<TrendData> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch trend data');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      throw error;
    }
  }

  async uploadPDF(file: File): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      delete headers['Content-Type']; // Let browser set content-type for FormData
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload PDF');
      }

      return result.data;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }
}

export const userDataService = new UserDataService();