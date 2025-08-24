import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLabResults } from '@/hooks/useLabResults';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Activity,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface HealthTrendsChartProps {
  isLoading?: boolean;
  error?: string;
}

export const HealthTrendsChart: React.FC<HealthTrendsChartProps> = ({
  isLoading: propIsLoading = false,
  error: propError
}) => {
  const [selectedMetric, setSelectedMetric] = useState('glucose');
  const [timeRange, setTimeRange] = useState('6months');

  // Get real lab results data
  const { 
    results: labResults, 
    isLoading: labIsLoading, 
    error: labError 
  } = useLabResults();

  // Process real lab results into trend data
  const trendData = useMemo(() => {
    console.log('🔄 Processing lab results for trends:', labResults.length);
    
    if (!Array.isArray(labResults) || labResults.length === 0) {
      return { glucose: [], cholesterol: [], hemoglobin: [] };
    }

    // Group results by test name and sort by date
    const groupedByTest: { [key: string]: any[] } = {};
    
    labResults.forEach(result => {
      const testName = result.test_name?.toLowerCase().trim();
      if (!testName) return;
      
      // Map common test names to our standard metrics
      let metricKey = '';
      if (testName.includes('glucose') || testName.includes('sugar')) {
        metricKey = 'glucose';
      } else if (testName.includes('cholesterol')) {
        metricKey = 'cholesterol';
      } else if (testName.includes('hemoglobin') || testName.includes('hgb')) {
        metricKey = 'hemoglobin';
      }
      
      if (metricKey && result.test_date && typeof result.value === 'number') {
        if (!groupedByTest[metricKey]) {
          groupedByTest[metricKey] = [];
        }
        
        groupedByTest[metricKey].push({
          date: result.test_date,
          value: result.value,
          normal: result.status === 'normal'
        });
      }
    });

    // Sort each metric by date and return
    Object.keys(groupedByTest).forEach(key => {
      groupedByTest[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    console.log('✅ Processed trend data:', Object.keys(groupedByTest).map(key => `${key}: ${groupedByTest[key].length} points`));
    
    return {
      glucose: groupedByTest.glucose || [],
      cholesterol: groupedByTest.cholesterol || [],
      hemoglobin: groupedByTest.hemoglobin || []
    };
  }, [labResults]);

  // Dynamic metrics based on available data
  const allMetrics = [
    { 
      id: 'glucose', 
      name: 'Glucose (Fasting)', 
      unit: 'mg/dL', 
      range: '70-100',
      color: '#3b82f6'
    },
    { 
      id: 'cholesterol', 
      name: 'Total Cholesterol', 
      unit: 'mg/dL', 
      range: '<200',
      color: '#ef4444'
    },
    { 
      id: 'hemoglobin', 
      name: 'Hemoglobin', 
      unit: 'g/dL', 
      range: '12.0-16.0',
      color: '#10b981'
    }
  ];

  // Only show metrics that have data
  const metrics = allMetrics.filter(metric => 
    trendData[metric.id as keyof typeof trendData]?.length > 0
  );

  // Auto-select first available metric if current selection has no data
  React.useEffect(() => {
    if (metrics.length > 0 && !metrics.find(m => m.id === selectedMetric)) {
      setSelectedMetric(metrics[0].id);
    }
  }, [metrics, selectedMetric]);

  const currentData = trendData[selectedMetric as keyof typeof trendData] || [];
  const currentMetric = metrics.find(m => m.id === selectedMetric);
  
  // Calculate trend
  const latestValue = currentData[currentData.length - 1]?.value;
  const previousValue = currentData[currentData.length - 2]?.value;
  const trend = latestValue && previousValue ? latestValue - previousValue : 0;
  const trendPercentage = previousValue ? ((trend / previousValue) * 100).toFixed(1) : '0';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            {new Date(label).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold" style={{ color: currentMetric?.color }}>
              {payload[0].value} {currentMetric?.unit}
            </span>
          </p>
          <div className="flex items-center gap-1 mt-1">
            {data.normal ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-600" />
            )}
            <span className="text-xs text-gray-500">
              {data.normal ? 'Normal' : 'Abnormal'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const isLoading = propIsLoading || labIsLoading;
  const error = propError || labError;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Trends</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show message when no trend data is available
  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Health Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trend Data Available</h3>
            <p className="text-gray-600 mb-4">
              We need multiple lab results over time to show health trends. 
              Upload more lab reports to see your progress charts.
            </p>
            <p className="text-sm text-gray-500">
              Looking for: Glucose, Cholesterol, Hemoglobin test results with dates
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Health Trends
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map(metric => (
                    <SelectItem key={metric.id} value={metric.id}>
                      {metric.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Metric Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600">Current Value</h4>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-gray-900">{latestValue}</span>
                <span className="text-sm text-gray-500">{currentMetric?.unit}</span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600">Reference Range</h4>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {currentMetric?.range}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600">Trend</h4>
              <div className="flex items-center gap-2 mt-1">
                {trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-600" />
                ) : trend < 0 ? (
                  <TrendingDown className="w-4 h-4 text-green-600" />
                ) : (
                  <Target className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-lg font-semibold text-gray-900">
                  {Math.abs(Number(trendPercentage))}%
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600">Status</h4>
              <div className="mt-1">
                <Badge variant={currentData[currentData.length - 1]?.normal ? 'default' : 'destructive'}>
                  {currentData[currentData.length - 1]?.normal ? 'Normal' : 'Abnormal'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentMetric?.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={currentMetric?.color} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  className="text-xs"
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']}
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={currentMetric?.color}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={2}
                  dot={{ fill: currentMetric?.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: currentMetric?.color, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Health Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentData.length > 1 && (
              <div className={`p-4 border rounded-lg ${
                currentData[currentData.length - 1]?.normal 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  currentData[currentData.length - 1]?.normal 
                    ? 'text-green-900' 
                    : 'text-orange-900'
                }`}>
                  {currentMetric?.name} Analysis
                </h4>
                <p className={`text-sm ${
                  currentData[currentData.length - 1]?.normal 
                    ? 'text-green-800' 
                    : 'text-orange-800'
                }`}>
                  Based on your {currentData.length} test results, your latest {currentMetric?.name.toLowerCase()} 
                  level is {latestValue} {currentMetric?.unit}. 
                  {currentData[currentData.length - 1]?.normal 
                    ? ` This is within the normal range (${currentMetric?.range}).`
                    : ` This is outside the normal range (${currentMetric?.range}). Consider discussing with your healthcare provider.`
                  }
                  {Math.abs(Number(trendPercentage)) > 0 && (
                    <span>
                      {' '}Your levels have {trend > 0 ? 'increased' : 'decreased'} by {Math.abs(Number(trendPercentage))}% 
                      since your previous test.
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {currentData.length === 1 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Single Data Point</h4>
                <p className="text-blue-800 text-sm">
                  You have one {currentMetric?.name} result: {latestValue} {currentMetric?.unit}. 
                  Upload more lab reports over time to see trends and track your progress.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};