import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendData } from '@/types/medical';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendChartProps {
  data: TrendData[];
  title: string;
  unit: string;
  referenceRange?: { min: number; max: number };
}

export const TrendChart = ({ data, title, unit, referenceRange }: TrendChartProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'hsl(var(--medical-success))';
      case 'high': return 'hsl(var(--medical-warning))';
      case 'low': return 'hsl(var(--medical-warning))';
      case 'critical': return 'hsl(var(--medical-danger))';
      default: return 'hsl(var(--primary))';
    }
  };

  const calculateTrend = () => {
    if (data.length < 2) return null;
    const recent = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    const diff = recent - previous;
    const percentChange = ((diff / previous) * 100).toFixed(1);
    
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      percentage: Math.abs(parseFloat(percentChange)),
      value: diff
    };
  };

  const trend = calculateTrend();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-semibold">{formatDate(label)}</p>
          <p className="text-primary">
            {`${data.value} ${unit}`}
          </p>
          <p className={`text-sm capitalize ${
            data.status === 'normal' ? 'text-medical-success' :
            data.status === 'critical' ? 'text-medical-danger' :
            'text-medical-warning'
          }`}>
            Status: {data.status}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-medical">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{title} Trend</span>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend.direction === 'up' && <TrendingUp className="h-4 w-4 text-medical-warning" />}
              {trend.direction === 'down' && <TrendingDown className="h-4 w-4 text-medical-info" />}
              {trend.direction === 'stable' && <Minus className="h-4 w-4 text-medical-neutral" />}
              <span className="text-muted-foreground">
                {trend.percentage}% vs last month
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: unit, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {referenceRange && (
                <>
              <ReferenceLine 
                y={referenceRange.min} 
                stroke="hsl(var(--medical-info))" 
                strokeDasharray="5 5"
                label={{ value: "Min Normal", position: "left" }}
              />
              <ReferenceLine 
                y={referenceRange.max} 
                stroke="hsl(var(--medical-info))" 
                strokeDasharray="5 5"
                label={{ value: "Max Normal", position: "left" }}
              />
                </>
              )}
              
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={(props) => {
                  const { payload } = props;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={getStatusColor(payload.status)}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};