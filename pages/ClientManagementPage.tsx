import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { creditService } from '../services/creditService';
import type { Client } from '../types';
import { SpinnerIcon, UserGroupIcon, SearchIcon } from '../components/Icons';
import { ClientTable } from '../components/client-management/ClientTable';
import { Pagination } from '../components/client-management/Pagination';
import { Modal } from '../components/Modal';
import { EditClientForm, ClientUpdateData } from '../components/EditClientForm';

const ITEMS_PER_PAGE = 10;

interface ClientManagementPageProps {
    onViewClient: (clientId: number) => void;
}

export const ClientManagementPage: React.FC<ClientManagementPageProps> = ({ onViewClient }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchClients = async () => {
            try {
                setLoading(true);
                // The backend now provides a dedicated endpoint for clients
                const allClients = await creditService.fetchAllClients();
                setClients(allClients);
                setError(null);
            } catch (err) {
                setError('No se pudieron cargar los datos de los clientes.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const filteredClients = useMemo(() => {
        if (!searchQuery) {
            return clients;
        }
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        return clients.filter(client =>
            client.fullName.toLowerCase().includes(lowercasedQuery) ||
            client.nationalIdentifier.includes(lowercasedQuery)
        );
    }, [clients, searchQuery]);
    
    const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);

    const currentClients = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredClients.slice(startIndex, endIndex);
    }, [filteredClients, currentPage]);

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(p => p + 1);
        }
    }, [currentPage, totalPages]);

    const handlePrevPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(p => p - 1);
        }
    }, [currentPage]);
    
    const handleEditClient = useCallback((client: Client) => {
        setEditingClient(client);
    }, []);

    const handleViewClient = useCallback((client: Client) => {
        onViewClient(client.id);
    }, [onViewClient]);

    const handleCloseModal = useCallback(() => {
        setEditingClient(null);
    }, []);

    const handleSaveClient = useCallback(async (updatedData: ClientUpdateData) => {
        if (!editingClient) return;

        try {
            const savedClient = await creditService.updateClient(editingClient.id, updatedData);
            setClients(prevClients => 
                prevClients.map(c => (c.id === savedClient.id ? savedClient : c))
            );
        } catch (error) {
            console.error("Error updating client:", error);
            // Optionally set an error state to show in a toast/notification
        } finally {
            handleCloseModal();
        }
    }, [editingClient, handleCloseModal]);


    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <SpinnerIcon className="h-12 w-12 text-cyan-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                {error}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <UserGroupIcon className="h-8 w-8 text-cyan-400"/>
                    <h1 className="text-3xl font-bold text-white">Gestión de Clientes</h1>
                </div>

                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o identificación..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                    />
                </div>
                
                <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    {filteredClients.length > 0 ? (
                        <ClientTable clients={currentClients} onEdit={handleEditClient} onViewClient={handleViewClient} />
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            {searchQuery
                                ? `No se encontraron clientes que coincidan con la búsqueda.`
                                : 'No hay clientes registrados en el sistema.'}
                        </div>
                    )}
                </div>
                
                {totalPages > 1 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onNext={handleNextPage}
                        onPrev={handlePrevPage}
                    />
                )}
            </div>

            {editingClient && (
                <Modal title="Editar Información del Cliente" onClose={handleCloseModal}>
                    <EditClientForm
                        client={editingClient}
                        onSave={handleSaveClient}
                        onCancel={handleCloseModal}
                    />
                </Modal>
            )}
        </>
    );
};
