
import React from 'react';
import type { Payment } from '../types';
import { PaymentStatus } from '../types';

interface PaymentHistoryVectorProps {
  payments: Payment[];
}

const PaymentBlock: React.FC<{ payment: Payment }> = ({ payment }) => {
    let bgColorClass = 'bg-gray-600'; // Pendiente
    let title = `Cuota ${payment.installmentNumber}: Pendiente`;

    switch(payment.status) {
        case PaymentStatus.Pagado:
            bgColorClass = payment.daysLate > 0 ? 'bg-yellow-500' : 'bg-green-500';
            title = `Cuota ${payment.installmentNumber}: Pagada ${payment.daysLate > 0 ? `(${payment.daysLate} días de mora)` : 'a tiempo'}`;
            break;
        case PaymentStatus.EnMora:
            bgColorClass = 'bg-red-600';
            title = `Cuota ${payment.installmentNumber}: En Mora (${payment.daysLate} días)`;
            break;
    }

    return (
        <div 
            className={`h-6 w-4 rounded-sm ${bgColorClass} transition-transform duration-200 hover:scale-125`}
            title={title}
        ></div>
    );
}

export const PaymentHistoryVector: React.FC<PaymentHistoryVectorProps> = ({ payments }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {payments.map(payment => (
        <PaymentBlock key={payment.id} payment={payment} />
      ))}
    </div>
  );
};