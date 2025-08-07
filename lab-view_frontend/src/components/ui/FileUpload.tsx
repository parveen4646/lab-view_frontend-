import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

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
  
  const [isDragging, setIsDragging] = useState(false);
  const [validation, setValidation] = useState<{
    valid: boolean;
    message?: string;
  } | null>(null);

  const validateFile = useCallback((file: File) => {
    const maxSize = 16 * 1024 * 1024; // 16MB
    const allowedTypes = ['application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Only PDF files are allowed' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, message: 'File size must be less than 16MB' };
    }
    
    return { valid: true, message: 'File is valid' };
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const validationResult = validateFile(file);
    setValidation(validationResult);
    
    if (validationResult.valid) {
      onFileSelect(file);
    } else if (onError && validationResult.message) {
      onError(validationResult.message);
    }
  }, [validateFile, onFileSelect, onError]);

  const resetUpload = useCallback(() => {
    setValidation(null);
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (!disabled && !loading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
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
          ${getBorderColor()} ${getBackgroundColor()}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50'}
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
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || loading}
        />
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-sm text-blue-600 font-medium">Processing...</p>
            </div>
          ) : validation?.valid === true ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <p className="text-sm text-green-600 font-medium">File ready for upload</p>
            </div>
          ) : validation?.valid === false ? (
            <div className="flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-red-600" />
              <p className="text-sm text-red-600 font-medium">{validation.message}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  Drop your PDF file here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse files
                </p>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-400 space-y-1">
            <p>Supported format: PDF</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      </div>
      
      {validation?.message && validation.valid !== false && (
        <div className="mt-2 text-sm text-gray-600">
          {validation.message}
        </div>
      )}
    </div>
  );
};
