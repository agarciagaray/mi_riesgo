import React from 'react';
import type { Client, HistoricEntry } from '../types';
import { CalendarIcon, ClockIcon, EmailIcon, FlagIcon, IdIcon, LocationIcon, PencilIcon, PhoneIcon, UserIcon } from './Icons';

interface ClientInfoCardProps {
  client: Client;
  onEdit: () => void;
  onViewHistory: (title: string, data: HistoricEntry<string>[]) => void;
}

export const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ client, onEdit, onViewHistory }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 gap-4">
        <h3 className="text-xl font-semibold text-white flex items-center">
            <UserIcon className="h-6 w-6 mr-2 text-cyan-400"/>Información del Cliente
        </h3>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors flex-shrink-0"
          aria-label="Editar información del cliente"
        >
            <PencilIcon className="h-4 w-4" />
            <span>Editar</span>
        </button>
      </div>
      <div className="space-y-3 text-sm flex-grow">
        <div className="flex items-start">
          <IdIcon className="h-4 w-4 mr-3 mt-1 text-gray-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-200">{client.fullName}</p>
            <p className="text-gray-400">ID: {client.nationalIdentifier}</p>
          </div>
        </div>
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
          <p className="text-gray-300">Nacimiento: {new Date(client.birthDate).toLocaleDateString()}</p>
        </div>
        <div className="flex items-start">
          <LocationIcon className="h-4 w-4 mr-3 mt-1 text-gray-400 flex-shrink-0" />
          <p className="text-gray-300 flex-grow">{client.addresses[0]?.value || 'N/A'}</p>
           {client.addresses.length > 1 && (
            <button onClick={() => onViewHistory('Historial de Direcciones', client.addresses)} title="Ver historial" className="text-gray-500 hover:text-cyan-400 transition-colors ml-2 flex-shrink-0">
              <ClockIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center">
          <PhoneIcon className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
          <p className="text-gray-300 flex-grow">{client.phones[0]?.value || 'N/A'}</p>
           {client.phones.length > 1 && (
            <button onClick={() => onViewHistory('Historial de Teléfonos', client.phones)} title="Ver historial" className="text-gray-500 hover:text-cyan-400 transition-colors ml-2 flex-shrink-0">
              <ClockIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center">
          <EmailIcon className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
          <p className="text-gray-300 flex-grow">{client.emails[0]?.value || 'N/A'}</p>
           {client.emails.length > 1 && (
            <button onClick={() => onViewHistory('Historial de Correos', client.emails)} title="Ver historial" className="text-gray-500 hover:text-cyan-400 transition-colors ml-2 flex-shrink-0">
              <ClockIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {client.flags && client.flags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center"><FlagIcon className="h-4 w-4 mr-2 text-red-400"/>Indicadores de Riesgo</h4>
            <div className="flex flex-wrap gap-2">
                {client.flags.map((flag, index) => (
                    <span key={`${client.id}-${flag}-${index}`} className="px-2 py-1 text-xs font-semibold rounded-full bg-red-900/70 text-red-300">
                        {flag}
                    </span>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};