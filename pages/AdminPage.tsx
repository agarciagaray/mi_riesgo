import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BuildingOfficeIcon, UserPlusIcon, ArrowUpTrayIcon } from '../components/Icons';
import { CreateCompanyForm } from '../components/admin/CreateCompanyForm';
import { CreateUserForm } from '../components/admin/CreateUserForm';
import { FileUpload } from '../components/admin/FileUpload';

type AdminSection = 'company' | 'user' | 'upload';

const AdminPage: React.FC = () => {
    const { user } = useAuth();

    // Define all possible sections
    const allSections: { id: AdminSection; label: string; icon: React.FC<any> }[] = [
        { id: 'company', label: 'Crear Empresa', icon: BuildingOfficeIcon },
        { id: 'user', label: 'Crear Usuario', icon: UserPlusIcon },
        { id: 'upload', label: 'Cargar Archivo', icon: ArrowUpTrayIcon },
    ];

    // Filter sections based on user role
    const sections = user?.role === 'admin' 
        ? allSections
        : allSections.filter(s => s.id === 'upload');
    
    // Set initial state based on available sections
    const [activeSection, setActiveSection] = useState<AdminSection>(sections[0]?.id || 'upload');

    const renderSection = () => {
        switch (activeSection) {
            case 'company':
                // Double-check permission before rendering
                return user?.role === 'admin' ? <CreateCompanyForm /> : null;
            case 'user':
                return user?.role === 'admin' ? <CreateUserForm /> : null;
            case 'upload':
                return <FileUpload />;
            default:
                return <p className="text-gray-400">Seleccione una opción.</p>;
        }
    };
    
    // Show navigation only if there is more than one option (for admins)
    const showNav = sections.length > 1;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <CogIcon className="h-8 w-8 text-cyan-400"/>
                <h1 className="text-3xl font-bold text-white">Administración</h1>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-8">
                {/* Secondary Navigation for Admins */}
                {showNav && (
                    <div className="md:w-1/4">
                        <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 mb-6 md:mb-0">
                            {sections.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveSection(id)}
                                    className={`flex items-center p-3 text-sm font-medium rounded-lg transition-colors w-full text-left ${
                                        activeSection === id
                                            ? 'bg-cyan-500/20 text-cyan-300'
                                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                    }`}
                                >
                                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                                    <span className="flex-grow">{label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                )}
                
                {/* Content Area */}
                <div className={showNav ? "md:w-3/4" : "w-full"}>
                    <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
                        {renderSection()}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add CogIcon here as it was removed from the main component but used here.
const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0H3m18 0h-1.5m-15 0H3m18 0h-1.5M12 4.5v-1.5m0 15v1.5m0-15a7.5 7.5 0 0 1 7.5 7.5m-7.5-7.5a7.5 7.5 0 0 0-7.5 7.5m7.5-7.5v-1.5m0 15v1.5m0-15a7.5 7.5 0 0 1 7.5 7.5m-7.5-7.5a7.5 7.5 0 0 0-7.5 7.5" /></svg>;

export { AdminPage };