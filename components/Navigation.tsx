import React from 'react';
import type { User } from '../types';
import { CogIcon, DocumentSearchIcon, LogoIcon, LogoutIcon, PresentationChartBarIcon, UserGroupIcon, UserIcon, XMarkIcon } from './Icons';

type NavItemProps = {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-cyan-500/20 text-cyan-300'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
      }`}
    >
      <Icon className="h-6 w-6 mr-3" />
      <span className="font-semibold">{label}</span>
    </a>
  </li>
);

type NavigationProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User | null;
  onLogout: () => void;
};

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, isOpen, setIsOpen, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: PresentationChartBarIcon },
    { id: 'clientes', label: 'Gestión de Clientes', icon: UserGroupIcon },
    { id: 'consulta', label: 'Consulta de Reporte', icon: DocumentSearchIcon },
    { id: 'admin', label: 'Administración', icon: CogIcon },
  ];
  
  const roleMap = {
    'admin': 'Administrador',
    'manager': 'Gerente',
    'analyst': 'Analista'
  };

  const navContent = (
    <div className="bg-gray-800 min-h-screen h-full flex flex-col justify-between p-4">
      <div>
        <div className="flex items-center justify-between p-2 mb-6">
          <div className="flex items-center space-x-3">
              <LogoIcon className="h-10 w-10 text-cyan-400" />
              <h1 className="text-xl font-bold text-white tracking-tight">
                  Inteligencia Crediticia
              </h1>
          </div>
          <button
              className="md:hidden text-gray-500 hover:text-white"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar menú de navegación"
          >
              <XMarkIcon className="h-6 w-6"/>
          </button>
        </div>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={currentPage === item.id}
                onClick={() => onNavigate(item.id)}
              />
            ))}
          </ul>
        </nav>
      </div>
      <div className="mt-4">
         {user && (
            <div className="p-3 bg-gray-900/50 rounded-lg mb-2">
                <div className="flex items-center">
                    <UserIcon className="h-10 w-10 text-gray-400 mr-3 p-2 bg-gray-700 rounded-full"/>
                    <div>
                        <p className="font-semibold text-white text-sm">{user.fullName}</p>
                        <p className="text-xs text-gray-400">{roleMap[user.role]}</p>
                    </div>
                </div>
            </div>
         )}
         <button
            onClick={onLogout}
            className="w-full flex items-center p-3 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-red-500/20 hover:text-red-300"
         >
            <LogoutIcon className="h-6 w-6 mr-3"/>
            <span className="font-semibold">Cerrar Sesión</span>
         </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 w-72 min-h-screen h-full z-40 transform transition-transform md:relative md:translate-x-0 md:flex-shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {navContent}
      </aside>
    </>
  );
};
