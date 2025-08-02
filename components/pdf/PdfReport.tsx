import React from 'react';
import type { CreditReport, RiskScore, Loan, Payment, CreditStatus as CreditStatusEnum } from '../../types';
import { PaymentStatus, CreditStatus } from '../../types';

// --- Helper Functions ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
};

const formatLongDate = (dateString: string) => {
     try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    } catch(e) {
        return dateString;
    }
};


// --- Helper Components ---
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <div className="border-b-2 border-[#00aeef] pb-1 mb-4">
        <h2 className="text-lg font-bold uppercase text-[#00aeef]">{title}</h2>
    </div>
);

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <span className="text-gray-600">{label}:</span>
        <span className="font-semibold ml-2 text-gray-800">{value}</span>
    </div>
);

const PaymentSquare: React.FC<{ payment: Payment }> = ({ payment }) => {
    let bgColorClass = 'bg-[#d9534f]'; // Red for EnMora/Pendiente
    if (payment.status === PaymentStatus.Pagado) {
        bgColorClass = 'bg-[#5cb85c]'; // Green
    }
    return <div className={`h-4 w-4 ${bgColorClass}`}></div>;
};

const LoanBlock: React.FC<{ loan: Loan }> = ({ loan }) => (
    <div className="pt-4">
        <div className="flex justify-between items-start border-b border-gray-300 pb-2">
            <h3 className="font-bold text-lg text-gray-800">Préstamo #{loan.id}</h3>
            {loan.status && (
                 <span className="font-bold text-[#e63946] text-sm uppercase">{loan.status}</span>
            )}
        </div>
        <div className="grid grid-cols-3 gap-4 pt-3 text-sm">
            <div>
                <p className="text-gray-600">Monto Original:</p>
                <p className="font-semibold text-gray-800">{formatCurrency(loan.originalAmount)}</p>
            </div>
             <div>
                <p className="text-gray-600">Saldo Actual:</p>
                <p className="font-semibold text-gray-800">{formatCurrency(loan.currentBalance)}</p>
            </div>
             <div>
                <p className="text-gray-600">Fecha Originación:</p>
                <p className="font-semibold text-gray-800">{formatDate(loan.originationDate)}</p>
            </div>
        </div>
        <div className="pt-3">
             <p className="text-gray-600 text-sm mb-1">Comportamiento de Pago:</p>
             <div className="flex flex-wrap gap-1">
                {loan.payments.map(p => <PaymentSquare key={p.id} payment={p} />)}
             </div>
        </div>
    </div>
);

// --- Main PDF Report Component ---
export const PdfReport: React.FC<{ report: CreditReport; score: RiskScore }> = ({ report, score }) => {
    
    const HIGH_RISK_FLAGS = ['Fraude', 'Robo de identidad'];
    const relevantFlags = (report.client.flags || []).filter(flag => HIGH_RISK_FLAGS.includes(flag));
    
    const closedStatus: CreditStatusEnum[] = [CreditStatus.Pagado, CreditStatus.Cancelado];
    
    const activeLoans = report.loans.filter(loan => !closedStatus.includes(loan.status));
    const closedLoans = report.loans.filter(loan => closedStatus.includes(loan.status));

    return (
        <div className="bg-white text-gray-800 font-sans p-10 w-[794px] min-h-[1123px] flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-center text-sm border-b border-gray-300 pb-2">
                <h1 className="font-semibold text-gray-700">Reporte de Crédito Confidencial</h1>
                <p className="text-gray-500">Generado: {formatLongDate(new Date().toISOString())}</p>
            </header>

            <main className="flex-grow pt-6 space-y-6">
                {/* Datos Personales */}
                <section>
                    <SectionHeader title="Datos Personales" />
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <InfoRow label="Nombre Completo" value={report.client.fullName} />
                        <InfoRow label="Identificación" value={report.client.nationalIdentifier} />
                        <InfoRow label="Fecha Nacimiento" value={formatDate(report.client.birthDate)} />
                        <InfoRow label="Teléfono" value={report.client.phones[0]?.value || 'N/A'} />
                        <InfoRow label="Email" value={report.client.emails[0]?.value || 'N/A'} />
                        <InfoRow label="Dirección" value={report.client.addresses[0]?.value || 'N/A'} />
                    </div>
                </section>
                
                {/* Alerta de Alto Riesgo */}
                {relevantFlags.length > 0 && (
                     <section className="bg-[#e63946] text-white p-4 my-4">
                        <h3 className="font-bold text-lg uppercase">Alerta de Alto Riesgo</h3>
                        <p className="text-sm">Indicadores Detectados: {relevantFlags.join(', ')}</p>
                    </section>
                )}

                {/* Resumen de Endeudamiento */}
                <section>
                    <SectionHeader title="Resumen de Endeudamiento" />
                     <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <InfoRow label="Créditos Totales" value={report.debtSummary.totalCredits} />
                        <InfoRow label="Créditos Activos" value={report.debtSummary.activeCredits} />
                        <InfoRow label="Deuda Original Total" value={formatCurrency(report.debtSummary.totalOriginalAmount)} />
                        <InfoRow label="Créditos Pagados" value={report.debtSummary.paidCredits} />
                        <InfoRow label="Saldo Actual Total" value={formatCurrency(report.debtSummary.totalCurrentBalance)} />
                    </div>
                </section>

                {/* Puntaje de Riesgo */}
                 <section>
                    <SectionHeader title="Puntaje de Riesgo (IA)" />
                    <div className="flex items-center space-x-8">
                        <div className="text-8xl font-bold text-[#e63946]">
                            {score.score}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-2xl text-gray-800">{score.assessment}</p>
                            <p className="text-sm text-gray-600 italic mt-1">"{score.reasoning}"</p>
                        </div>
                    </div>
                </section>

                {/* Obligaciones Activas */}
                 <section>
                    <SectionHeader title="Obligaciones Activas, en Mora y Castigadas" />
                    {activeLoans.length > 0 ? (
                        activeLoans.map(loan => <LoanBlock key={loan.id} loan={loan} />)
                    ) : (
                        <p className="text-sm text-gray-500 italic">No hay obligaciones en esta categoría.</p>
                    )}
                </section>

                 {/* Obligaciones Cerradas */}
                 <section>
                    <SectionHeader title="Obligaciones Cerradas o Saldadas" />
                     {closedLoans.length > 0 ? (
                        closedLoans.map(loan => <LoanBlock key={loan.id} loan={loan} />)
                    ) : (
                        <p className="text-sm text-gray-500 italic">No hay obligaciones en esta categoría.</p>
                    )}
                </section>

            </main>
            
            {/* Footer */}
            <footer className="text-center text-xs text-gray-500 pt-8">
                Página 1 de 1
            </footer>
        </div>
    );
};
