import React, { useEffect, useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { EyeIcon, EyeSlashIcon, SpinnerIcon } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
    onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, error, clearError } = useAuth();

    useEffect(() => {
        // Limpiar errores cuando el componente se monta o los inputs cambian
        return () => {
            clearError();
        };
    }, [clearError]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearError();
        try {
            await login(email, password);
            // El contexto AuthContext se encargará de actualizar el estado de autenticación
            // y App.tsx redireccionará automáticamente al MainLayout
            console.log('🔓 Login exitoso, redirigiendo...');
        } catch (err) {
            // El error se muestra a través del hook useAuth
            console.error('🔓 Error en login:', err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const inputClass = "w-full pl-3 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow";

    return (
        <AuthLayout title="Iniciar Sesión">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm" role="alert">
                    {error}
                  </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        placeholder="usuario@dominio.com"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                        Contraseña
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClass}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                        {isSubmitting ? <SpinnerIcon className="h-5 w-5" /> : 'Ingresar'}
                    </button>
                </div>
                <div className="text-center">
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    >
                        ¿No tienes una cuenta? Regístrate
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};
