// ssrcrt React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainDashboard } from 'src/components/MainDashboard';
import { Header } from './components/Header';
import { Footer } from './components/Foosrcnts/ToastProvider';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<MainDashboard />} />
              <Route path="/upload" element={<MainDashboard />} />
              <Route path="/results" element={<MainDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;

// src/components/MainDashboard.tsx
import React, { useState } from 'react';
import { FileUpload, MedicalDataDisplay } from './FileUpload';
import { useMedicalData, useApiStatus } from '../hooks/hooks';
import { AlertCircle, CheckCircle, Clock, Server } from 'lucide-react';

export const MainDashboard: React.FC = () => {
  const { data, loading, error, uploadPDF, analyzeText, clearError } = useMedicalData();
  const { isOnline, isOllamaAvailable, systemStatus } = useApiStatus();
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');

  const [textInput, setTextInput] = useState('');

  const handleFileUpload = async (file: File) => {
    await uploadPDF(file);
  };

  const handleTextAnalysis = async () => {
    if (textInput.trim()) {
      await analyzeText(textInput.trim());
    }
  };

  const handleError = (errorMessage: string) => {
    // Error is handled by the hook, but we could show toast here
    console.error('Upload error:', errorMessage);
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
        
        {systemStatus && (
          <div className="text-sm text-gray-500">
            Model: {systemStatus.ollama_model}
          </div>
        )}
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Upload/Input */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Tab Navigation */}
            <div className="border-b">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'upload'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upload PDF
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'text'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analyze Text
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'upload' ? (
                <FileUpload
                  onFileSelect={handleFileUpload}
                  onError={handleError}
                  loading={loading}
                  disabled={!isOnline}
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Lab Report Text
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste your medical lab report text here..."
                      className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || !isOnline}
                    />
                  </div>
                  
                  <button
                    onClick={handleTextAnalysis}
                    disabled={loading || !isOnline || !textInput.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Text'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Processing Status */}
          {loading && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-3 animate-spin" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Processing Document</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {!isOllamaAvailable 
                      ? 'Using fallback analysis (Ollama unavailable)'
                      : 'Analyzing with AI model...'
                    }
                  </p>
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
                  Upload a PDF file or paste text content of your medical lab report to get started.
                  The system will extract and analyze test results automatically.
                </p>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <p>✓ Supports standard medical lab report formats</p>
                  <p>✓ Extracts test values and reference ranges</p>
                  <p>✓ Categorizes tests and identifies abnormal values</p>
                  <p>✓ Generates trend analysis when possible</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// src/components/Header.tsx
import React from 'react';
import { Activity, Github, ExternalLink } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LabView</h1>
              <p className="text-sm text-gray-600">Medical Lab Report Analyzer</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/parveen4646/lab-view"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm">GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

// src/components/Footer.tsx
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>
            Built with React, TypeScript, Python Flask/FastAPI, and Ollama
          </p>
          <p className="mt-1">
            Open source medical lab report processing tool
          </p>
        </div>
      </div>
    </footer>
  );
};

// src/components/ToastProvider.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: Toast['type'], message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: Toast['type'], message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message, duration };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`border rounded-lg p-4 shadow-lg max-w-sm ${getBackgroundColor(toast.type)} animate-in slide-in-from-right`}
          >
            <div className="flex items-start">
              {getIcon(toast.type)}
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};