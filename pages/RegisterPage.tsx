import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SpinnerIcon, EyeIcon, EyeSlashIcon } from '../components/Icons';
import { PasswordStrength } from '../components/auth/PasswordStrength';
import { authService } from '../services/authService';
import type { UserRegistrationData } from '../types';

interface RegisterPageProps {
    onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState<UserRegistrationData & { confirmPassword: string }>({
        fullName: '',
        nationalIdentifier: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register, error: apiError, clearError } = useAuth();
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        // Limpiar errores cuando el componente se monta
        return () => {
            clearError();
        };
    }, [clearError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError(null);
        clearError();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setFormError('Las contraseñas no coinciden.');
            return;
        }

        const passwordValidation = authService.validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            setFormError(passwordValidation.message || 'La contraseña no cumple los requisitos.');
            return;
        }

        setIsSubmitting(true);
        setFormError(null);
        clearError();

        try {
            const { password, confirmPassword, ...registrationData } = formData;
            await register({ ...registrationData, password });
            // La redirección es manejada por el componente App
        } catch (err) {
            // El error de la API se gestiona a través del hook useAuth
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full pl-3 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow";
    const finalError = formError || apiError;

    return (
        <AuthLayout title="Crear una Cuenta">
            <form onSubmit={handleSubmit} className="space-y-4">
                 {finalError && (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm" role="alert">
                    {finalError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fullName" className="block text-xs font-medium text-gray-400 mb-1">Nombre Completo</label>
                        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="nationalIdentifier" className="block text-xs font-medium text-gray-400 mb-1">Cédula</label>
                        <input type="text" id="nationalIdentifier" name="nationalIdentifier" value={formData.nationalIdentifier} onChange={handleChange} className={inputClass} required />
                    </div>
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-400 mb-1">Celular</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} required />
                </div>
                 <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1">Correo Electrónico</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
                </div>
                
                <div className="relative">
                    <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1">Contraseña</label>
                    <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} required />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute bottom-0 right-0 flex items-center px-3 py-2 text-gray-400 hover:text-white">
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>

                <PasswordStrength password={formData.password} />

                 <div className="relative">
                    <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-400 mb-1">Confirmar Contraseña</label>
                    <input type={showPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} required />
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors">
                        {isSubmitting ? <SpinnerIcon className="h-5 w-5" /> : 'Registrarse'}
                    </button>
                </div>
                <div className="text-center">
                    <button type="button" onClick={onSwitchToLogin} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                        ¿Ya tienes una cuenta? Inicia Sesión
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};
