import React from 'react';
import type { User } from '../types';
import { CogIcon, DocumentSearchIcon, LogoIcon, LogoutIcon, MenuIcon, PresentationChartBarIcon, UserGroupIcon, UserIcon, XMarkIcon } from './Icons';

type NavItemProps = {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
};

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick, isCollapsed = false }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg transition-colors duration-200 group relative ${isActive
        ? 'bg-cyan-500/20 text-cyan-300'
        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
        }`}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={`h-6 w-6 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
      {!isCollapsed && <span className="font-semibold">{label}</span>}

      {/* Tooltip para modo colapsado */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
          {label}
        </div>
      )}
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
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
};

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  setIsOpen,
  user,
  onLogout,
  isCollapsed,
  setIsCollapsed,
}) => {
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


  return (
    <>
      {/* Overlay para mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 bg-gray-800 border-r border-gray-700
        w-72 ${isCollapsed ? 'w-20' : 'w-72'}
        transition-all duration-300 ease-in-out
        translate-x-0 shadow-xl
      `}>
        <div className={`h-full flex flex-col justify-between transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <div>
            <div className="flex items-center justify-between p-2 mb-6">
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                <LogoIcon className="h-10 w-10 text-cyan-400 flex-shrink-0" />
                {!isCollapsed && (
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    Gestion de Historial Crediticio
                  </h1>
                )}
              </div>

              {/* Botón para colapsar en desktop */}
              <button
                className="hidden md:block text-gray-500 hover:text-white transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
              >
                <MenuIcon className="h-5 w-5" />
              </button>

              {/* Botón para cerrar en mobile */}
              <button
                className="md:hidden text-gray-500 hover:text-white"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú de navegación"
              >
                <XMarkIcon className="h-6 w-6" />
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
                    isCollapsed={isCollapsed}
                  />
                ))}
              </ul>
            </nav>
          </div>
          <div className="mt-4">
            {user && (
              <div className={`bg-gray-900/50 rounded-lg mb-2 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-3'}`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                  <UserIcon className={`text-gray-400 bg-gray-700 rounded-full ${isCollapsed ? 'h-8 w-8 p-1.5' : 'h-10 w-10 mr-3 p-2'}`} />
                  {!isCollapsed && (
                    <div>
                      <p className="font-semibold text-white text-sm">{user.fullName}</p>
                      <p className="text-xs text-gray-400">{roleMap[user.role]}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={onLogout}
              className={`w-full flex items-center rounded-lg transition-colors duration-200 text-gray-400 hover:bg-red-500/20 hover:text-red-300 ${isCollapsed ? 'p-2 justify-center' : 'p-3'
                }`}
              title={isCollapsed ? "Cerrar Sesión" : undefined}
            >
              <LogoutIcon className={`h-6 w-6 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && <span className="font-semibold">Cerrar Sesión</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
