import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestCategory, LabResult } from '@/types/medical';
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface CategoryOverviewProps {
  category: TestCategory;
  results: LabResult[];
}

export const CategoryOverview = ({ category, results }: CategoryOverviewProps) => {
  const categoryResults = results.filter(result => result.category === category.id);
  
  const getStatusCounts = () => {
    const counts = {
      normal: 0,
      high: 0,
      low: 0,
      critical: 0
    };
    
    categoryResults.forEach(result => {
      counts[result.status]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();
  const totalTests = categoryResults.length;
  const normalPercentage = totalTests > 0 ? Math.round((statusCounts.normal / totalTests) * 100) : 0;

  const getOverallStatus = () => {
    if (statusCounts.critical > 0) return 'critical';
    if (statusCounts.high > 0 || statusCounts.low > 0) return 'attention';
    return 'normal';
  };

  const overallStatus = getOverallStatus();

  const getStatusIcon = () => {
    switch (overallStatus) {
      case 'normal': return <CheckCircle className="h-5 w-5 text-medical-success" />;
      case 'attention': return <AlertTriangle className="h-5 w-5 text-medical-warning" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-medical-danger" />;
      default: return <Activity className="h-5 w-5 text-medical-neutral" />;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (overallStatus) {
      case 'normal': return 'default';
      case 'attention': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="shadow-medical hover:shadow-chart transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: category.color }}
            />
            <span className="text-base">{category.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={getStatusBadgeVariant() as any} className="capitalize">
              {overallStatus === 'attention' ? 'Needs Attention' : overallStatus}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{category.description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-medical-success">{normalPercentage}%</div>
            <div className="text-xs text-muted-foreground">Normal Results</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalTests}</div>
            <div className="text-xs text-muted-foreground">Total Tests</div>
          </div>
        </div>

        {totalTests > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-medical-success">Normal: {statusCounts.normal}</span>
              {(statusCounts.high > 0 || statusCounts.low > 0) && (
                <span className="text-medical-warning">
                  Abnormal: {statusCounts.high + statusCounts.low}
                </span>
              )}
              {statusCounts.critical > 0 && (
                <span className="text-medical-danger">Critical: {statusCounts.critical}</span>
              )}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-medical-success h-2 rounded-full transition-all duration-300"
                style={{ width: `${normalPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};