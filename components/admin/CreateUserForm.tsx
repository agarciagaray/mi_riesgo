import React, { useState } from 'react';

export const CreateUserForm: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: 'analyst'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would be sent to a server.
        console.log('Datos del nuevo usuario:', formData);
        alert(`Usuario "${formData.fullName}" creado con el rol de ${formData.role} (simulado).`);
        // Reset form
        setFormData({ fullName: '', email: '', role: 'analyst' });
    };

    const inputClass = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow";

    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-6">Crear Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
                    <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">Rol del Usuario</label>
                    <select name="role" id="role" value={formData.role} onChange={handleChange} className={inputClass}>
                        <option value="analyst">Analista</option>
                        <option value="manager">Gerente</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors">
                        Crear Usuario
                    </button>
                </div>
            </form>
        </div>
    );
};
