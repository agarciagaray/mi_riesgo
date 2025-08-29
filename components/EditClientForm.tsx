import React, { useState } from 'react';
import type { Client } from '../types';

export interface ClientUpdateData {
    fullName: string;
    address: string;
    phone: string;
    email: string;
    flags: string[];
}

interface EditClientFormProps {
  client: Client;
  onSave: (updatedData: ClientUpdateData) => void;
  onCancel: () => void;
}

const ALL_FLAGS = ['Fraude', 'Robo de identidad', 'Estafa'];

export const EditClientForm: React.FC<EditClientFormProps> = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ClientUpdateData>({
    fullName: client.fullName,
    address: client.addresses[0]?.value || '',
    phone: client.phones[0]?.value || '',
    email: client.emails[0]?.value || '',
    flags: client.flags || []
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const currentFlags = formData.flags || [];
    if (checked) {
      setFormData(prev => ({ ...prev, flags: [...currentFlags, value] }));
    } else {
      setFormData(prev => ({ ...prev, flags: currentFlags.filter(flag => flag !== value) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow";
  const readOnlyInputClass = `${inputClass} bg-gray-800/50 cursor-not-allowed`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div>
        <label htmlFor="nationalIdentifier" className="block text-sm font-medium text-gray-400 mb-1">Identificador Nacional (No se puede modificar)</label>
        <input type="text" name="nationalIdentifier" id="nationalIdentifier" value={client.nationalIdentifier} className={readOnlyInputClass} readOnly />
      </div>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-400 mb-1">Dirección</label>
        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={inputClass} />
      </div>
       <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
        <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
      </div>
       <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} />
      </div>
      
      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">Indicadores de Riesgo</label>
        <div className="space-y-2">
            {ALL_FLAGS.map((flag, index) => (
                <label key={`edit-flag-${index}-${flag}`} className="flex items-center space-x-3 text-gray-300">
                    <input
                        type="checkbox"
                        value={flag}
                        checked={formData.flags?.includes(flag)}
                        onChange={handleFlagChange}
                        className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>{flag}</span>
                </label>
            ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors">
          Guardar Cambios
        </button>
      </div>
    </form>
  );
};