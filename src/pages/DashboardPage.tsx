import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData, useTrendData, useFileUpload } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'normal': return 'bg-green-100 text-green-800';
    case 'high': return 'bg-red-100 text-red-800';
    case 'low': return 'bg-blue-100 text-blue-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatValue = (value: any, unit?: string) => {
  if (typeof value === 'number') {
    return `${value.toFixed(2)} ${unit || ''}`.trim();
  }
  return `${value} ${unit || ''}`.trim();
};

const PatientCard = ({ patient }: any) => {
  const latestResults = patient.lab_results
    .sort((a: any, b: any) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())
    .slice(0, 5);

  const abnormalCount = patient.lab_results.filter((r: any) => 
    r.status.toLowerCase() !== 'normal'
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {patient.name}
        </CardTitle>
        <CardDescription>
          {patient.age && `Age: ${patient.age}`} {patient.gender && `• ${patient.gender}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{patient.lab_results.length}</div>
            <div className="text-sm text-gray-600">Total Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{abnormalCount}</div>
            <div className="text-sm text-gray-600">Abnormal</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Latest Results</h4>
          {latestResults.map((result: any) => (
            <div key={result.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-sm">{result.test_name}</div>
                <div className="text-xs text-gray-600">{result.test_date}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatValue(result.value, result.unit)}</div>
                <Badge className={`text-xs ${getStatusColor(result.status)}`}>
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

const TrendChart = ({ data, title, yAxisLabel }: any) => {
  const chartData = data.map((point: any) => ({
    date: new Date(point.date).toLocaleDateString(),
    value: typeof point.value === 'number' ? point.value : parseFloat(point.value) || 0,
    status: point.status,
    min: point.reference_range_min,
    max: point.reference_range_max,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value: any, name: string) => [
                `${value} ${yAxisLabel}`, 
                name
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            {chartData[0]?.min && (
              <Line 
                type="monotone" 
                dataKey="min" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
              />
            )}
            {chartData[0]?.max && (
              <Line 
                type="monotone" 
                dataKey="max" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { userData, loading: userLoading, error: userError, refetch: refetchUserData } = useUserData();
  const { trendData, loading: trendLoading, error: trendError } = useTrendData();
  const { uploadFile, uploading, uploadError } = useFileUpload();
  const [activeTab, setActiveTab] = useState('overview');

  const handleFileUpload = async (file: File) => {
    try {
      await uploadFile(file);
      // Refetch user data after successful upload
      await refetchUserData();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Medical Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Error Messages */}
      {(userError || trendError || uploadError) && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {userError || trendError || uploadError}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <User className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{userData?.patients?.length || 0}</div>
                    <div className="text-sm text-gray-600">Patients</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {userData?.patients?.reduce((acc, p) => acc + p.lab_results.length, 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Tests</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {userData?.patients?.reduce((acc, p) => 
                        acc + p.lab_results.filter(r => r.status.toLowerCase() !== 'normal').length, 0
                      ) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Abnormal</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {userData?.patients?.[0]?.lab_results?.length ? 
                        new Date(userData.patients[0].lab_results
                          .sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())[0]?.test_date
                        ).toLocaleDateString() : 'N/A'
                      }
                    </div>
                    <div className="text-sm text-gray-600">Last Test</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Cards */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Patients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData?.patients?.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
              {!userData?.patients?.length && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No patient data found. Upload a lab report to get started.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Lab Report
              </CardTitle>
              <CardDescription>
                Upload a PDF lab report to extract and analyze medical data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={handleFileUpload}
                loading={uploading}
                onError={(error) => console.error('Upload error:', error)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Test Trends</h2>
            {trendLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading trend data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {trendData?.trends && Object.entries(trendData.trends).map(([testName, data]) => (
                  <TrendChart 
                    key={testName}
                    data={data}
                    title={testName}
                    yAxisLabel={data[0]?.unit || 'Value'}
                  />
                ))}
                {!trendData?.trends || Object.keys(trendData.trends).length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-600">No trend data available. Upload more lab reports to see trends.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Reports
              </CardTitle>
              <CardDescription>
                Export your medical data in various formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;