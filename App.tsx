import React, { useState } from 'react';
import { Footer } from './components/Footer';
import { MenuIcon, SpinnerIcon } from './components/Icons';
import { Navigation } from './components/Navigation';
import { ThemeProvider } from './components/theme-provider';
import { useAuth } from './contexts/AuthContext';
import { AdminPage } from './pages/AdminPage';
import { ClientManagementPage } from './pages/ClientManagementPage';
import DashboardPage from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ReportConsultationPage } from './pages/ReportConsultationPage';

type PageState = {
  page: 'dashboard' | 'clientes' | 'consulta' | 'admin';
  params?: Record<string, any>;
}

// El layout principal de la aplicación, una vez que el usuario está autenticado.
const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageState>({ page: 'dashboard' });
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
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
    <div className="bg-background text-foreground min-h-screen font-sans transition-colors">
      <Navigation
        currentPage={currentPage.page}
        onNavigate={(page) => {
          setCurrentPage({ page: page as PageState['page'] });
          setIsNavOpen(false);
        }}
        isOpen={isNavOpen}
        setIsOpen={setIsNavOpen}
        isCollapsed={isNavCollapsed}
        setIsCollapsed={setIsNavCollapsed}
        user={user}
        onLogout={logout}
      />
      <div className={`transition-all duration-300 ${isNavCollapsed ? 'ml-20' : 'ml-72'}`}>
        <header className="flex items-center justify-between p-4 border-b border-border md:hidden">
          <span className="font-semibold text-foreground">{user?.fullName}</span>
          <button
            className="p-2 rounded-md text-muted-foreground hover:bg-accent"
            onClick={() => setIsNavOpen(true)}
            aria-label="Open navigation"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>

        <Footer />
      </div>
    </div>
  );
};

const SplashScreen: React.FC = () => (
  <div className="bg-background text-foreground min-h-screen flex flex-col items-center justify-center transition-colors">
    <SpinnerIcon className="h-16 w-16 text-primary" />
    <p className="mt-4 text-lg text-muted-foreground">Cargando Plataforma...</p>
  </div>
);


export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="miriesgo-ui-theme">
        <SplashScreen />
      </ThemeProvider>
    );
  }

  if (isAuthenticated) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="miriesgo-ui-theme">
        <MainLayout />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="miriesgo-ui-theme">
      {view === 'login'
        ? <LoginPage onSwitchToRegister={() => setView('register')} />
        : <RegisterPage onSwitchToLogin={() => setView('login')} />}
    </ThemeProvider>
  );
}
