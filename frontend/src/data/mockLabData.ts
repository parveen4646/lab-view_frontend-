import { LabResult, TestCategory, TrendData, PatientInfo } from '@/types/medical';

export const patientInfo: PatientInfo = {
  id: 'p001',
  name: 'Sarah Johnson',
  age: 34,
  gender: 'female',
  dateOfBirth: '1989-03-15',
  lastTestDate: '2024-01-15'
};

export const testCategories: TestCategory[] = [
  {
    id: 'blood',
    name: 'Complete Blood Count',
    description: 'Blood cell counts and basic blood chemistry',
    color: 'hsl(var(--chart-primary))',
    tests: ['hemoglobin', 'hematocrit', 'wbc', 'platelets']
  },
  {
    id: 'lipid',
    name: 'Lipid Panel',
    description: 'Cholesterol and triglyceride levels',
    color: 'hsl(var(--chart-secondary))',
    tests: ['totalCholesterol', 'hdl', 'ldl', 'triglycerides']
  },
  {
    id: 'liver',
    name: 'Liver Function',
    description: 'Liver enzyme and protein levels',
    color: 'hsl(var(--chart-tertiary))',
    tests: ['alt', 'ast', 'bilirubin', 'albumin']
  },
  {
    id: 'kidney',
    name: 'Kidney Function',
    description: 'Kidney function markers',
    color: 'hsl(var(--chart-quaternary))',
    tests: ['creatinine', 'bun', 'gfr']
  }
];

// Generate trend data for the last 12 months
const generateTrendData = (testName: string, baseValue: number, variance: number): TrendData[] => {
  const data: TrendData[] = [];
  const months = ['2023-02', '2023-03', '2023-04', '2023-05', '2023-06', '2023-07', 
                  '2023-08', '2023-09', '2023-10', '2023-11', '2023-12', '2024-01'];
  
  months.forEach(month => {
    const variation = (Math.random() - 0.5) * variance;
    const value = Math.max(0, baseValue + variation);
    let status: 'normal' | 'high' | 'low' | 'critical' = 'normal';
    
    // Simple status logic based on test type
    if (testName === 'cholesterol' && value > 240) status = 'high';
    if (testName === 'glucose' && value > 126) status = 'high';
    if (testName === 'hemoglobin' && value < 12) status = 'low';
    
    data.push({
      date: month,
      value: parseFloat(value.toFixed(1)),
      testName,
      status
    });
  });
  
  return data;
};

export const latestResults: LabResult[] = [
  // Complete Blood Count
  {
    id: 'r001',
    testName: 'Hemoglobin',
    value: 13.8,
    unit: 'g/dL',
    referenceRange: { min: 12.0, max: 15.5 },
    status: 'normal',
    date: '2024-01-15',
    category: 'blood'
  },
  {
    id: 'r002',
    testName: 'Hematocrit',
    value: 41.2,
    unit: '%',
    referenceRange: { min: 36.0, max: 46.0 },
    status: 'normal',
    date: '2024-01-15',
    category: 'blood'
  },
  {
    id: 'r003',
    testName: 'White Blood Cells',
    value: 7.2,
    unit: 'K/uL',
    referenceRange: { min: 4.5, max: 11.0 },
    status: 'normal',
    date: '2024-01-15',
    category: 'blood'
  },
  {
    id: 'r004',
    testName: 'Platelets',
    value: 310,
    unit: 'K/uL',
    referenceRange: { min: 150, max: 450 },
    status: 'normal',
    date: '2024-01-15',
    category: 'blood'
  },
  // Lipid Panel
  {
    id: 'r005',
    testName: 'Total Cholesterol',
    value: 195,
    unit: 'mg/dL',
    referenceRange: { min: 0, max: 200 },
    status: 'normal',
    date: '2024-01-15',
    category: 'lipid'
  },
  {
    id: 'r006',
    testName: 'HDL Cholesterol',
    value: 58,
    unit: 'mg/dL',
    referenceRange: { min: 40, max: 100 },
    status: 'normal',
    date: '2024-01-15',
    category: 'lipid'
  },
  {
    id: 'r007',
    testName: 'LDL Cholesterol',
    value: 118,
    unit: 'mg/dL',
    referenceRange: { min: 0, max: 130 },
    status: 'normal',
    date: '2024-01-15',
    category: 'lipid'
  },
  {
    id: 'r008',
    testName: 'Triglycerides',
    value: 95,
    unit: 'mg/dL',
    referenceRange: { min: 0, max: 150 },
    status: 'normal',
    date: '2024-01-15',
    category: 'lipid'
  },
  // Liver Function
  {
    id: 'r009',
    testName: 'ALT',
    value: 28,
    unit: 'U/L',
    referenceRange: { min: 7, max: 35 },
    status: 'normal',
    date: '2024-01-15',
    category: 'liver'
  },
  {
    id: 'r010',
    testName: 'AST',
    value: 22,
    unit: 'U/L',
    referenceRange: { min: 8, max: 40 },
    status: 'normal',
    date: '2024-01-15',
    category: 'liver'
  },
  // Kidney Function
  {
    id: 'r011',
    testName: 'Creatinine',
    value: 0.9,
    unit: 'mg/dL',
    referenceRange: { min: 0.6, max: 1.1 },
    status: 'normal',
    date: '2024-01-15',
    category: 'kidney'
  },
  {
    id: 'r012',
    testName: 'BUN',
    value: 16,
    unit: 'mg/dL',
    referenceRange: { min: 7, max: 20 },
    status: 'normal',
    date: '2024-01-15',
    category: 'kidney'
  }
];

export const trendData: Record<string, TrendData[]> = {
  cholesterol: generateTrendData('cholesterol', 195, 20),
  hemoglobin: generateTrendData('hemoglobin', 13.8, 1.2),
  glucose: generateTrendData('glucose', 95, 15),
  creatinine: generateTrendData('creatinine', 0.9, 0.2)
};