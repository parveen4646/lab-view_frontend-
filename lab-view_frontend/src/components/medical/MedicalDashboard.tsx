import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientCard } from './PatientCard';
import { SummaryStats } from './SummaryStats';
import { CategoryOverview } from './CategoryOverview';
import { TestResultCard } from './TestResultCard';
import { TrendChart } from './TrendChart';
import { patientInfo, latestResults, testCategories, trendData } from '@/data/mockLabData';
import { Stethoscope, BarChart3, TrendingUp, FileText } from 'lucide-react';

export const MedicalDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredResults = selectedCategory 
    ? latestResults.filter(result => result.category === selectedCategory)
    : latestResults;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medical Lab Results</h1>
            <p className="text-muted-foreground">Comprehensive health monitoring dashboard</p>
          </div>
        </div>

        {/* Patient Information */}
        <PatientCard patient={patientInfo} />

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Latest Results
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Categories
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <SummaryStats results={latestResults} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Test Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testCategories.map(category => (
                    <CategoryOverview 
                      key={category.id} 
                      category={category} 
                      results={latestResults}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Recent Trends</h3>
                <TrendChart 
                  data={trendData.cholesterol} 
                  title="Total Cholesterol" 
                  unit="mg/dL"
                  referenceRange={{ min: 100, max: 200 }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Latest Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Latest Test Results</h3>
              <div className="text-sm text-muted-foreground">
                Test Date: {new Date(patientInfo.lastTestDate).toLocaleDateString()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredResults.map(result => (
                <TestResultCard key={result.id} result={result} />
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <h3 className="text-xl font-semibold">Test Trends Over Time</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart 
                data={trendData.cholesterol} 
                title="Total Cholesterol" 
                unit="mg/dL"
                referenceRange={{ min: 100, max: 200 }}
              />
              <TrendChart 
                data={trendData.hemoglobin} 
                title="Hemoglobin" 
                unit="g/dL"
                referenceRange={{ min: 12, max: 15.5 }}
              />
              <TrendChart 
                data={trendData.glucose} 
                title="Glucose" 
                unit="mg/dL"
                referenceRange={{ min: 70, max: 100 }}
              />
              <TrendChart 
                data={trendData.creatinine} 
                title="Creatinine" 
                unit="mg/dL"
                referenceRange={{ min: 0.6, max: 1.1 }}
              />
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <h3 className="text-xl font-semibold">Test Categories</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testCategories.map(category => (
                <div key={category.id} className="space-y-4">
                  <CategoryOverview 
                    category={category} 
                    results={latestResults}
                  />
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      {category.name} Results
                    </h4>
                    <div className="grid gap-3">
                      {latestResults
                        .filter(result => result.category === category.id)
                        .map(result => (
                          <TestResultCard key={result.id} result={result} />
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};