export interface LabResult {
  id: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
  };
  status: 'normal' | 'high' | 'low' | 'critical';
  date: string;
  category: string;
}

export interface TestCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  tests: string[];
}

export interface TrendData {
  date: string;
  value: number;
  testName: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  dateOfBirth: string;
  lastTestDate: string;
}