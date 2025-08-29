import React, { useState } from 'react';
import { ArrowUpTrayIcon, BuildingOffice2Icon, BuildingOfficeIcon, CogIcon, UserGroupIcon, UserPlusIcon } from '../components/Icons';
import { CompanyDetailsModal } from '../components/admin/CompanyDetailsModal';
import { CompanyManagement } from '../components/admin/CompanyManagement';
import { CreateCompanyForm } from '../components/admin/CreateCompanyForm';
import { CreateUserForm } from '../components/admin/CreateUserForm';
import { EditCompanyModal } from '../components/admin/EditCompanyModal';
import { EditUserModal } from '../components/admin/EditUserModal';
import { FileUpload } from '../components/admin/FileUpload';
import { UserDetailsModal } from '../components/admin/UserDetailsModal';
import { UserManagement } from '../components/admin/UserManagement';
import { useAuth } from '../contexts/AuthContext';
import { Company, User } from '../types';

type AdminSection = 'companies' | 'users' | 'upload';
type CompanyTab = 'management' | 'create';
type UserTab = 'management' | 'create';

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  // Estados para gestión de empresas
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados para gestión de usuarios
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [refreshUserKey, setRefreshUserKey] = useState(0);

  // Define all possible sections
  const allSections: { id: AdminSection; label: string; icon: React.FC<any> }[] = [
    { id: 'companies', label: 'Gestión de Empresas', icon: BuildingOffice2Icon },
    { id: 'users', label: 'Gestión de Usuarios', icon: UserGroupIcon },
    { id: 'upload', label: 'Cargar Archivo', icon: ArrowUpTrayIcon },
  ];

  // Filter sections based on user role
  const sections = user?.role === 'admin'
    ? allSections
    : allSections.filter(s => s.id === 'upload');

  // Set initial state based on available sections
  const initialSection = sections[0]?.id || 'upload';
  
  // Update activeSection if current section is not available for user role
  React.useEffect(() => {
    if (!sections.find(s => s.id === activeSection)) {
      setActiveSection(initialSection);
    }
  }, [user?.role]);

  // Estados para navegación principal y pestañas
  const [activeSection, setActiveSection] = useState<AdminSection>('companies');
  const [activeCompanyTab, setActiveCompanyTab] = useState<CompanyTab>('management');
  const [activeUserTab, setActiveUserTab] = useState<UserTab>('management');

  // Funciones para manejo de empresas
  const handleViewCompanyDetails = (company: Company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleCompanyUpdated = (updatedCompany: Company) => {
    // Forzar actualización del listado
    setRefreshKey(prev => prev + 1);
  };

  // Funciones para manejo de usuarios
  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleUserUpdated = (updatedUser: User) => {
    // Forzar actualización del listado
    setRefreshUserKey(prev => prev + 1);
  };

  const handleCloseModals = () => {
    setSelectedCompany(null);
    setShowDetailsModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    setShowUserDetailsModal(false);
    setShowEditUserModal(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'companies':
        return user?.role === 'admin' ? renderCompanySection() : null;
      case 'users':
        return user?.role === 'admin' ? renderUserSection() : null;
      case 'upload':
        return <FileUpload />;
      default:
        return <p className="text-gray-400">Seleccione una opción.</p>;
    }
  };

  const renderCompanySection = () => {
    return (
      <div className="space-y-6">
        {/* Pestañas de Empresas */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveCompanyTab('management')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeCompanyTab === 'management'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <BuildingOffice2Icon className="h-5 w-5 inline mr-2" />
              Gestionar Empresas
            </button>
            <button
              onClick={() => setActiveCompanyTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeCompanyTab === 'create'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <BuildingOfficeIcon className="h-5 w-5 inline mr-2" />
              Crear Empresa
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas de empresas */}
        <div className="pt-4">
          {activeCompanyTab === 'management' ? (
            <CompanyManagement 
              key={refreshKey}
              onViewDetails={handleViewCompanyDetails}
              onEditCompany={handleEditCompany}
            />
          ) : (
            <CreateCompanyForm />
          )}
        </div>
      </div>
    );
  };

  const renderUserSection = () => {
    return (
      <div className="space-y-6">
        {/* Pestañas de Usuarios */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveUserTab('management')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeUserTab === 'management'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <UserGroupIcon className="h-5 w-5 inline mr-2" />
              Gestionar Usuarios
            </button>
            <button
              onClick={() => setActiveUserTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeUserTab === 'create'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <UserPlusIcon className="h-5 w-5 inline mr-2" />
              Crear Usuario
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas de usuarios */}
        <div className="pt-4">
          {activeUserTab === 'management' ? (
            <UserManagement 
              key={refreshUserKey}
              onViewDetails={handleViewUserDetails}
              onEditUser={handleEditUser}
            />
          ) : (
            <CreateUserForm />
          )}
        </div>
      </div>
    );
  };

  // Show navigation only if there is more than one option (for admins)
  const showNav = sections.length > 1;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center space-x-4 pb-4 border-b border-gray-700">
        <CogIcon className="h-8 w-8 text-cyan-400" />
        <h1 className="text-3xl font-bold text-white">Administración</h1>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Secondary Navigation for Admins */}
        {showNav && (
          <div className="w-full">
            <nav className="flex flex-wrap gap-4">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 hover:shadow-lg min-w-[200px] ${activeSection === id
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-cyan-900/50 shadow-lg'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`}
                >
                  <Icon className="h-6 w-6 mr-4 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Content Area */}
        <div className="w-full">
          <div className="bg-gray-800/50 p-8 rounded-xl shadow-lg border border-gray-700/50">
            {renderSection()}
          </div>
        </div>
      </div>

      {/* Modales para gestión de empresas */}
      <CompanyDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
        company={selectedCompany}
      />
      
      <EditCompanyModal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        company={selectedCompany}
        onCompanyUpdated={handleCompanyUpdated}
      />

      {/* Modales para gestión de usuarios */}
      <UserDetailsModal
        isOpen={showUserDetailsModal}
        onClose={handleCloseModals}
        user={selectedUser}
      />
      
      <EditUserModal
        isOpen={showEditUserModal}
        onClose={handleCloseModals}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};

export { AdminPage };
