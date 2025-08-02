import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../Icons';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPrev, onNext }) => {
    return (
        <div className="flex items-center justify-between text-sm">
            <button
                onClick={onPrev}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
            >
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                Anterior
            </button>
            <span className="font-medium text-gray-400">
                Página <span className="text-white">{currentPage}</span> de <span className="text-white">{totalPages}</span>
            </span>
            <button
                onClick={onNext}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
            >
                Siguiente
                <ChevronRightIcon className="h-4 w-4 ml-2" />
            </button>
        </div>
    );
};
