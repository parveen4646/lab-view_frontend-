import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LabResult } from '@/types/medical';
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface SummaryStatsProps {
  results: LabResult[];
}

export const SummaryStats = ({ results }: SummaryStatsProps) => {
  const getStatusCounts = () => {
    const counts = {
      normal: 0,
      high: 0,
      low: 0,
      critical: 0
    };
    
    results.forEach(result => {
      counts[result.status]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();
  const totalTests = results.length;
  const normalPercentage = totalTests > 0 ? Math.round((statusCounts.normal / totalTests) * 100) : 0;
  const abnormalCount = statusCounts.high + statusCounts.low + statusCounts.critical;

  const stats = [
    {
      title: 'Total Tests',
      value: totalTests,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Normal Results',
      value: statusCounts.normal,
      icon: CheckCircle,
      color: 'text-medical-success',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Abnormal Results',
      value: abnormalCount,
      icon: AlertTriangle,
      color: 'text-medical-warning',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Normal Rate',
      value: `${normalPercentage}%`,
      icon: TrendingUp,
      color: 'text-medical-info',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-medical">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};