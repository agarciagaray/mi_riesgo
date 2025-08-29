import React, { useEffect, useState } from 'react';
import { creditService } from '../../services/creditService';
import { Company } from '../../types';
import {
    PencilIcon,
    SpinnerIcon,
    XMarkIcon
} from '../Icons';

interface EditCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company | null;
    onCompanyUpdated: (updatedCompany: Company) => void;
}

export const EditCompanyModal: React.FC<EditCompanyModalProps> = ({
    isOpen,
    onClose,
    company,
    onCompanyUpdated
}) => {
    const [formData, setFormData] = useState({
        name: '',
        nit: '',
        code: '',
        address: '',
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && company) {
            setFormData({
                name: company.name,
                nit: company.nit,
                code: company.code,
                address: '', // Valor por defecto ya que no está en el tipo Company actual
                phone: '',   // Valor por defecto ya que no está en el tipo Company actual
                email: ''    // Valor por defecto ya que no está en el tipo Company actual
            });
            setError(null);
        }
    }, [isOpen, company]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!company) return;

        try {
            setLoading(true);
            setError(null);

            // Validar que los campos editables requeridos no estén vacíos
            if (!formData.code.trim()) {
                throw new Error('El código de entidad es requerido');
            }

            if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                throw new Error('El formato del correo electrónico no es válido');
            }

            // Validar formato del código (solo números)
            if (!/^\d+$/.test(formData.code)) {
                throw new Error('El código de entidad debe contener solo números');
            }

            const updatedCompany = await creditService.updateCompany(company.id, {
                code: formData.code.trim(),
                // Solo incluir los campos adicionales si tienen valores
                ...(formData.address.trim() && { address: formData.address.trim() }),
                ...(formData.phone.trim() && { phone: formData.phone.trim() }),
                ...(formData.email.trim() && { email: formData.email.trim() })
            });

            onCompanyUpdated(updatedCompany);
            onClose();
            alert('Empresa actualizada exitosamente.');
        } catch (err: any) {
            console.error('Error actualizando empresa:', err);
            setError(err.message || 'Error al actualizar la empresa');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!isOpen || !company) return null;

    const inputClass = "w-full px-3 py-2 bg-gray-900 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all";
    const readOnlyClass = "w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed";

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 shadow-2xl rounded-xl border border-gray-600">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <PencilIcon className="h-6 w-6 text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">
                                Editar Empresa
                            </h3>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Campos de solo lectura */}
                            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                                    <span className="mr-2">🔒</span>
                                    Información No Editable
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-400 mb-2">
                                            Nombre de la Empresa
                                        </label>
                                        <input
                                            type="text"
                                            id="edit-name"
                                            name="name"
                                            value={formData.name}
                                            className={readOnlyClass}
                                            readOnly
                                            title="Este campo no se puede editar"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="edit-nit" className="block text-sm font-medium text-gray-400 mb-2">
                                            NIT
                                        </label>
                                        <input
                                            type="text"
                                            id="edit-nit"
                                            name="nit"
                                            value={formData.nit}
                                            className={readOnlyClass}
                                            readOnly
                                            title="Este campo no se puede editar"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    ⚠️ Estos datos no se pueden modificar ya que son identificadores únicos de la empresa.
                                </p>
                            </div>

                            {/* Campos editables */}
                            <div className="bg-gray-700/30 rounded-lg p-4 border border-cyan-600/30">
                                <h4 className="text-sm font-medium text-cyan-300 mb-3 flex items-center">
                                    <span className="mr-2">✏️</span>
                                    Información Editable
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="edit-code" className="block text-sm font-medium text-gray-400 mb-2">
                                            Código de Entidad (TransUnion) <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="edit-code"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            className={inputClass}
                                            required
                                            disabled={loading}
                                            pattern="\\d+"
                                            title="Solo se admiten números"
                                            placeholder="Ej: 101"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Código numérico asignado por TransUnion para identificar la entidad
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="edit-address" className="block text-sm font-medium text-gray-400 mb-2">
                                            Dirección Principal
                                        </label>
                                        <input
                                            type="text"
                                            id="edit-address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className={inputClass}
                                            disabled={loading}
                                            placeholder="Ej: Calle 123 #45-67, Bogotá, Colombia"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-400 mb-2">
                                                Teléfono de Contacto
                                            </label>
                                            <input
                                                type="tel"
                                                id="edit-phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={inputClass}
                                                disabled={loading}
                                                placeholder="Ej: +57 1 234 5678"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="edit-email" className="block text-sm font-medium text-gray-400 mb-2">
                                                Correo Electrónico
                                            </label>
                                            <input
                                                type="email"
                                                id="edit-email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={inputClass}
                                                disabled={loading}
                                                placeholder="Ej: contacto@empresa.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <SpinnerIcon className="h-4 w-4" />
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <PencilIcon className="h-4 w-4" />
                                        Actualizar Empresa
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};