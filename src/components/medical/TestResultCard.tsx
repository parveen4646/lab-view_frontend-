import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LabResult } from '@/types/medical';
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface TestResultCardProps {
  result: LabResult;
}

export const TestResultCard = ({ result }: TestResultCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-medical-success';
      case 'high': return 'text-medical-warning';
      case 'low': return 'text-medical-warning';
      case 'critical': return 'text-medical-danger';
      default: return 'text-medical-neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <AlertCircle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'normal': return 'default';
      case 'high': return 'destructive';
      case 'low': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  // Calculate progress percentage within reference range
  const calculateProgress = () => {
    const { min, max } = result.referenceRange;
    const range = max - min;
    const valuePosition = result.value - min;
    return Math.max(0, Math.min(100, (valuePosition / range) * 100));
  };

  const isWithinRange = result.value >= result.referenceRange.min && result.value <= result.referenceRange.max;

  return (
    <Card className="shadow-medical hover:shadow-chart transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base font-medium">{result.testName}</span>
          <div className={`flex items-center gap-1 ${getStatusColor(result.status)}`}>
            {getStatusIcon(result.status)}
            <Badge variant={getStatusVariant(result.status) as any} className="capitalize">
              {result.status}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {result.value} <span className="text-sm font-normal text-muted-foreground">{result.unit}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{result.referenceRange.min}</span>
            <span>Reference Range</span>
            <span>{result.referenceRange.max}</span>
          </div>
          <Progress 
            value={calculateProgress()} 
            className="h-2"
          />
          <div className="text-xs text-center text-muted-foreground">
            Normal: {result.referenceRange.min} - {result.referenceRange.max} {result.unit}
          </div>
        </div>

        {!isWithinRange && (
          <div className={`text-xs p-2 rounded-md ${
            result.status === 'critical' ? 'bg-red-50 text-red-700' : 
            result.status === 'high' ? 'bg-yellow-50 text-yellow-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {result.value > result.referenceRange.max ? 'Above' : 'Below'} normal range
          </div>
        )}
      </CardContent>
    </Card>
  );
};