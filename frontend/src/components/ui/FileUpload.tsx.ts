// src/components/FileUpload.tsx
import React, { useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useFileUpload } from '../hooks/hooks';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onError,
  loading = false,
  disabled = false,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isDragging,
    validation,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    resetUpload
  } = useFileUpload(onFileSelect, onError);

  const handleClick = () => {
    if (!disabled && !loading) {
      fileInputRef.current?.click();
    }
  };

  const getBorderColor = () => {
    if (validation?.valid === false) return 'border-red-300';
    if (validation?.valid === true) return 'border-green-300';
    if (isDragging) return 'border-blue-400';
    return 'border-gray-300';
  };

  const getBackgroundColor = () => {
    if (validation?.valid === false) return 'bg-red-50';
    if (validation?.valid === true) return 'bg-green-50';
    if (isDragging) return 'bg-blue-50';
    return 'bg-gray-50';
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${getBorderColor()}
          ${getBackgroundColor()}
          ${disabled || loading ? 'cursor-not-allowed opacity-50' : 'hover:border-blue-400 hover:bg-blue-50'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || loading}
        />

        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm">
            {loading ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            ) : validation?.valid === false ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : validation?.valid === true ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : isDragging ? (
              <FileText className="w-8 h-8 text-blue-500" />
            ) : (
              <Upload className="w-8 h-8 text-gray-500" />
            )}
          </div>

          {/* Main Text */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {loading ? 'Processing...' : 'Upload Medical Lab Report'}
            </h3>
            
            {!loading && (
              <p className="text-sm text-gray-600">
                {isDragging 
                  ? 'Drop your PDF file here'
                  : 'Drag and drop your PDF file here, or click to browse'
                }
              </p>
            )}
          </div>

          {/* File Requirements */}
          {!loading && !validation && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>• PDF files only</p>
              <p>• Maximum size: 16MB</p>
              <p>• Medical lab reports with test results</p>
            </div>
          )}

          {/* Validation Messages */}
          {validation?.valid === false && validation.error && (
            <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-100 px-3 py-2 rounded-md">
              <AlertCircle className="w-4 h-4" />
              <span>{validation.error}</span>
            </div>
          )}

          {validation?.valid === true && (
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-100 px-3 py-2 rounded-md">
              <CheckCircle className="w-4 h-4" />
              <span>File is valid and ready to process</span>
            </div>
          )}

          {/* Loading Message */}
          {loading && (
            <div className="text-sm text-blue-600">
              <p>Extracting content from PDF...</p>
              <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// src/components/MedicalDataDisplay.tsx
import React from 'react';
import { MedicalData, LabResult } from '../types/medical';
import { User, Calendar, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

interface MedicalDataDisplayProps {
  data: MedicalData;
  className?: string;
}

export const MedicalDataDisplay: React.FC<MedicalDataDisplayProps> = ({
  data,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high':
      case 'low':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Patient Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Patient Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-lg font-semibold text-gray-900">{data.patientInfo.name}</p>
          </div>
          
          {data.patientInfo.age && (
            <div>
              <label className="text-sm font-medium text-gray-500">Age</label>
              <p className="text-lg font-semibold text-gray-900">{data.patientInfo.age} years</p>
            </div>
          )}
          
          {data.patientInfo.gender && (
            <div>
              <label className="text-sm font-medium text-gray-500">Gender</label>
              <p className="text-lg font-semibold text-gray-900 capitalize">{data.patientInfo.gender}</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-500">Last Test Date</label>
            <p className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(data.patientInfo.lastTestDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Test Categories Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.testCategories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
              <p className="text-xs text-gray-500">{category.tests.length} tests</p>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Results */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Test Results</h2>
        
        {data.latestResults.length > 0 ? (
          <div className="space-y-4">
            {data.latestResults.map((result) => (
              <div key={result.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{result.testName}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                    {getStatusIcon(result.status)}
                    <span className="ml-1 capitalize">{result.status}</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <label className="text-gray-500">Value</label>
                    <p className="font-semibold">{result.value} {result.unit}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-500">Reference Range</label>
                    <p className="font-semibold">
                      {result.referenceRange.min} - {result.referenceRange.max} {result.unit}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-gray-500">Category</label>
                    <p className="font-semibold capitalize">{result.category}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-500">Date</label>
                    <p className="font-semibold">{new Date(result.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No test results found in the uploaded document.</p>
            <p className="text-sm text-gray-400 mt-1">
              Please ensure the PDF contains medical lab test results with values and reference ranges.
            </p>
          </div>
        )}
      </div>

      {/* Processing Metadata */}
      {data.processing_metadata && (
        <div className="bg-gray-50 rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Processing Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-600">
            {data.processing_metadata.filename && (
              <div>
                <span className="font-medium">File:</span> {data.processing_metadata.filename}
              </div>
            )}
            
            {data.processing_metadata.extraction_metadata?.page_count && (
              <div>
                <span className="font-medium">Pages:</span> {data.processing_metadata.extraction_metadata.page_count}
              </div>
            )}
            
            {data.processing_metadata.extraction_metadata?.table_count !== undefined && (
              <div>
                <span className="font-medium">Tables:</span> {data.processing_metadata.extraction_metadata.table_count}
              </div>
            )}
            
            <div>
              <span className="font-medium">LLM Status:</span> {data.processing_metadata.ollama_available ? 'Available' : 'Fallback'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};