
import React from 'react';
import { SearchIcon, SpinnerIcon } from './Icons';

interface SearchClientProps {
  identifier: string;
  setIdentifier: (id: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const SearchClient: React.FC<SearchClientProps> = ({ identifier, setIdentifier, onSearch, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="national-id" className="block text-sm font-medium text-gray-400">
        Buscar por Identificador Nacional
      </label>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          type="text"
          id="national-id"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="ej: 123456789"
          className="w-full flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center w-full sm:w-auto px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
        >
          {isLoading ? (
            <SpinnerIcon className="h-5 w-5" />
          ) : (
            <SearchIcon className="h-5 w-5 mr-2" />
          )}
          <span>{isLoading ? 'Buscando...' : 'Buscar'}</span>
        </button>
      </div>
    </form>
  );
};