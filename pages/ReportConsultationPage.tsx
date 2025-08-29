import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ClientInfoCard } from '../components/ClientInfoCard';
import { CreditReportDisplay } from '../components/CreditReportDisplay';
import { DebtSummaryCard } from '../components/DebtSummaryCard';
import { ClientUpdateData, EditClientForm } from '../components/EditClientForm';
import { EditLoanForm } from '../components/EditLoanForm';
import { HistoryViewerModal } from '../components/HistoryViewerModal';
import { ArrowLeftIcon, DownloadIcon, ShieldExclamationIcon, SpinnerIcon } from '../components/Icons';
import { LoanDetails } from '../components/LoanDetails';
import { Modal } from '../components/Modal';
import { PdfReport } from '../components/pdf/PdfReport';
import { RiskScoreCard } from '../components/RiskScoreCard';
import { SearchClient } from '../components/SearchClient';

import { creditService } from '../services/creditService';
import { geminiService } from '../services/geminiService';
import type { Client, CreditReport, HistoricEntry, Loan, RiskScore } from '../types';

interface ReportConsultationPageProps {
  clientIdToShow?: number;
  onBack?: () => void;
}

// --- Componente de Alerta ---
const HIGH_RISK_FLAGS = ['Fraude', 'Robo de identidad'];

const HighRiskAlertBanner: React.FC<{ flags: string[] }> = ({ flags }) => {
  const relevantFlags = (flags || []).filter(flag => HIGH_RISK_FLAGS.includes(flag));

  if (relevantFlags.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-900/50 border-2 border-red-700 text-red-200 p-4 rounded-lg flex items-start space-x-4 mb-6" role="alert">
      <ShieldExclamationIcon className="h-10 w-10 text-red-400 flex-shrink-0 mt-1" />
      <div>
        <h3 className="font-bold text-lg text-white">ALERTA DE ALTO RIESGO</h3>
        <p className="text-sm mt-1">Este cliente presenta indicadores críticos que requieren atención inmediata. Verifique la identidad y la documentación antes de proceder.</p>
        <p className="text-sm mt-2 font-semibold">Indicadores detectados: <span className="font-bold">{relevantFlags.join(', ')}</span></p>
      </div>
    </div>
  );
};


// --- Componente Extraído ---
// Se mueve fuera para evitar que se re-defina en cada render, lo que causa la pérdida de foco.
interface TopSectionProps {
  clientIdToShow?: number;
  onBack?: () => void;
  identifier: string;
  setIdentifier: (id: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const TopSection: React.FC<TopSectionProps> = ({
  clientIdToShow,
  onBack,
  identifier,
  setIdentifier,
  onSearch,
  isLoading,
}) => {
  if (clientIdToShow && onBack) {
    return (
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Volver a la lista de clientes</span>
        </button>
      </div>
    );
  }
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <SearchClient
        identifier={identifier}
        setIdentifier={setIdentifier}
        onSearch={onSearch}
        isLoading={isLoading}
      />
    </div>
  );
};


export const ReportConsultationPage: React.FC<ReportConsultationPageProps> = ({ clientIdToShow, onBack }) => {
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/dashboard';
    }
  };
  const [identifier, setIdentifier] = useState<string>('');
  const [creditReport, setCreditReport] = useState<CreditReport | null>(null);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRiskScoreLoading, setIsRiskScoreLoading] = useState<boolean>(false);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [historyModal, setHistoryModal] = useState<{ title: string; data: HistoricEntry<string>[] } | null>(null);

  const pdfReportRef = useRef<HTMLDivElement>(null);

  const loadReportByIdentifier = useCallback(async (id: string) => {
    setIsLoading(true);
    setIsRiskScoreLoading(true);
    setCreditReport(null);
    setRiskScore(null);
    setError(null);

    try {
      const report = await creditService.fetchCreditHistory(id);
      setCreditReport(report);

      geminiService.calculateRiskScore(report)
        .then(score => setRiskScore(score))
        .catch(geminiError => {
          console.error("Error calculating risk score:", geminiError);
          setRiskScore({
            score: 0,
            assessment: 'Error',
            reasoning: 'No se pudo calcular el puntaje de riesgo.'
          });
        })
        .finally(() => setIsRiskScoreLoading(false));

    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setCreditReport(null);
      setRiskScore(null);
      setIsRiskScoreLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findClientIdentifierById = async (id: number): Promise<string | null> => {
    // This is a workaround for the fact that we can only search by identifier.
    // In a real app, you would have a GET /api/clients/:id endpoint.
    // For now, we fetch all clients and find the one we need.
    try {
      const clients = await creditService.fetchAllClients();
      const client = clients.find(c => c.id === id);
      return client ? client.nationalIdentifier : null;
    } catch (e) {
      console.error("Could not fetch clients to find identifier", e);
      return null;
    }
  }


  useEffect(() => {
    if (clientIdToShow) {
      const findAndLoadReport = async () => {
        setIsLoading(true);
        setError(null);
        setCreditReport(null);
        try {
          const clientIdentifier = await findClientIdentifierById(clientIdToShow);
          if (clientIdentifier) {
            setIdentifier(clientIdentifier);
            await loadReportByIdentifier(clientIdentifier);
          } else {
            setError(`No se encontró un reporte para el cliente con ID: ${clientIdToShow}`);
          }
        } catch (err) {
          setError('Error al cargar la información del cliente.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      findAndLoadReport();
    }
    // Si no hay clientIdToShow, no cargar ningún reporte por defecto
  }, [clientIdToShow, loadReportByIdentifier]);

  const handleSearch = useCallback(async () => {
    if (!identifier) {
      setError('Por favor, ingrese un Identificador Nacional.');
      return;
    }
    await loadReportByIdentifier(identifier);
  }, [identifier, loadReportByIdentifier]);

  const handleDownloadPdf = useCallback(async () => {
    if (!pdfReportRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(pdfReportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt', // points
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`reporte-credito-${identifier}.pdf`);

    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Error al generar el reporte PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [identifier]);

  const handleOpenEditClient = () => {
    if (creditReport) {
      setEditingClient(creditReport.client);
    }
  };

  const handleViewHistory = (title: string, data: HistoricEntry<string>[]) => {
    setHistoryModal({ title, data });
  };


  const handleOpenEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
  };

  const handleCloseModals = () => {
    setEditingClient(null);
    setEditingLoan(null);
    setHistoryModal(null);
  };

  const handleUpdateClient = async (updateData: ClientUpdateData) => {
    if (!creditReport || !editingClient) return;

    const originalReport = creditReport;

    // Optimistic UI update for better UX
    const newClientState: Client = {
      ...editingClient,
      fullName: updateData.fullName,
      flags: updateData.flags,
      // History update logic is now on the backend, but we can simulate it on the client for responsiveness
      addresses: [{ value: updateData.address, dateModified: new Date().toISOString() }, ...editingClient.addresses.filter(a => a.value !== updateData.address)],
      phones: [{ value: updateData.phone, dateModified: new Date().toISOString() }, ...editingClient.phones.filter(p => p.value !== updateData.phone)],
      emails: [{ value: updateData.email, dateModified: new Date().toISOString() }, ...editingClient.emails.filter(e => e.value !== updateData.email)],
    };

    setCreditReport({ ...creditReport, client: newClientState });
    handleCloseModals();

    try {
      // Send update to the server
      const savedClient = await creditService.updateClient(editingClient.id, updateData);
      // If server returns slightly different data (e.g., precise timestamps), update the state again.
      setCreditReport(prev => prev ? { ...prev, client: savedClient } : null);
    } catch (error) {
      console.error("Error updating client:", error);
      setError("No se pudo guardar la información del cliente. Revirtiendo cambios.");
      // Revert to original state on error
      setCreditReport(originalReport);
    }
  };

  const handleUpdateLoan = async (updatedLoanData: Loan) => {
    if (!creditReport) return;

    handleCloseModals();
    setIsLoading(true); // Use a general loader for the whole report

    try {
      await creditService.updateLoan(updatedLoanData.id, updatedLoanData);
      // After updating a loan, the entire report and score might change.
      // The safest approach is to reload everything from the source of truth (the backend).
      await loadReportByIdentifier(creditReport.client.nationalIdentifier);
    } catch (error) {
      console.error("Error updating loan:", error);
      setError("No se pudo actualizar el préstamo.");
      setIsLoading(false); // Stop loading on error
    }
  };

  return (
    <>
      {/* Botón de regreso */}
      <div className="mb-4">
        <button
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Volver {onBack ? 'a la opción anterior' : 'al Dashboard'}</span>
        </button>
      </div>

      {/* Container for PDF generation, hidden from view */}
      <div className="fixed -left-[2000px] top-0">
        <div ref={pdfReportRef}>
          {creditReport && riskScore && (
            <PdfReport report={creditReport} score={riskScore} />
          )}
        </div>
      </div>

      <TopSection
        clientIdToShow={clientIdToShow}
        onBack={onBack}
        identifier={identifier}
        setIdentifier={setIdentifier}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <SpinnerIcon className="h-12 w-12 text-cyan-400" />
        </div>
      )}

      {creditReport && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              Reporte de Crédito
            </h1>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || !riskScore}
              className="flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {isGeneratingPdf ? <SpinnerIcon className="h-5 w-5" /> : <DownloadIcon className="h-5 w-5" />}
              <span>{isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
          </div>

          <div className="p-8 bg-gray-900 rounded-lg">
            <HighRiskAlertBanner flags={creditReport.client.flags || []} />
            <CreditReportDisplay>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <ClientInfoCard
                  client={creditReport.client}
                  onEdit={handleOpenEditClient}
                  onViewHistory={handleViewHistory}
                />
                <RiskScoreCard score={riskScore} isLoading={isRiskScoreLoading} />
                <DebtSummaryCard summary={creditReport.debtSummary} />
              </div>
              <LoanDetails loans={creditReport.loans} onEditLoan={handleOpenEditLoan} />
            </CreditReportDisplay>
          </div>
        </div>
      )}

      {editingClient && (
        <Modal title="Editar Información del Cliente" onClose={handleCloseModals}>
          <EditClientForm
            client={editingClient}
            onSave={handleUpdateClient}
            onCancel={handleCloseModals}
          />
        </Modal>
      )}

      {editingLoan && (
        <Modal title={`Editar Préstamo #${editingLoan.id}`} onClose={handleCloseModals}>
          <EditLoanForm
            loan={editingLoan}
            onSave={handleUpdateLoan}
            onCancel={handleCloseModals}
          />
        </Modal>
      )}

      {historyModal && (
        <HistoryViewerModal
          title={historyModal.title}
          history={historyModal.data}
          onClose={handleCloseModals}
        />
      )}
    </>
  );
};
