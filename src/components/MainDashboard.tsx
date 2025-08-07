import React, { useState, useCallback } from 'react';
import { FileUpload } from './ui/FileUpload';
import { MedicalDataDisplay } from './ui/MedicalDataDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { AlertCircle, CheckCircle, Clock, Server } from 'lucide-react';
import { logger } from '@/utils/logger';

export const MainDashboard: React.FC = () => {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(false);

  // Initialize API service with auth token
  React.useEffect(() => {
    logger.logPageView('/dashboard');
    apiService.setAuthTokenGetter(getToken);
    
    // Check API status
    const checkStatus = async () => {
      try {
        logger.debug('Checking API status', 'Dashboard');
        await apiService.getHealth();
        setIsOnline(true);
        const status = await apiService.getStatus();
        setIsOllamaAvailable(status.ollama === 'available');
        logger.info(`API status checked - Online: ${true}, Ollama: ${status.ollama}`, 'Dashboard');
      } catch (error) {
        setIsOnline(false);
        setIsOllamaAvailable(false);
        logger.warn('API status check failed', 'Dashboard', { error });
      }
    };
    
    checkStatus();
  }, [getToken]);

  const uploadPDF = useCallback(async (file: File) => {
    const startTime = Date.now();
    logger.logUploadStart(file.name, file.size);
    
    setLoading(true);
    setError(null);
    setProgress('Uploading file...');
    
    try {
      setProgress('Processing PDF with AI...');
      logger.info(`Starting PDF processing: ${file.name}`, 'Upload');
      const result = await apiService.uploadPDF(file);
      setData(result);
      setProgress('Complete!');
      
      const duration = Date.now() - startTime;
      logger.logUploadComplete(file.name, duration);
      logger.logUserAction('PDF Upload Success', { filename: file.name, duration });
    } catch (err) {
      const errorMessage = apiService.handleApiError(err);
      setError(errorMessage);
      setProgress('');
      logger.logUploadError(file.name, errorMessage);
      logger.error(`PDF upload failed: ${errorMessage}`, 'Upload', { filename: file.name });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleFileUpload = async (file: File) => {
    await uploadPDF(file);
  };

  const handleError = (errorMessage: string) => {
    logger.error(`Upload error: ${errorMessage}`, 'Upload');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Status Bar */}
      <div className="mb-6 flex items-center justify-between bg-white rounded-lg shadow-sm border px-4 py-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-700">
              API: {isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Server className={`w-4 h-4 ${isOllamaAvailable ? 'text-green-500' : 'text-yellow-500'}`} />
            <span className="text-sm font-medium text-gray-700">
              Ollama: {isOllamaAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Status: {isOnline ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Upload */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Medical Lab Report</h2>
            <FileUpload 
              onFileSelect={handleFileUpload}
              onError={handleError}
              loading={loading}
              disabled={!isOnline}
              accept=".pdf"
            />
          </div>

          {/* Processing Status */}
          {loading && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-3 animate-spin" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Processing Document</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {progress || (!isOllamaAvailable 
                      ? 'Using fallback analysis (Ollama unavailable)'
                      : 'Analyzing with AI model...'
                    )}
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    💡 Large PDFs with multiple pages may take 2-5 minutes to process
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2">
          {data ? (
            <MedicalDataDisplay data={data} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to Process Medical Reports
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Upload a PDF file of your medical lab report to get started.
                  The system will extract and analyze test results automatically.
                </p>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <p>✓ Supports standard medical lab report formats</p>
                  <p>✓ Extracts test values and reference ranges</p>
                  <p>✓ Categorizes tests and identifies abnormal values</p>
                  <p>✓ Saves analysis results for future reference</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
