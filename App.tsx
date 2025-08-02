import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { ReportConsultationPage } from './pages/ReportConsultationPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientManagementPage } from './pages/ClientManagementPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MenuIcon, SpinnerIcon } from './components/Icons';

type PageState = {
  page: 'dashboard' | 'clientes' | 'consulta' | 'admin';
  params?: Record<string, any>;
}

// El layout principal de la aplicación, una vez que el usuario está autenticado.
const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageState>({ page: 'dashboard' });
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { user, logout } = useAuth();

  const renderPage = () => {
    switch (currentPage.page) {
      case 'dashboard':
        return <DashboardPage />;
      case 'clientes':
        return <ClientManagementPage 
          onViewClient={(clientId) => setCurrentPage({ page: 'consulta', params: { clientId } })}
        />;
      case 'consulta':
        return <ReportConsultationPage 
          clientIdToShow={currentPage.params?.clientId}
          onBack={() => setCurrentPage({ page: 'clientes' })}
        />;
      case 'admin':
        return <AdminPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans flex">
      <Navigation
        currentPage={currentPage.page}
        onNavigate={(page) => {
          setCurrentPage({ page: page as PageState['page'] });
          setIsNavOpen(false);
        }}
        isOpen={isNavOpen}
        setIsOpen={setIsNavOpen}
        user={user}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col w-full md:w-auto">
         <header className="flex items-center justify-between p-4 border-b border-gray-800 md:hidden">
            <span className="font-semibold text-white">{user?.fullName}</span>
            <button
              className="p-2 rounded-md text-gray-400 hover:bg-gray-700"
              onClick={() => setIsNavOpen(true)}
              aria-label="Open navigation"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderPage()}
        </main>
        
        <footer className="text-center py-4 px-8 text-gray-500 text-sm border-t border-gray-800 shrink-0">
          <p>&copy; {new Date().getFullYear()} Plataforma de Inteligencia Crediticia. Todos los derechos reservados.</p>
          <p className="hidden sm:block">Datos proporcionados únicamente con fines de evaluación.</p>
        </footer>
      </div>
    </div>
  );
};

const SplashScreen: React.FC = () => (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col items-center justify-center">
        <SpinnerIcon className="h-16 w-16 text-cyan-400" />
        <p className="mt-4 text-lg text-gray-400">Cargando Plataforma...</p>
    </div>
);


export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return <SplashScreen />;
  }
  
  if (isAuthenticated) {
    return <MainLayout />;
  }

  return view === 'login' 
    ? <LoginPage onSwitchToRegister={() => setView('register')} /> 
    : <RegisterPage onSwitchToLogin={() => setView('login')} />;
}
