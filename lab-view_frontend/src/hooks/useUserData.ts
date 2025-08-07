import { useState, useEffect, useCallback } from 'react';
import { userDataService, UserData, TrendData } from '@/services/userDataService';
import { useAuth } from '@/contexts/AuthContext';

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await userDataService.getUserData();
      setUserData(data);
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    userData,
    loading,
    error,
    refetch: fetchUserData,
  };
};

export const useTrendData = (patientId?: string) => {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchTrendData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await userDataService.getTrendData(patientId);
      setTrendData(data);
    } catch (err: any) {
      console.error('Error fetching trend data:', err);
      setError(err.message || 'Failed to fetch trend data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, patientId]);

  useEffect(() => {
    fetchTrendData();
  }, [fetchTrendData]);

  return {
    trendData,
    loading,
    error,
    refetch: fetchTrendData,
  };
};

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    try {
      setUploading(true);
      setUploadError(null);
      const result = await userDataService.uploadPDF(file);
      return result;
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setUploadError(err.message || 'Failed to upload file');
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    uploadFile,
    uploading,
    uploadError,
  };
};