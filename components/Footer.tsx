import React, { useState } from 'react';
import { LegalDocumentModal } from './LegalDocumentModal';

interface LegalDocument {
  id: string;
  title: string;
  path: string;
}

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const legalDocuments: LegalDocument[] = [
    {
      id: 'terms',
      title: 'Términos y Condiciones de Uso',
      path: '/TERMINOS_Y_CONDICIONES.md'
    },
    {
      id: 'privacy',
      title: 'Política de Privacidad y Protección de Datos',
      path: '/POLITICA_PRIVACIDAD.md'
    },
    {
      id: 'cookies',
      title: 'Política de Cookies',
      path: '/POLITICA_COOKIES.md'
    },
    {
      id: 'about',
      title: 'Acerca de MIRIESGO v2',
      path: '/DOCUMENTO_EXPLICATIVO_MIRIESGO.md'
    }
  ];

  const openDocument = (documentId: string) => {
    setActiveModal(documentId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const activeDocument = legalDocuments.find(doc => doc.id === activeModal);

  return (
    <>
      <footer className="border-t border-gray-800 shrink-0 bg-gray-900/50">
        <div className="px-8 py-6">
          {/* Main Footer Content */}
          <div className="text-center mb-4">
            <p className="text-gray-500 text-sm mb-2">
              &copy; {new Date().getFullYear()} <a href="https://www.igdsas.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Ingeniería, Gestión y Desarrollo S.A.S.</a> (IGD S.A.S.) - Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-sm mb-2">
              Plataforma <a href="https://www.miriesgo.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">MIRIESGO v2</a> - Gestión de Historial Crediticio
            </p>
            <p className="text-gray-600 text-xs">
              Desarrollado por <span className="text-gray-400 font-medium">Alejandro García Garay</span> | Datos proporcionados únicamente con fines de evaluación.
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-1 text-xs">
            {legalDocuments.map((document, index) => (
              <React.Fragment key={document.id}>
                <button
                  onClick={() => openDocument(document.id)}
                  className="text-gray-500 hover:text-cyan-400 transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-800/50"
                >
                  {document.title}
                </button>
                {index < legalDocuments.length - 1 && (
                  <span className="text-gray-700 mx-1">•</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Additional Info */}
          <div className="text-center mt-4 pt-4 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Sistema Activo</span>
              </div>
              <div className="hidden sm:block">•</div>
              {/* <span>MIRIESGO v2.0</span> */}
              <div className="hidden sm:block">•</div>
              <span>Powered by IA - Google Gemini</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal for displaying legal documents */}
      {activeDocument && (
        <LegalDocumentModal
          isOpen={!!activeModal}
          onClose={closeModal}
          title={activeDocument.title}
          documentPath={activeDocument.path}
        />
      )}
    </>
  );
};