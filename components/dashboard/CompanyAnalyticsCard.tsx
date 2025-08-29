import React from 'react';
import type { Company } from '../../types';
import { BuildingLibraryIcon, ShieldCheckIcon, ShieldExclamationIcon, UserGroupIcon } from '../Icons';
import { MoraDistributionChart } from './MoraDistributionChart';

interface CompanyAnalyticsData {
  company: Company;
  totalClients: number;
  activeClientsUpToDate: number;
  clientsWithArrears: number;
  clientsInLegal: number;
  moraDistribution: { [key: string]: number };
}

interface CompanyAnalyticsCardProps {
  data: CompanyAnalyticsData;
}

const MiniInfoCard: React.FC<{ icon: React.FC<React.SVGProps<SVGSVGElement>>; value: string; label: string; color: string }> = ({ icon: Icon, value, label, color }) => (
  <div className="flex items-start space-x-3">
    <Icon className={`h-5 w-5 flex-shrink-0 ${color}`} />
    <div>
      <p className="text-base font-semibold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </div>
);

export const CompanyAnalyticsCard: React.FC<CompanyAnalyticsCardProps> = ({ data }) => {
  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-3">{data.company.name}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metrics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniInfoCard
            icon={UserGroupIcon}
            value={data.totalClients.toString()}
            label="Clientes Totales"
            color="text-cyan-400"
          />
          <MiniInfoCard
            icon={ShieldCheckIcon}
            value={data.activeClientsUpToDate.toString()}
            label="Activos al Día"
            color="text-green-400"
          />
          <MiniInfoCard
            icon={ShieldExclamationIcon}
            value={data.clientsWithArrears.toString()}
            label="Clientes con Mora"
            color="text-yellow-400"
          />
          <MiniInfoCard
            icon={BuildingLibraryIcon}
            value={data.clientsInLegal.toString()}
            label="Estado Legal"
            color="text-red-400"
          />
        </div>
        {/* Chart Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Distribución de Mora de la Cartera</h4>
          <MoraDistributionChart data={data.moraDistribution} />
        </div>
      </div>
    </div>
  );
};
