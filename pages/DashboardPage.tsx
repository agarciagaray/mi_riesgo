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
    totalClients: number;
    activeClientsUpToDate: number;
    clientsWithArrears: number;
    clientsInLegal: number;
    moraDistribution: { [key: string]: number };
}


interface CompanyAnalyticsData {
    company: Company;
    totalClients: number;
    activeClientsUpToDate: number;
    clientsWithArrears: number;
    clientsInLegal: number;
    moraDistribution: { [key: string]: number };
}

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('general'); // 'general' or 'company'
    const [generalData, setGeneralData] = useState<GeneralDashboardData | null>(null);
    const [companyData, setCompanyData] = useState<CompanyAnalyticsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch pre-processed data from the backend
                const data = await creditService.fetchDashboardData();
                setGeneralData(data.general);
                setCompanyData(data.company);
            } catch (err) {
                setError('No se pudieron cargar los datos del dashboard.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated, isLoading]);

    const renderGeneralView = () => {
        if (!generalData) return null;
        return (
            <div className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <InfoCard icon={UserGroupIcon} title="Total de Clientes" value={generalData.totalClients.toString()} color="text-cyan-400" />
                    <InfoCard icon={ShieldCheckIcon} title="Clientes Activos al Día" value={generalData.activeClientsUpToDate.toString()} color="text-green-400" />
                    <InfoCard icon={ShieldExclamationIcon} title="Clientes con Mora" value={generalData.clientsWithArrears.toString()} color="text-yellow-400" />
                    <InfoCard icon={BuildingLibraryIcon} title="Estado Legal Especial" value={generalData.clientsInLegal.toString()} color="text-red-400" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
                    <div className="lg:col-span-3 bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Distribución de Créditos por Mora</h3>
                        <MoraDistributionChart data={generalData.moraDistribution} />
                    </div>
                    <div className="lg:col-span-2 bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Estado de Empresas Reportantes</h3>
                        <ReportingEntityStatus />
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
