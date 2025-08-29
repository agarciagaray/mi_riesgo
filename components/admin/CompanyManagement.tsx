import React, { useEffect, useState } from 'react';
import { creditService } from '../../services/creditService';
import { Company } from '../../types';
import {
    BuildingOffice2Icon,
    InformationCircleIcon,
    PencilIcon,
    SearchIcon,
    SpinnerIcon,
    TrashIcon
} from '../Icons';

interface CompanyManagementProps {
    onViewDetails: (company: Company) => void;
    onEditCompany: (company: Company) => void;
}

export const CompanyManagement: React.FC<CompanyManagementProps> = ({
    onViewDetails,
    onEditCompany
}) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError(null);
            const companiesData = await creditService.fetchAllCompanies();
            
            // Validación defensiva: asegurar que sea un array
            if (Array.isArray(companiesData)) {
                setCompanies(companiesData);
            } else {
                console.warn('fetchAllCompanies no devolvió un array:', companiesData);
                setCompanies([]); // Usar array vacío como fallback
                setError('Error: formato de datos inválido');
            }
        } catch (err: any) {
            console.error('Error cargando empresas:', err);
            setError('Error cargando empresas: ' + err.message);
            setCompanies([]); // Asegurar que siempre sea un array
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (companyId: number, companyName: string) => {
        const confirmed = window.confirm(
            `¿Está seguro que desea eliminar la empresa "${companyName}"?\n\nEsta acción no se puede deshacer.`
        );
        
        if (!confirmed) return;

        try {
            setDeletingId(companyId);
            const success = await creditService.deleteCompany(companyId);
            
            if (success) {
                setCompanies(prev => prev.filter(c => c.id !== companyId));
                alert('Empresa eliminada exitosamente.');
            } else {
                alert('Error al eliminar la empresa.');
            }
        } catch (err: any) {
            console.error('Error eliminando empresa:', err);
            alert('Error al eliminar la empresa: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const filteredCompanies = Array.isArray(companies) ? companies.filter(company =>
        company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company?.nit?.includes(searchQuery) ||
        company?.code?.includes(searchQuery)
    ) : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <SpinnerIcon className="h-8 w-8 text-cyan-400" />
                <span className="ml-2 text-gray-400">Cargando empresas...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <div className="text-red-400 mb-4">{error}</div>
                <button 
                    onClick={fetchCompanies}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                    <BuildingOffice2Icon className="h-8 w-8 text-cyan-400" />
                    <h2 className="text-2xl font-semibold text-white">Gestión de Empresas</h2>
                </div>
                
                <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2 w-full sm:w-auto">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, NIT o código..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-white placeholder-gray-400 outline-none w-full sm:w-64"
                    />
                </div>
            </div>

            {filteredCompanies.length === 0 ? (
                <div className="text-center py-12">
                    <BuildingOffice2Icon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-400 mb-2">
                        {searchQuery ? 'No se encontraron empresas' : 'No hay empresas registradas'}
                    </h3>
                    <p className="text-gray-500">
                        {searchQuery 
                            ? 'Intenta con otros términos de búsqueda.' 
                            : 'Las empresas que crees aparecerán aquí.'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredCompanies.map((company) => (
                        <div 
                            key={company.id}
                            className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-start gap-3">
                                        <BuildingOffice2Icon className="h-6 w-6 text-cyan-400 mt-1 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-1 truncate">
                                                {company.name}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                                <span><strong>NIT:</strong> {company.nit}</span>
                                                <span><strong>Código:</strong> {company.code}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 lg:flex-shrink-0">
                                    <button
                                        onClick={() => onViewDetails(company)}
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                        title="Ver detalles"
                                    >
                                        <InformationCircleIcon className="h-4 w-4" />
                                        <span className="hidden sm:inline">Detalles</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => onEditCompany(company)}
                                        className="flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                                        title="Editar empresa"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        <span className="hidden sm:inline">Editar</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDelete(company.id, company.name)}
                                        disabled={deletingId === company.id}
                                        className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                                        title="Eliminar empresa"
                                    >
                                        {deletingId === company.id ? (
                                            <SpinnerIcon className="h-4 w-4" />
                                        ) : (
                                            <TrashIcon className="h-4 w-4" />
                                        )}
                                        <span className="hidden sm:inline">
                                            {deletingId === company.id ? 'Eliminando...' : 'Eliminar'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredCompanies.length > 0 && (
                <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-700">
                    Mostrando {filteredCompanies.length} de {companies.length} empresa{companies.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};