import React from 'react';
import { LogoIcon } from '../Icons';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <LogoIcon className="h-14 w-14 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white mt-4">{title}</h1>
          <p className="text-gray-400 text-sm">en la Plataforma de Gestion de Historial Crediticio.</p>
        </div>
        <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};
