'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BillingUsage } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface SpendChartProps {
  data: BillingUsage[];
  className?: string;
}

export function SpendChart({ data, className }: SpendChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      cost: item.cost / 100, // Convert cents to dollars
      projects: item.projects,
    }));
  }, [data]);

  const totalSpend = useMemo(() => {
    return data.reduce((sum, item) => sum + item.cost, 0) / 100;
  }, [data]);

  const avgDailySpend = useMemo(() => {
    return data.length > 0 ? totalSpend / data.length : 0;
  }, [data, totalSpend]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Spend Over Time</CardTitle>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div>
            Total: <span className="font-medium text-foreground">{formatCurrency(totalSpend * 100)}</span>
          </div>
          <div>
            Daily Avg: <span className="font-medium text-foreground">{formatCurrency(avgDailySpend * 100)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="text-sm font-medium">{label}</p>
                        <div className="space-y-1">
                          <p className="text-sm text-brand">
                            Cost: {formatCurrency(payload[0].value as number * 100)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Projects: {payload[0].payload.projects}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="hsl(var(--brand))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--brand))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--brand))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
