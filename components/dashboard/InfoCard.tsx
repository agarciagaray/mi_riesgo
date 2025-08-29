import React from 'react';

interface InfoCardProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string;
  color: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, value, color }) => {
  return (
    <div className="bg-gray-800 p-3 rounded-xl shadow-lg flex items-center space-x-3">
      <div className={`p-2 rounded-full bg-gray-700/50 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{title}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
};