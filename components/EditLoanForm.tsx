
import React, { useState } from 'react';
import type { Loan } from '../types';
import { CreditStatus } from '../types';

interface EditLoanFormProps {
  loan: Loan;
  onSave: (updatedLoan: Loan) => void;
  onCancel: () => void;
}

export const EditLoanForm: React.FC<EditLoanFormProps> = ({ loan, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Loan>(loan);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'currentBalance' ? parseFloat(value) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const inputClass = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div>
        <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-400 mb-1">Saldo Actual</label>
        <input 
          type="number" 
          name="currentBalance" 
          id="currentBalance" 
          value={formData.currentBalance} 
          onChange={handleChange} 
          className={inputClass}
          step="0.01"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-1">Estado del Crédito</label>
        <select
          name="status"
          id="status"
          value={formData.status}
          onChange={handleChange}
          className={inputClass}
        >
          {Object.values(CreditStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
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
