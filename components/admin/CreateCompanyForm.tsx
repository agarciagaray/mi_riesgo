import React, { useState } from 'react';

export const CreateCompanyForm: React.FC = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        nit: '',
        companyCode: '',
        address: '',
        phone: '',
        email: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would send this data to a server.
        console.log('Datos de la nueva empresa:', formData);
        alert(`Empresa "${formData.companyName}" creada exitosamente (simulado).`);
        // Reset form after submission
        setFormData({ companyName: '', nit: '', companyCode: '', address: '', phone: '', email: '' });
    };

    const inputClass = "w-full px-3 py-2 bg-gray-900 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all";

    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-6">Registrar Nueva Empresa</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-400 mb-1">Nombre de la Empresa</label>
                        <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className={inputClass} required />
                    </div>
                     <div>
                        <label htmlFor="nit" className="block text-sm font-medium text-gray-400 mb-1">NIT</label>
                        <input type="text" name="nit" id="nit" value={formData.nit} onChange={handleChange} className={inputClass} required />
                    </div>
                 </div>
                 <div>
                    <label htmlFor="companyCode" className="block text-sm font-medium text-gray-400 mb-1">Código de Entidad (TransUnion)</label>
                    <input type="text" name="companyCode" id="companyCode" value={formData.companyCode} onChange={handleChange} className={inputClass} required pattern="\d+" title="Solo se admiten números" placeholder="ej: 101" />
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-400 mb-1">Dirección Principal</label>
                    <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={inputClass} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">Teléfono de Contacto</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} required />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors">
                        Crear Empresa
                    </button>
                </div>
            </form>
        </div>
    );
};
