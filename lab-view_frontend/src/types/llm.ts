import { z } from 'zod';

// Base schema for test results
export const TestResultSchema = z.object({
  testName: z.string(),
  result: z.union([z.string(), z.number(), z.null()]),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  flag: z.enum(['high', 'low', 'normal']).optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export type TestResult = z.infer<typeof TestResultSchema>;

// Schema for test categories
export const TestCategorySchema = z.object({
  categoryName: z.string(),
  tests: z.array(TestResultSchema),
  notes: z.string().optional(),
});

export type TestCategory = z.infer<typeof TestCategorySchema>;

// Schema for patient information
export const PatientInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional(),
  lastTestDate: z.string(),
  doctor: z.string().optional(),
  labId: z.string().optional(),
});

export type PatientInfo = z.infer<typeof PatientInfoSchema>;

// Schema for processing metadata
export const ProcessingMetadataSchema = z.object({
  validation_success: z.boolean(),
  validation_retry: z.boolean().optional(),
  validation_errors: z.array(z.any()).optional(),
  page_number: z.number(),
  timestamp: z.string().optional(),
  error: z.string().optional(),
});

export type ProcessingMetadata = z.infer<typeof ProcessingMetadataSchema>;

// Main response schema
export const ProcessingResponseSchema = z.object({
  patientInfo: PatientInfoSchema,
  latestResults: z.array(TestResultSchema),
  testCategories: z.array(TestCategorySchema),
  processing_metadata: ProcessingMetadataSchema.optional(),
});

export type ProcessingResponse = z.infer<typeof ProcessingResponseSchema>;

// Schema for error responses
export const ErrorResponseSchema = z.object({
  error: z.string(),
  page_number: z.number(),
  processing_success: z.boolean(),
  exception: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Union type for all possible responses
export type LLMResponse = ProcessingResponse | ErrorResponse;

export const LLMResponseSchema = z.union([
  ProcessingResponseSchema,
  ErrorResponseSchema,
]);
