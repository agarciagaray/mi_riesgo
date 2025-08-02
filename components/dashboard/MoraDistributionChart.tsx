import React from 'react';

interface MoraDistributionChartProps {
  data: { [key: string]: number };
}

const Bar: React.FC<{ label: string; value: number; maxValue: number; color: string }> = ({ label, value, maxValue, color }) => {
  const widthPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="flex items-center space-x-4 text-sm group">
      <div className="w-16 text-right text-gray-400">{label}</div>
      <div className="flex-1 bg-gray-700/50 rounded-full h-6 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} flex items-center justify-end px-2 transition-all duration-700 ease-out`}
          style={{ width: `${widthPercentage}%` }}
        >
        </div>
      </div>
      <div className="w-10 font-semibold text-white">{value}</div>
    </div>
  );
};


export const MoraDistributionChart: React.FC<MoraDistributionChartProps> = ({ data }) => {
    const chartData = [
        { label: '1-30 días', key: '1-30', color: 'bg-yellow-500' },
        { label: '31-60 días', key: '31-60', color: 'bg-orange-500' },
        { label: '61-90 días', key: '61-90', color: 'bg-red-500' },
        { label: '91+ días', key: '91+', color: 'bg-red-700' },
    ];
    
    const values = Object.values(data);
    const maxValue = Math.max(...values, 1); // Avoid division by zero, ensure at least 1

    return (
        <div className="space-y-4 pt-4">
            {chartData.map(item => (
                <Bar 
                    key={item.key}
                    label={item.label}
                    value={data[item.key] || 0}
                    maxValue={maxValue}
                    color={item.color}
                />
            ))}
        </div>
    );
};
