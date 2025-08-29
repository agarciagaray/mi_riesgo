import React, { useEffect, useState } from 'react';
import { creditService } from '../../services/creditService';
import { Company, User } from '../../types';
import {
    InformationCircleIcon,
    PencilIcon,
    SearchIcon,
    SpinnerIcon,
    TrashIcon,
    UserGroupIcon,
    UserIcon
} from '../Icons';

interface UserManagementProps {
    onViewDetails: (user: User) => void;
    onEditUser: (user: User) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
    onViewDetails,
    onEditUser
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Cargar usuarios y empresas en paralelo
            const [usersData, companiesData] = await Promise.all([
                creditService.fetchAllUsers(),
                creditService.fetchAllCompanies()
            ]);
            
            // Validación defensiva: asegurar que sean arrays
            if (Array.isArray(usersData)) {
                setUsers(usersData);
            } else {
                console.warn('fetchAllUsers no devolvió un array:', usersData);
                setUsers([]); // Usar array vacío como fallback
                setError('Error: formato de datos de usuarios inválido');
            }
            
            if (Array.isArray(companiesData)) {
                setCompanies(companiesData);
            } else {
                console.warn('fetchAllCompanies no devolvió un array:', companiesData);
                setCompanies([]); // Usar array vacío como fallback
            }
        } catch (err: any) {
            console.error('Error cargando datos:', err);
            setError('Error cargando datos: ' + err.message);
            // Asegurar que siempre sean arrays en caso de error
            setUsers([]);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: number, userName: string) => {
        const confirmed = window.confirm(
            `¿Está seguro que desea eliminar al usuario "${userName}"?\n\nEsta acción no se puede deshacer y el usuario perderá acceso al sistema.`
        );
        
        if (!confirmed) return;

        try {
            setDeletingId(userId);
            const success = await creditService.deleteUser(userId);
            
            if (success) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                alert('Usuario eliminado exitosamente.');
            } else {
                alert('Error al eliminar el usuario.');
            }
        } catch (err: any) {
            console.error('Error eliminando usuario:', err);
            alert('Error al eliminar el usuario: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const getCompanyName = (companyId?: number): string => {
        if (!companyId) return 'Administrador del Sistema';
        if (!Array.isArray(companies)) return 'Empresa no encontrada';
        const company = companies.find(c => c?.id === companyId);
        return company?.name || 'Empresa no encontrada';
    };

    const getRoleName = (role: string): string => {
        const roleNames = {
            'admin': 'Administrador',
            'manager': 'Gerente',
            'analyst': 'Analista'
        };
        return roleNames[role as keyof typeof roleNames] || role;
    };

    const getRoleIcon = (role: string): string => {
        const roleIcons = {
            'admin': '⚡',
            'manager': '👨‍💼',
            'analyst': '👨‍💻'
        };
        return roleIcons[role as keyof typeof roleIcons] || '👤';
    };

    const getRoleColor = (role: string): string => {
        const roleColors = {
            'admin': 'bg-red-100 text-red-800',
            'manager': 'bg-blue-100 text-blue-800',
            'analyst': 'bg-green-100 text-green-800'
        };
        return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
    };

    const filteredUsers = Array.isArray(users) ? users.filter(user =>
        user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.nationalIdentifier?.includes(searchQuery) ||
        getRoleName(user?.role).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCompanyName(user?.companyId).toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <SpinnerIcon className="h-8 w-8 text-cyan-400" />
                <span className="ml-2 text-gray-400">Cargando usuarios...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <div className="text-red-400 mb-4">{error}</div>
                <button 
                    onClick={fetchData}
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
                    <UserGroupIcon className="h-8 w-8 text-cyan-400" />
                    <h2 className="text-2xl font-semibold text-white">Gestión de Usuarios</h2>
                </div>
                
                <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2 w-full sm:w-auto">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, cédula o rol..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-white placeholder-gray-400 outline-none w-full sm:w-80"
                    />
                </div>
            </div>

            {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                    <UserGroupIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-400 mb-2">
                        {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                    </h3>
                    <p className="text-gray-500">
                        {searchQuery 
                            ? 'Intenta con otros términos de búsqueda.' 
                            : 'Los usuarios que crees aparecerán aquí.'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredUsers.map((user) => (
                        <div 
                            key={user.id}
                            className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-start gap-3">
                                        <UserIcon className="h-6 w-6 text-cyan-400 mt-1 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-white truncate">
                                                    {user.fullName}
                                                </h3>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                    <span className="mr-1">{getRoleIcon(user.role)}</span>
                                                    {getRoleName(user.role)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                                                <span><strong>Email:</strong> {user.email}</span>
                                                <span><strong>Cédula:</strong> {user.nationalIdentifier}</span>
                                                <span><strong>Teléfono:</strong> {user.phone}</span>
                                                <span><strong>Empresa:</strong> {getCompanyName(user.companyId)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 lg:flex-shrink-0">
                                    <button
                                        onClick={() => onViewDetails(user)}
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                        title="Ver detalles"
                                    >
                                        <InformationCircleIcon className="h-4 w-4" />
                                        <span className="hidden sm:inline">Detalles</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => onEditUser(user)}
                                        className="flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                                        title="Editar usuario"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        <span className="hidden sm:inline">Editar</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDelete(user.id, user.fullName)}
                                        disabled={deletingId === user.id}
                                        className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                                        title="Eliminar usuario"
                                    >
                                        {deletingId === user.id ? (
                                            <SpinnerIcon className="h-4 w-4" />
                                        ) : (
                                            <TrashIcon className="h-4 w-4" />
                                        )}
                                        <span className="hidden sm:inline">
                                            {deletingId === user.id ? 'Eliminando...' : 'Eliminar'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredUsers.length > 0 && (
                <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-700">
                    Mostrando {filteredUsers.length} de {users.length} usuario{users.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};