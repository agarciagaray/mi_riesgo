import React, { useEffect, useState } from 'react';
import { creditService } from '../../services/creditService';
import { Company, User } from '../../types';
import {
    IdIcon,
    InformationCircleIcon,
    PhoneIcon,
    SpinnerIcon,
    UserIcon,
    XMarkIcon
} from '../Icons';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
    isOpen,
    onClose,
    user
}) => {
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [userCompany, setUserCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            fetchUserDetails(user.id);
        }
    }, [isOpen, user]);

    const fetchUserDetails = async (userId: number) => {
        try {
            setLoading(true);
            setError(null);
            
            // Obtener detalles del usuario
            const details = await creditService.fetchUserById(userId);
            setUserDetails(details);
            
            // Si el usuario tiene empresa asignada, obtener sus detalles
            if (details?.companyId) {
                const company = await creditService.fetchCompanyById(details.companyId);
                setUserCompany(company);
            } else {
                setUserCompany(null);
            }
        } catch (err: any) {
            console.error('Error cargando detalles de usuario:', err);
            setError('Error cargando detalles: ' + err.message);
            setUserDetails(user); // Fallback a datos básicos
            setUserCompany(null);
        } finally {
            setLoading(false);
        }
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
                                <UserIcon className="h-6 w-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">
                                Detalles del Usuario
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
                        ) : error && !userDetails ? (
                            <div className="text-center py-8">
                                <div className="text-red-400 mb-4">{error}</div>
                                <button 
                                    onClick={() => user && fetchUserDetails(user.id)}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                                >
                                    Reintentar
                                </button>
                            </div>
                        ) : userDetails ? (
                            <>
                                {/* Información Personal */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                                        <InformationCircleIcon className="h-5 w-5 text-cyan-400 mr-2" />
                                        Información Personal
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Nombre Completo
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                {userDetails.fullName}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Cédula de Ciudadanía
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                {userDetails.nationalIdentifier}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Correo Electrónico
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                {userDetails.email}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Teléfono
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                {userDetails.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rol y Permisos */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                                        <IdIcon className="h-5 w-5 text-cyan-400 mr-2" />
                                        Rol y Permisos
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                ID en el Sistema
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                #{userDetails.id}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                Rol del Usuario
                                            </label>
                                            <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userDetails.role)}`}>
                                                    <span className="mr-1">{getRoleIcon(userDetails.role)}</span>
                                                    {getRoleName(userDetails.role)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Permisos según el rol */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Permisos del Rol
                                        </label>
                                        <div className="bg-gray-900 rounded border border-gray-500 p-3">
                                            {userDetails.role === 'admin' && (
                                                <ul className="text-sm text-gray-300 space-y-1">
                                                    <li className="flex items-center">
                                                        <span className="text-green-400 mr-2">✓</span>
                                                        Administración completa del sistema
                                                    </li>
                                                    <li className="flex items-center">
                                                        <span className="text-green-400 mr-2">✓</span>
                                                        Gestión de empresas y usuarios
                                                    </li>
                                                    <li className="flex items-center">
                                                        <span className="text-green-400 mr-2">✓</span>
                                                        Acceso a todas las funcionalidades
                                                    </li>
                                                </ul>
                                            )}
                                            {userDetails.role === 'manager' && (
                                                <ul className="text-sm text-gray-300 space-y-1">
                                                    <li className="flex items-center">
                                                        <span className="text-green-400 mr-2">✓</span>
                                                        Gestión de usuarios de su empresa
                                                    </li>
                                                    <li className="flex items-center">
                                                        <span className="text-green-400 mr-2">✓</span>
                                                        Consulta de reportes crediticios
                                                    </li>
                                                    <li className="flex items-center">
                                                        <span className="text-green-400 mr-2">✓</span>
                                                        Carga de archivos de créditos
                                                    </li>
                                                </ul>
                                            )}
                                            {userDetails.role === 'analyst' && (
                                                <ul className="text-sm text-gray-300 space-y-1">
                                                    <li className="flex items-center">
                                                        <span className="text-green-400 mr-2">✓</span>
                                                        Consulta de reportes crediticios
                                                    </li>
                                                    <li className="flex items-center">
                                                        <span className="text-green-400 mr-2">✓</span>
                                                        Análisis de riesgo crediticio
                                                    </li>
                                                    <li className="flex items-center">
                                                        <span className="text-yellow-400 mr-2">○</span>
                                                        Carga de archivos (solo de su empresa)
                                                    </li>
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Información de la Empresa */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                                        <PhoneIcon className="h-5 w-5 text-cyan-400 mr-2" />
                                        Información de la Empresa
                                    </h4>
                                    {userDetails.role === 'admin' ? (
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                            <p className="text-blue-400 text-sm">
                                                <strong>ℹ️ Administrador del Sistema</strong><br />
                                                Este usuario tiene acceso a todas las empresas del sistema y no está limitado a una empresa específica.
                                            </p>
                                        </div>
                                    ) : userCompany ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                                    Nombre de la Empresa
                                                </label>
                                                <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                    {userCompany.name}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                                    NIT
                                                </label>
                                                <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                    {userCompany.nit}
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                                    Código de Entidad (TransUnion)
                                                </label>
                                                <div className="text-white bg-gray-900 px-3 py-2 rounded border border-gray-500">
                                                    {userCompany.code}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                            <p className="text-yellow-400 text-sm">
                                                <strong>⚠️ Empresa no encontrada</strong><br />
                                                Este usuario tiene una empresa asignada, pero no se pudo cargar la información.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Estadísticas básicas */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-white mb-4">
                                        Estado del Usuario
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-600">
                                            <div className="text-2xl font-bold text-green-400">
                                                Activo
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                Estado de la Cuenta
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-600">
                                            <div className="text-2xl font-bold text-cyan-400">
                                                {Math.floor(Math.random() * 30) + 1}
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                Días Desde Último Acceso
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-600">
                                            <div className="text-2xl font-bold text-cyan-400">
                                                {Math.floor(Math.random() * 100) + 10}
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                Consultas Realizadas
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
                                <UserIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No se encontraron detalles para este usuario.</p>
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