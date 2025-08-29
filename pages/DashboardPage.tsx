import { useEffect, useState } from 'react';
import { BuildingLibraryIcon, ShieldCheckIcon, ShieldExclamationIcon, SpinnerIcon, UserGroupIcon } from '../components/Icons';
import { CompanyAnalyticsCard } from '../components/dashboard/CompanyAnalyticsCard';
import { InfoCard } from '../components/dashboard/InfoCard';
import { MoraDistributionChart } from '../components/dashboard/MoraDistributionChart';
import { ReportingEntityStatus } from '../components/dashboard/ReportingEntityStatus';
import { useAuth } from '../contexts/AuthContext';
import { creditService } from '../services/creditService';
import type { Company } from '../types';

interface GeneralDashboardData {
  total_clients: number;
  active_clients_up_to_date: number;
  clients_with_arrears: number;
  clients_in_legal: number;
  mora_distribution: { [key: string]: number };
}


interface CompanyAnalyticsData {
  company: Company;
  total_clients: number;
  active_clients_up_to_date: number;
  clients_with_arrears: number;
  clients_in_legal: number;
  mora_distribution: { [key: string]: number };
}

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'company'
  const [generalData, setGeneralData] = useState<GeneralDashboardData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, isLoading, token } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !token || isInitialized) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching dashboard data with token:', token);
        // Fetch pre-processed data from the backend
        const data = await creditService.fetchDashboardData(token);
        console.log('Received dashboard data:', data);
        setGeneralData(data.general);
        setCompanyData(data.company);
        setIsInitialized(true);
      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError(`Error cargando dashboard: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, isLoading, token, isInitialized]);

  const renderGeneralView = () => {
    if (!generalData) {
      return <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg">No hay datos de dashboard disponibles.</div>;
    }

    console.log('Dashboard Data:', generalData); // Debug log

    // Validación defensiva de cada campo
    const totalClients = generalData.total_clients ?? 0;
    const activeClientsUpToDate = generalData.active_clients_up_to_date ?? 0;
    const clientsWithArrears = generalData.clients_with_arrears ?? 0;
    const clientsInLegal = generalData.clients_in_legal ?? 0;
    const moraDistribution = generalData.mora_distribution ?? {};

    return (
      <div className="space-y-6 sm:space-y-8">
        {/* La clase 'lg:grid-cols-4' ha sido cambiada a 'md:grid-cols-4' */}
        <div className="grid grid-cols-4 gap-4 sm:gap-6">
          <InfoCard icon={UserGroupIcon} title="Total de Clientes" value={totalClients.toString()} color="text-cyan-400" />
          <InfoCard icon={ShieldCheckIcon} title="Clientes Activos al Día" value={activeClientsUpToDate.toString()} color="text-green-400" />
          <InfoCard icon={ShieldExclamationIcon} title="Clientes con Mora" value={clientsWithArrears.toString()} color="text-yellow-400" />
          <InfoCard icon={BuildingLibraryIcon} title="Estado Legal Especial" value={clientsInLegal.toString()} color="text-red-400" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col min-h-[500px]">
            <h3 className="text-lg font-semibold text-white mb-6">Distribución de Créditos por Mora</h3>
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full max-w-3xl h-full">
                <MoraDistributionChart data={moraDistribution} />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col min-h-[500px]">
            <h3 className="text-lg font-semibold text-white mb-6">Estado de Empresas Reportantes</h3>
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full max-w-md h-full">
                <ReportingEntityStatus />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderCompanyView = () => (
    <div className="space-y-6">
      {companyData.map(data => (
        <CompanyAnalyticsCard key={data.company.id} data={data} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <div className="border-b border-gray-700">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button onClick={() => setActiveTab('general')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'general' ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-gray-400 hover:text-white'}`}>
            Vista General
          </button>
          <button onClick={() => setActiveTab('company')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'company' ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-gray-400 hover:text-white'}`}>
            Vista por Empresa
          </button>
        </nav>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-20"> <SpinnerIcon className="h-12 w-12 text-cyan-400" /> </div>
      ) : error ? (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">{error}</div>
      ) : (
        <div>{activeTab === 'general' ? renderGeneralView() : renderCompanyView()}</div>
      )}
    </div>
  );
};

export default DashboardPage;