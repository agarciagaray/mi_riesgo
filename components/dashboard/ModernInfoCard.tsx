import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ModernInfoCardProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  onAction?: () => void;
  actionLabel?: string;
}

export const ModernInfoCard: React.FC<ModernInfoCardProps> = ({
  icon: Icon,
  title,
  value,
  description,
  trend,
  badge,
  onAction,
  actionLabel = 'Ver más'
}) => {
  return (
    <Card className=\"hover:shadow-lg transition-all duration-200 hover:scale-[1.02]\">
      <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
        <CardTitle className=\"text-sm font-medium text-muted-foreground\">
          {title}
        </CardTitle>
        <div className=\"p-2 rounded-full bg-primary/10\">
          <Icon className=\"h-4 w-4 text-primary\" />
        </div>
      </CardHeader>
      <CardContent>
        <div className=\"space-y-3\">
          <div className=\"flex items-center justify-between\">
            <div className=\"text-2xl font-bold text-foreground\">{value}</div>
            {badge && (
              <Badge variant={badge.variant || 'default'}>
                {badge.text}
              </Badge>
            )}
          </div>
          
          {trend && (
            <div className=\"flex items-center space-x-1 text-xs\">
              <span className={cn(
                \"font-medium\",
                trend.isPositive ? \"text-green-600 dark:text-green-400\" : \"text-red-600 dark:text-red-400\"
              )}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className=\"text-muted-foreground\">desde el mes pasado</span>
            </div>
          )}
          
          {description && (
            <CardDescription className=\"text-xs\">
              {description}
            </CardDescription>
          )}
          
          {onAction && (
            <Button
              variant=\"outline\"
              size=\"sm\"
              onClick={onAction}
              className=\"w-full mt-2\"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};", "original_text": "", "replace_all": false}]