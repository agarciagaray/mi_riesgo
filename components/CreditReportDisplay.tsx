
import React from 'react';

interface CreditReportDisplayProps {
  children: React.ReactNode;
}

export const CreditReportDisplay: React.FC<CreditReportDisplayProps> = ({ children }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 space-y-6">
       <h2 className="text-2xl font-bold text-white border-b-2 border-gray-700 pb-2 mb-6">
          Reporte de Crédito Confidencial
        </h2>
      {children}
    </div>
  );
};