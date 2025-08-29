import React, { useEffect, useState } from 'react';
import { creditService } from '../../services/creditService';
import { Company } from '../../types';
import { EyeIcon, EyeSlashIcon, SpinnerIcon, UserPlusIcon } from '../Icons';

export const CreateUserForm: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        nationalIdentifier: '',
        phone: '',
        email: '',
        password: '',
        role: 'analyst' as 'analyst' | 'manager' | 'admin',
        companyId: ''
    });
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);

    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoadingCompanies(true);
            const companiesData = await creditService.fetchAllCompanies();
            setCompanies(companiesData);
        } catch (err: any) {
            console.error('Error cargando empresas:', err);
            setError('Error cargando lista de empresas');
        } finally {
            setLoadingCompanies(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);

            // Validaciones
            if (!formData.fullName.trim()) {
                throw new Error('El nombre completo es requerido');
            }
            if (!formData.nationalIdentifier.trim()) {
                throw new Error('La cédula es requerida');
            }
            if (!/^\d{7,10}$/.test(formData.nationalIdentifier)) {
                throw new Error('La cédula debe tener entre 7 y 10 dígitos numéricos');
            }
            if (!formData.phone.trim()) {
                throw new Error('El teléfono es requerido');
            }
            if (!formData.email.trim()) {
                throw new Error('El correo electrónico es requerido');
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                throw new Error('El formato del correo electrónico no es válido');
            }
            if (!formData.password.trim() || formData.password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }
            if (formData.role !== 'admin' && !formData.companyId) {
                throw new Error('Debe seleccionar una empresa para usuarios no administradores');
            }

            // Simular creación del usuario
            const userData = {
                fullName: formData.fullName.trim(),
                nationalIdentifier: formData.nationalIdentifier.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role: formData.role,
                companyId: formData.companyId ? parseInt(formData.companyId) : undefined
            };

            console.log('Datos del nuevo usuario:', userData);
            
            const selectedCompany = companies.find(c => c.id === parseInt(formData.companyId));
            const companyName = selectedCompany ? selectedCompany.name : 'Administrador del Sistema';
            
            alert(`✅ Usuario "${formData.fullName}" creado exitosamente\n\n` +
                  `📋 Detalles:\n` +
                  `• Rol: ${formData.role === 'analyst' ? 'Analista' : formData.role === 'manager' ? 'Gerente' : 'Administrador'}\n` +
                  `• Empresa: ${companyName}\n` +
                  `• Cédula: ${formData.nationalIdentifier}\n\n` +
                  `🔐 Credenciales de acceso:\n` +
                  `• Email: ${formData.email}\n` +
                  `• Contraseña: ${formData.password}\n\n` +
                  `⚠️ Comparta estas credenciales de forma segura con el usuario.`);
            
            // Reset form
            setFormData({
                fullName: '',
                nationalIdentifier: '',
                phone: '',
                email: '',
                password: '',
                role: 'analyst',
                companyId: ''
            });
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-3 py-2 bg-gray-900 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all";
    const selectClass = "w-full px-3 py-2 bg-gray-900 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all";

    if (loadingCompanies) {
        return (
            <div className="flex items-center justify-center p-8">
                <SpinnerIcon className="h-8 w-8 text-cyan-400" />
                <span className="ml-2 text-gray-400">Cargando formulario...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <UserPlusIcon className="h-8 w-8 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Crear Nuevo Usuario</h2>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Personal */}
                <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <span className="mr-2">👤</span>
                        Información Personal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-400 mb-2">
                                Nombre Completo <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                id="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={inputClass}
                                required
                                disabled={loading}
                                placeholder="Ej: Juan Carlos Pérez García"
                            />
                        </div>
                        <div>
                            <label htmlFor="nationalIdentifier" className="block text-sm font-medium text-gray-400 mb-2">
                                Cédula de Ciudadanía <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="nationalIdentifier"
                                id="nationalIdentifier"
                                value={formData.nationalIdentifier}
                                onChange={handleChange}
                                className={inputClass}
                                required
                                disabled={loading}
                                pattern="\d{7,10}"
                                placeholder="Ej: 12345678"
                                title="Ingrese solo números, entre 7 y 10 dígitos"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">
                                Teléfono/Celular <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={inputClass}
                                required
                                disabled={loading}
                                placeholder="Ej: +57 300 123 4567"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                                Correo Electrónico <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClass}
                                required
                                disabled={loading}
                                placeholder="Ej: usuario@empresa.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Credenciales de Acceso */}
                <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <span className="mr-2">🔐</span>
                        Credenciales de Acceso
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                                Contraseña <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`${inputClass} pr-20`}
                                    required
                                    disabled={loading}
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="p-1 text-gray-400 hover:text-white transition-colors"
                                        title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-4 w-4" />
                                        ) : (
                                            <EyeIcon className="h-4 w-4" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="px-2 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
                                        title="Generar contraseña automática"
                                    >
                                        Auto
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                💡 Use el botón "Auto" para generar una contraseña segura automáticamente
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rol y Empresa */}
                <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <span className="mr-2">🏢</span>
                        Rol y Asignación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-2">
                                Rol del Usuario <span className="text-red-400">*</span>
                            </label>
                            <select
                                name="role"
                                id="role"
                                value={formData.role}
                                onChange={handleChange}
                                className={selectClass}
                                required
                                disabled={loading}
                            >
                                <option value="analyst">👨‍💼 Analista</option>
                                <option value="manager">👨‍💻 Gerente</option>
                                <option value="admin">⚡ Administrador</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.role === 'analyst' && '• Puede consultar reportes y analizar créditos'}
                                {formData.role === 'manager' && '• Puede gestionar usuarios de su empresa'}
                                {formData.role === 'admin' && '• Acceso completo al sistema'}
                            </p>
                        </div>
                        {formData.role !== 'admin' && (
                            <div>
                                <label htmlFor="companyId" className="block text-sm font-medium text-gray-400 mb-2">
                                    Empresa Asignada <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="companyId"
                                    id="companyId"
                                    value={formData.companyId}
                                    onChange={handleChange}
                                    className={selectClass}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Seleccionar empresa...</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id.toString()}>
                                            {company.name} (NIT: {company.nit})
                                        </option>
                                    ))}
                                </select>
                                {companies.length === 0 && (
                                    <p className="text-xs text-yellow-500 mt-1">
                                        ⚠️ No hay empresas disponibles. Cree una empresa primero.
                                    </p>
                                )}
                            </div>
                        )}
                        {formData.role === 'admin' && (
                            <div className="flex items-center">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 w-full">
                                    <p className="text-blue-400 text-sm">
                                        ℹ️ Los administradores tienen acceso a todas las empresas del sistema
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({
                                fullName: '',
                                nationalIdentifier: '',
                                phone: '',
                                email: '',
                                password: '',
                                role: 'analyst',
                                companyId: ''
                            });
                            setError(null);
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                        Limpiar Formulario
                    </button>
                    <button
                        type="submit"
                        disabled={loading || (formData.role !== 'admin' && companies.length === 0)}
                        className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <SpinnerIcon className="h-4 w-4" />
                                Creando Usuario...
                            </>
                        ) : (
                            <>
                                <UserPlusIcon className="h-4 w-4" />
                                Crear Usuario
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
