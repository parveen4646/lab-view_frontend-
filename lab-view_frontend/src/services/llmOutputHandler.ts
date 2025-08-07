import { z } from 'zod';
import { ProcessingResponse } from '../types/llm';

/**
 * Cleans and validates LLM output against a schema
 */
export class LLMOutputHandler {
  private static readonly MAX_RETRIES = 2;
  private static readonly DEFAULT_SCHEMA = ProcessingResponse;

  /**
   * Process and validate LLM output
   */
  static async processOutput<T>(
    rawOutput: string,
    schema: z.ZodType<T> = this.DEFAULT_SCHEMA as any,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<{ success: boolean; data?: T; error?: string; cleanedOutput?: string }> {
    let cleanedOutput = rawOutput;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        // Try to clean the output
        cleanedOutput = this.cleanJsonOutput(cleanedOutput);
        
        // Parse the JSON
        const parsed = JSON.parse(cleanedOutput);
        
        // Validate against schema
        const result = schema.safeParse(parsed);
        
        if (result.success) {
          return { 
            success: true, 
            data: result.data,
            cleanedOutput: JSON.stringify(parsed, null, 2)
          };
        } else {
          // If validation fails, try to fix common issues
          lastError = new Error(this.formatZodError(result.error));
          
          if (attempt === 0) {
            // Try to fix common issues on first retry
            const fixed = this.fixCommonIssues(cleanedOutput);
            if (fixed !== cleanedOutput) {
              cleanedOutput = fixed;
              attempt++;
              continue;
            }
          }
        }
      } catch (error) {
        lastError = error as Error;
        
        // Try to extract JSON from markdown code blocks
        if (attempt === 0) {
          const extracted = this.extractJsonFromMarkdown(cleanedOutput);
          if (extracted) {
            cleanedOutput = extracted;
            attempt++;
            continue;
          }
        }
      }
      
      attempt++;
    }

    return {
      success: false,
      error: lastError?.message || 'Failed to process LLM output',
      cleanedOutput
    };
  }

  /**
   * Clean JSON output from common LLM formatting issues
   */
  private static cleanJsonOutput(output: string): string {
    // Remove markdown code block markers
    let cleaned = output
      .replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/gm, '$1')
      .trim();

    // Fix common JSON formatting issues
    cleaned = cleaned
      // Remove trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix unescaped quotes in strings
      .replace(/([^\\])\\(["'])/g, '$1$2')
      // Fix missing quotes around keys
      .replace(/([{,]\s*)([\w_]+)(\s*:)/g, '$1"$2"$3')
      // Fix single quotes to double quotes
      .replace(/'/g, '"')
      // Remove comments (not valid in JSON)
      .replace(/\/\*[\s\S]*?\*\/|([^:]\/\/).*?$/gm, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned;
  }

  /**
   * Extract JSON from markdown code blocks
   */
  private static extractJsonFromMarkdown(markdown: string): string | null {
    // Try to find JSON in markdown code blocks
    const jsonMatch = markdown.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }
    
    // Try to find any JSON-like object
    const objectMatch = markdown.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return objectMatch[0].trim();
    }
    
    return null;
  }

  /**
   * Fix common JSON issues
   */
  private static fixCommonIssues(jsonString: string): string {
    // Add missing commas between objects in arrays
    let fixed = jsonString.replace(/\}\s*\{/g, '},{');
    
    // Fix missing commas between key-value pairs
    fixed = fixed.replace(/"\s*"([^"])/g, '","$1');
    
    // Fix unquoted values
    fixed = fixed.replace(/:\s*([^\s"\[\]\{\},]+)([,\}])/g, ':"$1"$2');
    
    return fixed;
  }

  /**
   * Format Zod validation errors for better readability
   */
  private static formatZodError(error: z.ZodError): string {
    return error.errors
      .map(err => {
        const path = err.path.join('.');
        return `• ${path}: ${err.message}`;
      })
      .join('\n');
  }

  /**
   * Create a minimal valid response when parsing fails
   */
  static createMinimalValidResponse(error: string, pageNum: number) {
    return {
      patientInfo: {
        id: 'error',
        name: 'Error',
        lastTestDate: new Date().toISOString().split('T')[0]
      },
      latestResults: [],
      testCategories: [],
      processing_metadata: {
        validation_success: false,
        error,
        page_number: pageNum,
        timestamp: new Date().toISOString()
      }
    };
  }
}
