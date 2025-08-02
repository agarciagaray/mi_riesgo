
import React from 'react';
import type { Loan } from '../types';
import { CreditStatus, PaymentModality, PaymentStatus } from '../types';
import { PaymentHistoryVector } from './PaymentHistoryVector';
import { PencilIcon } from './Icons';

interface LoanDetailsProps {
  loans: Loan[];
  onEditLoan: (loan: Loan) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
};

const getStatusChipClass = (status: CreditStatus | string) => {
    switch (status) {
        case CreditStatus.Vigente:
            return 'bg-blue-500/20 text-blue-300';
        case 'Pagado (Reporte Activo)':
        case CreditStatus.EnMora:
            return 'bg-yellow-500/20 text-yellow-300';
        case CreditStatus.Pagado:
            return 'bg-green-500/20 text-green-300';
        case CreditStatus.Castigado:
        case CreditStatus.Fraudulento:
        case CreditStatus.Siniestrado:
            return 'bg-red-500/20 text-red-300 font-bold';
        case CreditStatus.EnJuridica:
        case CreditStatus.Embargo:
            return 'bg-purple-500/20 text-purple-300';
        default:
            return 'bg-gray-500/20 text-gray-300';
    }
}

const calculateInstallmentAmount = (loan: Loan): number => {
    const { originalAmount, interestRate, installments, modality } = loan;
    if (installments === 0) return 0;
    if (interestRate === 0) return originalAmount / installments;
    const periodsPerYear = { [PaymentModality.Diario]: 365, [PaymentModality.Semanal]: 52, [PaymentModality.Quincenal]: 24, [PaymentModality.Mensual]: 12, [PaymentModality.Anual]: 1 }[modality] || 12;
    const periodicRate = (interestRate / 100) / periodsPerYear;
    if (periodicRate === 0) return originalAmount / installments;
    const numerator = periodicRate * Math.pow(1 + periodicRate, installments);
    const denominator = Math.pow(1 + periodicRate, installments) - 1;
    if (denominator === 0) return originalAmount / installments;
    return originalAmount * (numerator / denominator);
};

const calculateTotalOverdue = (loan: Loan, installmentAmount: number): number => {
    const overduePaymentsCount = loan.payments.filter(p => p.status === PaymentStatus.EnMora).length;
    return overduePaymentsCount * installmentAmount;
};

export const LoanDetails: React.FC<LoanDetailsProps> = ({ loans, onEditLoan }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4 mt-8 border-b-2 border-gray-700 pb-2">
        Detalle de Créditos Anónimos
      </h3>
      <div className="space-y-6">
        {loans.map((loan) => {
          const installmentAmount = calculateInstallmentAmount(loan);
          const totalOverdue = calculateTotalOverdue(loan, installmentAmount);
          const paidInstallments = loan.payments.filter(p => p.status === PaymentStatus.Pagado).length;
          const overdueInstallments = loan.payments.filter(p => p.status === PaymentStatus.EnMora).length;

          const isPaid = loan.status === CreditStatus.Pagado;
          let displayStatus: CreditStatus | string = loan.status;
          let paidInfo: {
              lastPaymentDate: Date | null;
              reportExpiryDate: Date | null;
          } | null = null;
          
          if (isPaid) {
              const paidPayments = loan.payments.filter(p => p.status === PaymentStatus.Pagado && p.actualPaymentDate);
              const lastPayment = paidPayments.length > 0 ? paidPayments.reduce((latest, current) => {
                  return new Date(latest.actualPaymentDate!) > new Date(current.actualPaymentDate!) ? latest : current;
              }) : null;
              
              const lastPaymentDate = lastPayment ? new Date(lastPayment.actualPaymentDate!) : null;

              const maxDaysLate = Math.max(0, ...loan.payments.map(p => p.daysLate));
              const doubleTimeInDays = maxDaysLate * 2;
              const maxReportTimeInDays = 4 * 365;
              const reportingDays = Math.min(doubleTimeInDays, maxReportTimeInDays);

              let reportExpiryDate: Date | null = null;
              if (lastPaymentDate && reportingDays > 0) {
                  reportExpiryDate = new Date(lastPaymentDate);
                  reportExpiryDate.setDate(reportExpiryDate.getDate() + reportingDays);
              }

              const isReportActive = reportExpiryDate && new Date() < reportExpiryDate;

              if (isReportActive) {
                  displayStatus = 'Pagado (Reporte Activo)';
              }

              paidInfo = { lastPaymentDate, reportExpiryDate };
          }

          return (
            <div key={loan.id} className="bg-gray-800 p-4 sm:p-6 rounded-lg">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Préstamo #{loan.id}</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(loan.originalAmount)}</p>
                  <p className="text-sm text-red-400">{formatCurrency(loan.currentBalance)} saldo</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${getStatusChipClass(displayStatus)}`}>
                        {displayStatus}
                    </span>
                    <button
                        onClick={() => onEditLoan(loan)}
                        className="flex items-center gap-1.5 text-xs px-2 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-md text-gray-300 hover:text-white transition-colors"
                        aria-label={`Editar préstamo ${loan.id}`}
                    >
                        <PencilIcon className="h-4 w-4" />
                        <span>Editar</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Originado: {new Date(loan.originationDate).toLocaleDateString()}</p>
                  {isPaid && paidInfo?.lastPaymentDate && (
                      <p className="text-xs text-gray-400 mt-1">Pagado el: {paidInfo.lastPaymentDate.toLocaleDateString()}</p>
                  )}
                  {displayStatus === 'Pagado (Reporte Activo)' && paidInfo?.reportExpiryDate && (
                      <p className="text-xs text-yellow-400 mt-1">Reporte caduca: {paidInfo.reportExpiryDate.toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-700/50 p-4 rounded-md space-y-3 mb-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div>
                        <p className="text-xs sm:text-sm text-gray-400">Cuotas Pactadas</p>
                        <p className="font-semibold text-gray-200 text-lg">{loan.installments}</p>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-gray-400">Cuotas Pagadas</p>
                        <p className="font-semibold text-green-400 text-lg">{paidInstallments}</p>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-gray-400">Cuotas Atrasadas</p>
                        <p className="font-semibold text-red-400 text-lg">{overdueInstallments}</p>
                    </div>
                </div>

                <div className="border-t border-gray-600/50"></div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center pt-2">
                    <div>
                        <p className="text-xs sm:text-sm text-gray-400">Valor Cuota (Aprox)</p>
                        <p className="font-semibold text-gray-200 text-lg">{formatCurrency(installmentAmount)}</p>
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-gray-400">Total en Mora</p>
                        <p className="font-semibold text-yellow-400 text-lg">{formatCurrency(totalOverdue)}</p>
                    </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-2">Comportamiento de Pago ({loan.modality})</p>
                <PaymentHistoryVector payments={loan.payments} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
