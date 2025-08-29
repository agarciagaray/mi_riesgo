import React, { useEffect, useState } from 'react';
import { creditService } from '../../services/creditService';
import { Company, User } from '../../types';
import { PencilIcon, SpinnerIcon, XMarkIcon } from '../Icons';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdated: (updatedUser: User) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen, onClose, user, onUserUpdated
}) => {
    const [formData, setFormData] = useState({
        fullName: '', nationalIdentifier: '', phone: '', email: '',
        role: 'analyst' as 'analyst' | 'manager' | 'admin', companyId: ''
    });
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                fullName: user.fullName, nationalIdentifier: user.nationalIdentifier,
                phone: user.phone, email: user.email, role: user.role,
                companyId: user.companyId ? user.companyId.toString() : ''
            });
            setError(null);
            fetchCompanies();
        }
    }, [isOpen, user]);

    const fetchCompanies = async () => {
        try {
            const companiesData = await creditService.fetchAllCompanies();
            setCompanies(companiesData);
        } catch (err: any) {
            setError('Error cargando empresas');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            if (!formData.fullName.trim()) throw new Error('El nombre es requerido');
            if (!formData.phone.trim()) throw new Error('El teléfono es requerido');
            if (formData.role !== 'admin' && !formData.companyId) {
                throw new Error('Seleccione una empresa');
            }

            const updatedUser = await creditService.updateUser(user.id, {
                fullName: formData.fullName.trim(), phone: formData.phone.trim(),
                role: formData.role, companyId: formData.companyId ? parseInt(formData.companyId) : undefined
            });

            onUserUpdated(updatedUser);
            onClose();
            alert('Usuario actualizado exitosamente');
        } catch (err: any) {
            setError(err.message || 'Error al actualizar');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    const inputClass = "w-full px-3 py-2 bg-gray-900 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-cyan-500";
    const readOnlyClass = "w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed";

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full max-w-2xl p-6 bg-gray-800 rounded-xl border border-gray-600">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                            <PencilIcon className="h-6 w-6 text-yellow-400 mr-3" />
                            Editar Usuario
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Campos no editables */}
                        <div className="bg-gray-700/30 rounded-lg p-4">
                            <h4 className="text-sm text-gray-300 mb-3">🔒 Información No Editable</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Cédula</label>
                                    <input value={formData.nationalIdentifier} className={readOnlyClass} readOnly />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                                    <input value={formData.email} className={readOnlyClass} readOnly />
                                </div>
                            </div>
                        </div>

                        {/* Campos editables */}
                        <div className="bg-gray-700/30 rounded-lg p-4">
                            <h4 className="text-sm text-cyan-300 mb-3">✏️ Información Editable</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Nombre Completo *</label>
                                    <input name="fullName" value={formData.fullName} onChange={handleChange}
                                           className={inputClass} required disabled={loading} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Teléfono *</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange}
                                           className={inputClass} required disabled={loading} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Rol *</label>
                                        <select name="role" value={formData.role} onChange={handleChange}
                                                className={inputClass} disabled={loading}>
                                            <option value="analyst">👨‍💻 Analista</option>
                                            <option value="manager">👨‍💼 Gerente</option>
                                            <option value="admin">⚡ Administrador</option>
                                        </select>
                                    </div>
                                    {formData.role !== 'admin' && (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Empresa *</label>
                                            <select name="companyId" value={formData.companyId} onChange={handleChange}
                                                    className={inputClass} required disabled={loading}>
                                                <option value="">Seleccionar...</option>
                                                {companies.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                            <button type="button" onClick={onClose} disabled={loading}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                                Cancelar
                            </button>
                            <button type="submit" disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg">
                                {loading ? <SpinnerIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
                                {loading ? 'Actualizando...' : 'Actualizar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};