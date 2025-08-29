import React, { useEffect, useState } from 'react';
import { XMarkIcon } from './Icons';

interface LegalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documentPath: string;
}

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  isOpen,
  onClose,
  title,
  documentPath
}) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && documentPath) {
      loadDocument();
    }
  }, [isOpen, documentPath]);

  const loadDocument = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(documentPath);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo cargar el documento`);
      }
      const text = await response.text();
      setContent(text);
    } catch (err) {
      console.error('Error cargando documento:', err);
      setError('Error al cargar el documento. Por favor, inténtelo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para convertir markdown básico a HTML
  const formatMarkdownToHTML = (markdown: string): string => {
    return markdown
      // Títulos
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-white mb-6 pb-2 border-b border-gray-700">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-cyan-300 mb-4 mt-8">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium text-white mb-3 mt-6">$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-medium text-gray-200 mb-2 mt-4">$1</h4>')
      
      // Enlaces
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-400 hover:text-cyan-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Texto en negrita
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      
      // Texto en cursiva
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
      
      // Código inline
      .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-cyan-300 px-2 py-1 rounded font-mono text-sm">$1</code>')
      
      // Listas con viñetas
      .replace(/^- (.*)$/gm, '<li class="text-gray-300 mb-1">• $1</li>')
      
      // Párrafos (líneas que no son títulos ni listas)
      .replace(/^(?!<[h|l])(.+)$/gm, '<p class="text-gray-300 mb-4 leading-relaxed">$1</p>')
      
      // Líneas horizontales
      .replace(/^---$/gm, '<hr class="border-gray-700 my-8" />')
      
      // Saltos de línea dobles
      .replace(/\n\n/g, '\n');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Cerrar documento"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <span className="ml-3 text-gray-400">Cargando documento...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-300">{error}</p>
              <button
                onClick={loadDocument}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {content && !isLoading && !error && (
            <div className="prose prose-invert max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: formatMarkdownToHTML(content) }}
                className="text-gray-300 leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <p className="text-sm text-gray-500">
            Documento actualizado: {new Date().toLocaleDateString('es-ES')}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              📄 Imprimir
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};