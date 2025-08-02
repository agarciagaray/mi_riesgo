
import React from 'react';
import type { DebtSummary } from '../types';
import { ChartPieIcon, BanknotesIcon, CreditCardIcon } from './Icons';

interface DebtSummaryCardProps {
  summary: DebtSummary;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
};

export const DebtSummaryCard: React.FC<DebtSummaryCardProps> = ({ summary }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg h-full">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center"><ChartPieIcon className="h-6 w-6 mr-2 text-cyan-400"/>Resumen de Deuda</h3>
      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-md">
            <span className="font-medium text-gray-300">Créditos Totales</span>
            <span className="font-bold text-white text-lg">{summary.totalCredits}</span>
        </div>
         <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-gray-700/30 p-2 rounded-md">
                <p className="text-xs text-gray-400">Activos</p>
                <p className="font-semibold text-lg text-yellow-400">{summary.activeCredits}</p>
            </div>
             <div className="bg-gray-700/30 p-2 rounded-md">
                <p className="text-xs text-gray-400">Pagados</p>
                <p className="font-semibold text-lg text-green-400">{summary.paidCredits}</p>
            </div>
        </div>
        <div className="space-y-2 pt-2">
            <div className="flex items-center">
              <BanknotesIcon className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Monto Original Total</p>
                <p className="font-semibold text-gray-200">{formatCurrency(summary.totalOriginalAmount)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Saldo Actual Total</p>
                <p className="font-semibold text-red-400">{formatCurrency(summary.totalCurrentBalance)}</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};