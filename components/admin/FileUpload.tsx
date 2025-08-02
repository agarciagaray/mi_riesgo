import React, { useState, useCallback } from 'react';
import { ArrowUpTrayIcon, SpinnerIcon } from '../Icons';
import { creditService } from '../../services/creditService';
import type { ProcessResult } from '../../types';

export const FileUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ProcessResult | null>(null);

    const handleFileChange = (selectedFile: File | null) => {
        setFile(selectedFile);
        setResult(null); // Reset previous results
        if (selectedFile) {
            console.log("Archivo seleccionado:", selectedFile.name);
        }
    };

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, []);
    
    const handleProcessFile = async () => {
        if (!file) {
            alert("Por favor, seleccione un archivo primero.");
            return;
        }
        setIsProcessing(true);
        setResult(null);
        
        try {
            const processResult = await creditService.uploadFile(file);
            setResult(processResult);
        } catch (error: any) {
             setResult({
                status: 'error',
                message: error.message || "Error inesperado al subir el archivo.",
                fileName: file.name,
                totalRecords: 0,
                processedRecords: 0,
                newClients: 0,
                newLoans: 0,
                updatedLoans: 0,
                errors: [error.message]
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const ResultDisplay = () => {
        if (!result) return null;
        
        const isError = result.status === 'error';
        const bgColor = isError ? 'bg-red-900/40 border-red-700' : 'bg-green-900/40 border-green-700';
        const textColor = isError ? 'text-red-300' : 'text-green-300';
        
        return (
            <div className={`p-4 mt-6 border rounded-lg ${bgColor}`}>
                <h3 className={`text-lg font-semibold ${textColor}`}>{isError ? 'Error en el Procesamiento' : 'Procesamiento Completado'}</h3>
                <p className="text-sm text-gray-300 mt-1">{result.message}</p>
                {!isError && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-center">
                        <div><p className="text-xs text-gray-400">Registros Totales</p><p className="text-xl font-bold text-white">{result.totalRecords}</p></div>
                        <div><p className="text-xs text-gray-400">Clientes Nuevos</p><p className="text-xl font-bold text-cyan-400">{result.newClients}</p></div>
                        <div><p className="text-xs text-gray-400">Créditos Nuevos</p><p className="text-xl font-bold text-green-400">{result.newLoans}</p></div>
                        <div><p className="text-xs text-gray-400">Créditos Actualizados</p><p className="text-xl font-bold text-yellow-400">{result.updatedLoans}</p></div>
                    </div>
                )}
                {result.errors && result.errors.length > 0 && (
                     <div className="mt-4">
                        <p className="text-sm font-semibold text-yellow-300">Detalles de errores:</p>
                        <ul className="list-disc list-inside text-xs text-yellow-400/80 max-h-40 overflow-y-auto mt-1">
                           {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                     </div>
                )}
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-6">Carga de Archivo Plano</h2>
            <div className="space-y-6">
                <div 
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300
                        ${isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500'}`
                    }
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <label htmlFor="file-upload" className="relative cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-cyan-400 hover:text-cyan-300">
                           Seleccione un archivo
                        </span>
                        <span className="mt-1 block text-xs text-gray-400">o arrástrelo aquí</span>
                    </label>
                    <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                        accept=".txt"
                    />
                </div>

                {file && !isProcessing && (
                    <div className="text-center text-sm text-gray-300">
                        <p>Archivo seleccionado: <span className="font-semibold text-white">{file.name}</span></p>
                    </div>
                )}
                
                 {isProcessing && (
                    <div className="flex items-center justify-center space-x-3 text-cyan-300">
                        <SpinnerIcon className="h-5 w-5" />
                        <p className="text-sm font-medium">Procesando archivo en el servidor...</p>
                    </div>
                )}

                <div className="bg-gray-700/50 p-4 rounded-md text-sm text-gray-400">
                    <p className="font-semibold text-gray-300 mb-1">Instrucciones:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>El archivo debe ser de texto plano (`.txt`) con formato de ancho fijo.</li>
                        <li>Debe seguir la estructura definida en el Manual Funcional de Sector Real.</li>
                        <li>El primer registro debe ser de control (Tipo 1) y los siguientes de detalle (Tipo 2).</li>
                    </ul>
                </div>
                
                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleProcessFile}
                        disabled={!file || isProcessing}
                        className="flex items-center justify-center w-40 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                    >
                        {isProcessing ? <SpinnerIcon className="h-5 w-5"/> : 'Procesar Archivo'}
                    </button>
                </div>

                <ResultDisplay />
            </div>
        </div>
    );
};
