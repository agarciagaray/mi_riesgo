import React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';

interface InfoCardProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string;
  color?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, value, color = "text-primary" }) => {
  return (
    <Card className="transition-colors">
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <div className={cn("p-2 rounded-full bg-muted/50", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-lg font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};