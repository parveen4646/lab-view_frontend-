import React from 'react';
import {
  Card,
  Title,
  Text,
  Metric,
  Flex,
  Badge,
  ProgressBar,
  Grid,
  AreaChart,
  DonutChart,
  BarChart,
  Tracker,
  Color,
} from '@tremor/react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { useLabResults } from '@/hooks/useLabResults';

interface MedicalOverviewProps {
  healthScore?: number;
  totalTests?: number;
  normalResults?: number;
  abnormalResults?: number;
  isLoading?: boolean;
}

export const MedicalOverview: React.FC<MedicalOverviewProps> = ({
  healthScore: propHealthScore = 85,
  totalTests: propTotalTests = 188,
  normalResults: propNormalResults = 160,
  abnormalResults: propAbnormalResults = 28,
  isLoading: propIsLoading = false
}) => {
  // Get real lab results data
  const { 
    results: labResults, 
    totalTests: realTotalTests,
    normalResults: realNormalResults,
    abnormalResults: realAbnormalResults,
    isLoading: labIsLoading 
  } = useLabResults();
  
  // Use real data if available, otherwise fall back to props
  const healthScore = propHealthScore;
  const totalTests = realTotalTests > 0 ? realTotalTests : propTotalTests;
  const normalResults = realTotalTests > 0 ? realNormalResults : propNormalResults;
  const abnormalResults = realTotalTests > 0 ? realAbnormalResults : propAbnormalResults;
  const isLoading = labIsLoading || propIsLoading;
  
  // Debug logging
  console.log('🔬 MedicalOverview Data:', {
    realTotalTests,
    realNormalResults,
    realAbnormalResults,
    labResults: labResults?.length,
    isLoading,
    usingRealData: realTotalTests > 0
  });
  // Health Score Progress Color
  const getHealthScoreColor = (score: number): Color => {
    if (score >= 90) return 'emerald';
    if (score >= 75) return 'blue';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  // Generate lab trends from real data
  const labTrends = React.useMemo(() => {
    if (!labResults || labResults.length === 0) return [];
    
    // Group results by date and extract key metrics
    const trendMap = new Map();
    labResults.forEach(result => {
      // Safety checks for required properties
      if (!result.test_date || !result.test_name) return;
      
      const date = new Date(result.test_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!trendMap.has(date)) {
        trendMap.set(date, { date });
      }
      
      const entry = trendMap.get(date);
      const testName = result.test_name.toLowerCase();
      
      if (testName.includes('hemoglobin')) {
        entry.Hemoglobin = Number(result.value);
      } else if (testName.includes('glucose')) {
        entry.Glucose = Number(result.value);
      } else if (testName.includes('cholesterol')) {
        entry.Cholesterol = Number(result.value);
      }
    });
    
    return Array.from(trendMap.values()).slice(0, 6);
  }, [labResults]);

  // Generate test categories from real data
  const testCategories = React.useMemo(() => {
    if (!labResults || labResults.length === 0) return [];
    
    const categoryMap = new Map();
    labResults.forEach(result => {
      const category = result.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    
    const colors = ['blue', 'emerald', 'violet', 'amber', 'rose'];
    return Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [labResults]);

  // Generate health tracker from recent results
  const healthTracker = React.useMemo(() => {
    if (!labResults || labResults.length === 0) {
      return [{ color: 'gray', tooltip: 'No data' }];
    }
    
    // Take last 6 results and create tracker based on status
    return labResults.slice(-6).map(result => ({
      color: result.status === 'normal' ? 'emerald' : result.status === 'high' ? 'red' : 'yellow',
      tooltip: result.status === 'normal' ? 'Good' : result.status === 'high' ? 'High' : 'Low'
    }));
  }, [labResults]);

  // Generate monthly test volume from real data
  const monthlyVolumeChart = React.useMemo(() => {
    if (!labResults || labResults.length === 0) {
      return (
        <div className="mt-6 h-72 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Volume Data</h3>
            <p className="text-gray-600">Upload lab reports to see monthly test volume</p>
          </div>
        </div>
      );
    }

    // Generate monthly test volume from real data
    const monthlyData = new Map();
    labResults.forEach(result => {
      const month = new Date(result.test_date).toLocaleDateString('en-US', { month: 'short' });
      monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
    });

    const chartData = Array.from(monthlyData.entries()).map(([month, Tests]) => ({
      month,
      Tests
    }));

    return (
      <BarChart
        className="mt-6 h-72"
        data={chartData}
        index="month"
        categories={['Tests']}
        colors={['blue']}
        valueFormatter={(value: number) => `${value} tests`}
        showLegend={false}
      />
    );
  }, [labResults]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Health Score Card */}
      <Card className="p-8 shadow-lg">
        <Flex justifyContent="between" alignItems="center" className="mb-4">
          <div>
            <Title>Overall Health Score</Title>
            <Text>Based on {totalTests} lab results</Text>
          </div>
          <Activity className="h-8 w-8 text-blue-500" />
        </Flex>
        
        <Flex justifyContent="start" alignItems="center" className="space-x-6">
          <div>
            <Metric>{healthScore}</Metric>
            <Text>Current Score</Text>
          </div>
          <div className="flex-1">
            <ProgressBar 
              value={healthScore} 
              color={getHealthScoreColor(healthScore)}
              className="mt-2"
            />
          </div>
        </Flex>
        
        <div className="mt-4">
          <Text>Health Status Trend (Last 6 months)</Text>
          <Tracker data={healthTracker} className="mt-2" />
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-8">
        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <Flex alignItems="center" className="space-x-2">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            <Text className="text-lg">Normal Results</Text>
          </Flex>
          <Metric className="mt-3 text-3xl">{normalResults}</Metric>
          <Badge color="emerald" size="lg" className="mt-3">
            {((normalResults / totalTests) * 100).toFixed(1)}%
          </Badge>
        </Card>

        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <Flex alignItems="center" className="space-x-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <Text className="text-lg">Abnormal Results</Text>
          </Flex>
          <Metric className="mt-3 text-3xl">{abnormalResults}</Metric>
          <Badge color="amber" size="lg" className="mt-3">
            {((abnormalResults / totalTests) * 100).toFixed(1)}%
          </Badge>
        </Card>

        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <Flex alignItems="center" className="space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            <Text className="text-lg">Total Tests</Text>
          </Flex>
          <Metric className="mt-3 text-3xl">{totalTests}</Metric>
          <Badge color="blue" size="lg" className="mt-3">
            All Time
          </Badge>
        </Card>

        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <Flex alignItems="center" className="space-x-2">
            <Activity className="h-6 w-6 text-violet-500" />
            <Text className="text-lg">Categories</Text>
          </Flex>
          <Metric className="mt-3 text-3xl">{testCategories.length}</Metric>
          <Badge color="violet" size="lg" className="mt-3">
            Active
          </Badge>
        </Card>
      </Grid>

      {/* Charts Grid */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        {/* Lab Trends Chart */}
        <Card>
          <Title>Key Lab Values Trend</Title>
          <Text>Track your important health metrics over time</Text>
          {labTrends.length > 0 ? (
            <AreaChart
              className="mt-6 h-72"
              data={labTrends}
              index="date"
              categories={['Hemoglobin', 'Glucose', 'Cholesterol']}
              colors={['emerald', 'blue', 'amber']}
              valueFormatter={(value: number) => `${value}`}
              showLegend={true}
              showGridLines={true}
            />
          ) : (
            <div className="mt-6 h-72 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Trend Data</h3>
                <p className="text-gray-600">Upload lab reports to see trends over time</p>
              </div>
            </div>
          )}
        </Card>

        {/* Test Categories Distribution */}
        <Card>
          <Title>Test Categories</Title>
          <Text>Distribution of your lab tests by category</Text>
          {testCategories.length > 0 ? (
            <DonutChart
              className="mt-6 h-72"
              data={testCategories}
              category="value"
              index="name"
              colors={['blue', 'emerald', 'violet', 'amber', 'rose']}
              valueFormatter={(value: number) => `${value} tests`}
              showLabel={true}
            />
          ) : (
            <div className="mt-6 h-72 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories</h3>
                <p className="text-gray-600">Upload lab reports to see test categories</p>
              </div>
            </div>
          )}
        </Card>
      </Grid>

      {/* Monthly Test Volume */}
      <Card>
        <Title>Monthly Test Volume</Title>
        <Text>Number of lab tests completed each month</Text>
        {monthlyVolumeChart}
      </Card>
    </div>
  );
};