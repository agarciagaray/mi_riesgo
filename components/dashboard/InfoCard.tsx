import React from 'react';

interface InfoCardProps {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    title: string;
    value: string;
    color: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, value, color }) => {
    return (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-gray-700/50 ${color}`}>
                <Icon className="h-7 w-7" />
            </div>
            <div>
                <p className="text-sm text-gray-400 font-medium">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};
