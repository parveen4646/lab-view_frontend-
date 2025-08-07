import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData, useTrendData, useFileUpload } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from '@/components/ui/FileUpload';
import { 
  User, 
  Upload, 
  TrendingUp, 
  Activity, 
  Heart, 
  Droplets, 
  AlertCircle, 
  Calendar,
  Download,
  RefreshCw,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'normal': return 'bg-green-100 text-green-800 border-green-200';
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatValue = (value: any, unit?: string) => {
  if (typeof value === 'number') {
    return `${value.toFixed(2)} ${unit || ''}`.trim();
  }
  return `${value} ${unit || ''}`.trim();
};

const StatsCard = ({ icon: Icon, title, value, subtitle, color = "blue" }: any) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50", 
    red: "text-red-600 bg-red-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50"
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm font-medium text-gray-700">{title}</div>
            {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PatientInfoCard = ({ patient }: any) => {
  const latestResults = patient.lab_results
    .sort((a: any, b: any) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())
    .slice(0, 3);

  const abnormalCount = patient.lab_results.filter((r: any) => 
    r.status.toLowerCase() !== 'normal'
  ).length;

  const normalCount = patient.lab_results.length - abnormalCount;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{patient.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {patient.age && <span>Age: {patient.age}</span>}
                {patient.gender && <span>• {patient.gender}</span>}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {patient.lab_results.length} Tests
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{normalCount}</div>
            <div className="text-sm text-green-700">Normal</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{abnormalCount}</div>
            <div className="text-sm text-red-700">Abnormal</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Latest Results
          </h4>
          {latestResults.map((result: any) => (
            <div key={result.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
              <div>
                <div className="font-medium text-sm text-gray-900">{result.test_name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(result.test_date).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{formatValue(result.value, result.unit)}</div>
                <Badge className={`text-xs border ${getStatusColor(result.status)}`}>
                  {result.status === 'normal' ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {result.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const UploadSection = ({ onFileUpload, uploading, uploadError }: any) => {
  return (
    <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Upload Lab Report</CardTitle>
        <CardDescription className="text-base">
          Upload your PDF lab report to extract and analyze medical data automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <FileUpload
          onFileSelect={onFileUpload}
          loading={uploading}
          onError={(error) => console.error('Upload error:', error)}
        />
        {uploadError && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {uploadError}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export const ImprovedDashboard: React.FC = () => {
  const { user } = useAuth();
  const { userData, loading: userLoading, error: userError, refetch: refetchUserData } = useUserData();
  const { trendData, loading: trendLoading } = useTrendData();
  const { uploadFile, uploading, uploadError } = useFileUpload();

  const handleFileUpload = async (file: File) => {
    try {
      await uploadFile(file);
      await refetchUserData();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we fetch your medical data...</p>
        </div>
      </div>
    );
  }

  const totalTests = userData?.patients?.reduce((acc, p) => acc + p.lab_results.length, 0) || 0;
  const abnormalTests = userData?.patients?.reduce((acc, p) => 
    acc + p.lab_results.filter(r => r.status.toLowerCase() !== 'normal').length, 0
  ) || 0;
  const normalTests = totalTests - abnormalTests;
  const lastTestDate = userData?.patients?.[0]?.lab_results?.length ? 
    new Date(userData.patients[0].lab_results
      .sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())[0]?.test_date
    ).toLocaleDateString() : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.user_metadata?.full_name || user?.name || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Your Medical Dashboard
                {user?.user_metadata?.age && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>Age: {user.user_metadata.age}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {userError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {userError}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Users}
            title="Patients"
            value={userData?.patients?.length || 0}
            color="blue"
          />
          <StatsCard
            icon={FileText}
            title="Total Tests"
            value={totalTests}
            color="green"
          />
          <StatsCard
            icon={CheckCircle2}
            title="Normal Results"
            value={normalTests}
            subtitle={totalTests > 0 ? `${Math.round((normalTests / totalTests) * 100)}%` : '0%'}
            color="green"
          />
          <StatsCard
            icon={AlertCircle}
            title="Abnormal Results"
            value={abnormalTests}
            subtitle={totalTests > 0 ? `${Math.round((abnormalTests / totalTests) * 100)}%` : '0%'}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <UploadSection 
              onFileUpload={handleFileUpload}
              uploading={uploading}
              uploadError={uploadError}
            />
          </div>

          {/* Patient Information */}
          <div>
            {userData?.patients?.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Patient Information
                </h2>
                {userData.patients.map((patient) => (
                  <PatientInfoCard key={patient.id} patient={patient} />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patient Data Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Upload your first lab report to see patient information and test results here.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Upload className="h-4 w-4" />
                      Upload PDF
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Processing
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Results
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Last Test Date */}
        {lastTestDate && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              Last test performed on {lastTestDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedDashboard;