import React from 'react';
import { User, Calendar, FileText, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface MedicalData {
  patient_info?: {
    name?: string;
    age?: number;
    gender?: string;
    id?: string;
  };
  test_results?: Array<{
    test_name: string;
    value: string;
    reference_range?: string;
    unit?: string;
    status?: 'normal' | 'high' | 'low' | 'abnormal';
    category?: string;
  }>;
  summary?: {
    total_tests: number;
    abnormal_count: number;
    categories: string[];
  };
}

interface MedicalDataDisplayProps {
  data: MedicalData;
}

export const MedicalDataDisplay: React.FC<MedicalDataDisplayProps> = ({ data }) => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'high':
      case 'low':
      case 'abnormal':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'high':
      case 'low':
      case 'abnormal':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const groupedResults = data.test_results?.reduce((acc, test) => {
    const category = test.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(test);
    return acc;
  }, {} as Record<string, typeof data.test_results>);

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      {data.patient_info && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.patient_info.name && (
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-sm text-gray-900">{data.patient_info.name}</p>
              </div>
            )}
            {data.patient_info.age && (
              <div>
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-sm text-gray-900">{data.patient_info.age} years</p>
              </div>
            )}
            {data.patient_info.gender && (
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-sm text-gray-900">{data.patient_info.gender}</p>
              </div>
            )}
            {data.patient_info.id && (
              <div>
                <label className="text-sm font-medium text-gray-500">Patient ID</label>
                <p className="text-sm text-gray-900">{data.patient_info.id}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {data.summary && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.summary.total_tests}</div>
              <div className="text-sm text-blue-700">Total Tests</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{data.summary.abnormal_count}</div>
              <div className="text-sm text-red-700">Abnormal Results</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data.summary.total_tests - data.summary.abnormal_count}
              </div>
              <div className="text-sm text-green-700">Normal Results</div>
            </div>
          </div>
          
          {data.summary.categories && data.summary.categories.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500 block mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {data.summary.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test Results */}
      {data.test_results && data.test_results.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
            </div>
          </div>
          
          <div className="p-6">
            {groupedResults ? (
              Object.entries(groupedResults).map(([category, tests]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="text-md font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200">
                    {category}
                  </h3>
                  
                  <div className="space-y-3">
                    {tests?.map((test, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <h4 className="font-medium">{test.test_name}</h4>
                              {test.reference_range && (
                                <p className="text-sm opacity-75">
                                  Reference: {test.reference_range}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold">
                              {test.value} {test.unit && <span className="text-sm">{test.unit}</span>}
                            </div>
                            {test.status && (
                              <div className="text-sm capitalize">
                                {test.status}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                {data.test_results.map((test, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h4 className="font-medium">{test.test_name}</h4>
                          {test.reference_range && (
                            <p className="text-sm opacity-75">
                              Reference: {test.reference_range}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">
                          {test.value} {test.unit && <span className="text-sm">{test.unit}</span>}
                        </div>
                        {test.status && (
                          <div className="text-sm capitalize">
                            {test.status}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
