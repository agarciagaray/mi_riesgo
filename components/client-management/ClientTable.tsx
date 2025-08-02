import React from 'react';
import type { Client } from '../../types';
import { PencilIcon, FlagIcon } from '../Icons';

interface ClientTableProps {
    clients: Client[];
    onEdit: (client: Client) => void;
    onViewClient: (client: Client) => void;
}

const getCityFromAddress = (address: string): string => {
    if (!address) return 'N/A';
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : 'N/A';
};

export const ClientTable: React.FC<ClientTableProps> = ({ clients, onEdit, onViewClient }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider">
                    <tr>
                        <th scope="col" className="px-6 py-3">Cliente</th>
                        <th scope="col" className="px-6 py-3">Identificación</th>
                        <th scope="col" className="px-6 py-3">Contacto</th>
                        <th scope="col" className="px-6 py-3">Ubicación</th>
                        <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {clients.map((client) => (
                        <tr 
                            key={client.id} 
                            className="hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer"
                            onClick={() => onViewClient(client)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-white">{client.fullName}</div>
                                {client.flags && client.flags.length > 0 && (
                                    <div className="flex items-center mt-1">
                                        <FlagIcon className="h-3 w-3 mr-1 text-red-400"/>
                                        <span className="text-xs text-red-400">{client.flags.join(', ')}</span>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono">{client.nationalIdentifier}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>{client.emails[0]?.value || 'N/A'}</div>
                                <div className="text-gray-400">{client.phones[0]?.value || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div title={client.addresses[0]?.value}>{getCityFromAddress(client.addresses[0]?.value)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent row click from firing
                                        onEdit(client);
                                    }}
                                    className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-gray-700 rounded-full transition-colors"
                                    aria-label={`Editar ${client.fullName}`}
                                >
                                    <PencilIcon className="h-5 w-5"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {clients.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-10 text-gray-500">
                                No se encontraron clientes.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};