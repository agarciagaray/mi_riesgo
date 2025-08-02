import React from 'react';

const StatusLegend: React.FC<{ color: string; label: string; value: string }> = ({ color, label, value }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
            <span className={`h-3 w-3 rounded-full mr-2 ${color}`}></span>
            <span className="text-gray-400">{label}</span>
        </div>
        <span className="font-semibold text-white">{value}</span>
    </div>
);

export const ReportingEntityStatus: React.FC = () => {
    // Data is for visual representation, not tied to real metrics yet.
    const data = {
        active: { value: 68, color: 'bg-green-500', hex: '#22c55e' },
        errors: { value: 20, color: 'bg-yellow-500', hex: '#eab308' },
        inactive: { value: 12, color: 'bg-gray-500', hex: '#6b7280' },
    };
    
    // Create a conic-gradient string for the pie chart using valid CSS color values.
    const gradientString = `conic-gradient(
        ${data.active.hex} 0% ${data.active.value}%, 
        ${data.errors.hex} ${data.active.value}% ${data.active.value + data.errors.value}%,
        ${data.inactive.hex} ${data.active.value + data.errors.value}% 100%
    )`;

    return (
        <div className="h-full flex flex-col">
            {/* The pie chart container will grow to fill available vertical space, pushing the legend to the bottom. */}
            <div className="flex-grow flex justify-center items-center py-4">
                <div 
                    className="relative w-40 h-40 rounded-full"
                    style={{ background: gradientString }}
                >
                   <div className="absolute inset-2 bg-gray-800 rounded-full flex justify-center items-center">
                        <span className="text-3xl font-bold text-white">15</span>
                   </div>
                </div>
            </div>
            {/* The legend will not shrink and stays at the bottom. */}
            <div className="flex-shrink-0 space-y-3 w-full">
                <StatusLegend color={data.active.color} label="Activas" value="10" />
                <StatusLegend color={data.errors.color} label="Con Errores" value="3" />
                <StatusLegend color={data.inactive.color} label="Inactivas" value="2" />
            </div>
        </div>
    );
};