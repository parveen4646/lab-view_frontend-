import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface LabResult {
  id: string;
  test_name: string;
  value: number | string;
  unit: string;
  reference_range?: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  test_date: string;
  category: string;
}

interface UseLabResultsReturn {
  results: LabResult[];
  isLoading: boolean;
  error: string | null;
  totalTests: number;
  normalResults: number;
  abnormalResults: number;
  refreshResults: () => Promise<void>;
}

export const useLabResults = (): UseLabResultsReturn => {
  const [results, setResults] = useState<LabResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLabResults = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Fetching lab results from /api/lab-results');
      
      // Use the new correct endpoint
      const response = await apiService.getLabResults();
      console.log('✅ Lab results received:', response);
      
      // Extract the lab_results array from the response object
      const labResults = response?.lab_results || response;
      const resultsArray = Array.isArray(labResults) ? labResults : [];
      console.log('🔄 Processed lab results:', resultsArray.length, 'results');
      setResults(resultsArray);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load lab results';
      console.error('Lab results fetch error:', err);
      
      // Only set error for non-404 errors (404 is handled with fallback data)
      if (!err.message?.includes('404')) {
        setError(errorMessage);
        toast({
          title: "Unable to load lab results",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      }
      
      // Set empty array as fallback
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial data load
  useEffect(() => {
    fetchLabResults();
  }, [fetchLabResults]);

  // Refresh function
  const refreshResults = useCallback(async () => {
    await fetchLabResults();
  }, [fetchLabResults]);

  // Computed values with safety checks
  const safeResults = Array.isArray(results) ? results : [];
  const totalTests = safeResults.length;
  const normalResults = safeResults.filter(result => result.status === 'normal').length;
  const abnormalResults = totalTests - normalResults;

  return {
    results,
    isLoading,
    error,
    totalTests,
    normalResults,
    abnormalResults,
    refreshResults,
  };
};