import React from 'react';
import type { Client } from '../../types';
import { EmailIcon, EyeIcon, FlagIcon, LocationIcon, PencilIcon, PhoneIcon, UserIcon } from '../Icons';

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

const formatPhoneNumber = (phone: string): string => {
    if (!phone) return 'N/A';
    // Formatear número de teléfono para mejor legibilidad
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
};

const getFlagColor = (flag: string): string => {
    switch (flag.toLowerCase()) {
        case 'moroso':
        case 'alto_riesgo':
            return 'text-red-400';
        case 'activo':
        case 'nuevo_cliente':
            return 'text-green-400';
        default:
            return 'text-yellow-400';
    }
};

const getFlagLabel = (flag: string): string => {
    switch (flag.toLowerCase()) {
        case 'moroso':
            return 'Moroso';
        case 'alto_riesgo':
            return 'Alto Riesgo';
        case 'activo':
            return 'Activo';
        case 'nuevo_cliente':
            return 'Nuevo';
        default:
            return flag;
    }
};

export const ClientTable: React.FC<ClientTableProps> = ({ clients, onEdit, onViewClient }) => {
    if (clients.length === 0) {
        return (
            <div className="text-center py-16">
                <UserIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No hay clientes disponibles</h3>
                <p className="text-gray-500">No se encontraron clientes en el sistema</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider">
                    <tr>
                        <th scope="col" className="px-6 py-4 font-semibold">
                            <div className="flex items-center space-x-2">
                                <UserIcon className="h-4 w-4" />
                                <span>Cliente</span>
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-4 font-semibold">
                            <div className="flex items-center space-x-2">
                                <span>ID / Documento</span>
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-4 font-semibold">
                            <div className="flex items-center space-x-2">
                                <PhoneIcon className="h-4 w-4" />
                                <span>Contacto</span>
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-4 font-semibold">
                            <div className="flex items-center space-x-2">
                                <LocationIcon className="h-4 w-4" />
                                <span>Ubicación</span>
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-4 font-semibold">
                            <div className="flex items-center space-x-2">
                                <FlagIcon className="h-4 w-4" />
                                <span>Estado</span>
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-right font-semibold">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {clients.map((client) => (
                        <tr 
                            key={client.id} 
                            className="hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer group"
                            onClick={() => onViewClient(client)}
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                                            {client.fullName}
                                        </div>
                                        <div className="text-gray-400 text-xs">
                                            Cliente ID: {client.id}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            
                            <td className="px-6 py-4">
                                <div className="font-mono text-cyan-300 font-medium">
                                    {client.nationalIdentifier}
                                </div>
                                <div className="text-gray-400 text-xs mt-1">
                                    Documento
                                </div>
                            </td>
                            
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2 text-gray-300">
                                        <EmailIcon className="h-3 w-3 text-gray-500" />
                                        <span className="text-xs truncate max-w-[150px]" title={client.emails[0]?.value}>
                                            {client.emails[0]?.value || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-400">
                                        <PhoneIcon className="h-3 w-3 text-gray-500" />
                                        <span className="text-xs">
                                            {formatPhoneNumber(client.phones[0]?.value) || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                    <LocationIcon className="h-3 w-3 text-gray-500" />
                                    <span className="text-gray-300 text-xs" title={client.addresses[0]?.value}>
                                        {getCityFromAddress(client.addresses[0]?.value)}
                                    </span>
                                </div>
                            </td>
                            
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    {client.flags && client.flags.length > 0 ? (
                                        client.flags.map((flag, index) => (
                                            <div key={index} className="flex items-center space-x-1">
                                                <FlagIcon className={`h-3 w-3 ${getFlagColor(flag)}`} />
                                                <span className={`text-xs font-medium ${getFlagColor(flag)}`}>
                                                    {getFlagLabel(flag)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center space-x-1">
                                            <FlagIcon className="h-3 w-3 text-green-400" />
                                            <span className="text-xs font-medium text-green-400">Sin alertas</span>
                                        </div>
                                    )}
                                </div>
                            </td>
                            
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end space-x-2">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewClient(client);
                                        }}
                                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-200 group/btn"
                                        title={`Ver detalles de ${client.fullName}`}
                                    >
                                        <EyeIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(client);
                                        }}
                                        className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 rounded-lg transition-all duration-200 group/btn"
                                        title={`Editar ${client.fullName}`}
                                    >
                                        <PencilIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Información adicional en la parte inferior */}
            <div className="bg-gray-700/30 px-6 py-3 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                        <span>Total de clientes: <span className="font-semibold text-white">{clients.length}</span></span>
                        <span>•</span>
                        <span>Activos: <span className="font-semibold text-green-400">{clients.filter(c => c.flags?.includes('activo')).length}</span></span>
                        <span>•</span>
                        <span>Con alertas: <span className="font-semibold text-red-400">{clients.filter(c => c.flags?.some(f => ['moroso', 'alto_riesgo'].includes(f))).length}</span></span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Haz clic en una fila para ver detalles
                    </div>
                </div>
            </div>
        </div>
    );
};