import { useState, useCallback } from 'react';
import { LLMOutputHandler } from '../services/llmOutputHandler';
import { ProcessingResponse, ProcessingResponseSchema } from '../types/llm';

type UseLLMOutputOptions = {
  onSuccess?: (data: ProcessingResponse) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
};

export const useLLMOutput = (options: UseLLMOutputOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<ProcessingResponse | null>(null);
  const [cleanedOutput, setCleanedOutput] = useState<string>('');

  const processOutput = useCallback(
    async (rawOutput: string, pageNum: number = 0) => {
      setIsProcessing(true);
      setError(null);

      try {
        const { success, data, error: processError, cleanedOutput: output } = 
          await LLMOutputHandler.processOutput(
            rawOutput,
            ProcessingResponseSchema,
            options.maxRetries
          );

        setCleanedOutput(output || '');

        if (success && data) {
          const response = data as ProcessingResponse;
          setResult(response);
          options.onSuccess?.(response);
          return { success: true, data: response };
        } else {
          const error = new Error(processError || 'Failed to process LLM output');
          setError(error);
          options.onError?.(error);
          
          // Return a minimal valid response
          const minimalResponse = LLMOutputHandler.createMinimalValidResponse(
            `Page ${pageNum}: ${error.message}`,
            pageNum
          );
          
          return { 
            success: false, 
            error,
            data: minimalResponse as ProcessingResponse
          };
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options.onError?.(error);
        
        // Return a minimal valid response
        const minimalResponse = LLMOutputHandler.createMinimalValidResponse(
          `Page ${pageNum}: ${error.message}`,
          pageNum
        );
        
        return { 
          success: false, 
          error,
          data: minimalResponse as ProcessingResponse
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setResult(null);
    setCleanedOutput('');
  }, []);

  return {
    processOutput,
    isProcessing,
    error,
    result,
    cleanedOutput,
    reset,
  };
};
