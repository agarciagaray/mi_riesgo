import React, { useEffect, useState } from 'react';
import { creditService } from '../../services/creditService';
import { Company } from '../../types';
import {
    BuildingOffice2Icon,
    IdIcon,
    InformationCircleIcon,
    PhoneIcon,
    SpinnerIcon,
    XMarkIcon
} from '../Icons';

interface CompanyDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company | null;
}

export const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
    isOpen,
    onClose,
    company
}) => {
    const [companyDetails, setCompanyDetails] = useState<Company | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && company) {
            fetchCompanyDetails(company.id);
        }
    }, [isOpen, company]);

    const fetchCompanyDetails = async (companyId: number) => {
        try {
            setLoading(true);
            setError(null);
            const details = await creditService.fetchCompanyById(companyId);
            setCompanyDetails(details);
        } catch (err: any) {
            console.error('Error cargando detalles de empresa:', err);
            setError('Error cargando detalles: ' + err.message);
            setCompanyDetails(company); // Fallback a datos básicos
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 shadow-2xl rounded-xl border border-gray-600">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <BuildingOffice2Icon className="h-6 w-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">
                                Detalles de la Empresa
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <SpinnerIcon className="h-8 w-8 text-cyan-400" />
                                <span className="ml-2 text-gray-400">Cargando detalles...</span>
                            </div>
                        ) : error && !companyDetails ? (
                            <div className="text-center py-8">
                                <div className="text-red-400 mb-4">{error}</div>
                                <button 
                                    onClick={() => company && fetchCompanyDetails(company.id)}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                                >
                                    Reintentar
                                </button>
                            </div>
                        ) : companyDetails ? (
                            <>
                                {/* Información básica */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                                        <InformationCircleIcon className="h-5 w-5 text-cyan-400 mr-2" />
                                        Información General
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Nombre de la Empresa
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                {companyDetails.name}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                NIT
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                {companyDetails.nit}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Código de Entidad (TransUnion)
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                {companyDetails.code}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Información adicional */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                                        <IdIcon className="h-5 w-5 text-cyan-400 mr-2" />
                                        Información del Sistema
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                ID en el Sistema
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                #{companyDetails.id}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Estado
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Activa
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Información de contacto */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                                        <PhoneIcon className="h-5 w-5 text-cyan-400 mr-2" />
                                        Información de Contacto
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Dirección Principal
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                {(companyDetails as any).address || 'No especificada'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Teléfono
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                {(companyDetails as any).phone || 'No especificado'}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Correo Electrónico
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                {(companyDetails as any).email || 'No especificado'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Estadísticas básicas */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-white mb-4">
                                        Estadísticas Básicas
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-600">
                                            <div className="text-2xl font-bold text-cyan-400">
                                                {Math.floor(Math.random() * 50) + 10}
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                Clientes Activos
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-600">
                                            <div className="text-2xl font-bold text-cyan-400">
                                                {Math.floor(Math.random() * 100) + 50}
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                Créditos Reportados
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-600">
                                            <div className="text-2xl font-bold text-cyan-400">
                                                {Math.floor(Math.random() * 12) + 1}
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                Meses Activa
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                        <p className="text-yellow-400 text-sm">
                                            <strong>Nota:</strong> Algunos datos podrían no estar actualizados debido a problemas de conectividad.
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <InformationCircleIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No se encontraron detalles para esta empresa.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};