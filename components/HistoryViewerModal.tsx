import React from 'react';
import { Modal } from './Modal';
import type { HistoricEntry } from '../types';

interface HistoryViewerModalProps {
  title: string;
  history: HistoricEntry<string>[];
  onClose: () => void;
}

export const HistoryViewerModal: React.FC<HistoryViewerModalProps> = ({ title, history, onClose }) => {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-3">
        {history.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {history.map((entry, index) => (
              <li key={index} className={`py-3 ${index === 0 ? 'opacity-100' : 'opacity-70'}`}>
                <p className={`text-sm font-medium ${index === 0 ? 'text-white' : 'text-gray-300'}`}>{entry.value}</p>
                <p className="text-xs text-gray-400">
                  {index === 0 ? 'Actualizado el: ' : 'Registrado el: '} 
                  {new Date(entry.dateModified).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center py-4">No hay historial disponible.</p>
        )}
      </div>
    </Modal>
  );
};
