import type { ClientUpdateData } from '../components/EditClientForm';
import type { Client, Company, CreditReport, Loan, ProcessResult, User } from '../types';
import { CreditStatus, PaymentModality, PaymentStatus } from '../types';

// Datos mock para empresas
const mockCompanies: Company[] = [
    {
        id: 1,
        name: "Financiera Credimart S.A.S.",
        nit: "900123456-1",
        code: "101"
    },
    {
        id: 2,
        name: "Banco Popular de Colombia",
        nit: "800234567-2",
        code: "102"
    },
    {
        id: 3,
        name: "Cooperativa de Ahorro y Crédito",
        nit: "700345678-3",
        code: "103"
    },
    {
        id: 4,
        name: "MicroCréditos del Valle S.A.",
        nit: "600456789-4",
        code: "104"
    },
    {
        id: 5,
        name: "Créditos y Finanzas Nacionales",
        nit: "500567890-5",
        code: "105"
    }
];

// Datos mock para usuarios
const mockUsers: User[] = [
    {
        id: 1,
        fullName: "María Elena Rodríguez",
        nationalIdentifier: "52123456",
        phone: "+57 300 111 2222",
        email: "maria.rodriguez@credimart.com",
        role: "admin"
    },
    {
        id: 2,
        fullName: "Carlos Andrés Martínez",
        nationalIdentifier: "80234567",
        phone: "+57 301 222 3333",
        email: "carlos.martinez@credimart.com",
        role: "manager",
        companyId: 1
    },
    {
        id: 3,
        fullName: "Ana Lucía Gómez",
        nationalIdentifier: "45345678",
        phone: "+57 302 333 4444",
        email: "ana.gomez@credimart.com",
        role: "analyst",
        companyId: 1
    },
    {
        id: 4,
        fullName: "Jorge Luis Hernández",
        nationalIdentifier: "71456789",
        phone: "+57 303 444 5555",
        email: "jorge.hernandez@bancopopular.com",
        role: "manager",
        companyId: 2
    },
    {
        id: 5,
        fullName: "Diana Carolina Vásquez",
        nationalIdentifier: "39567890",
        phone: "+57 304 555 6666",
        email: "diana.vasquez@bancopopular.com",
        role: "analyst",
        companyId: 2
    },
    {
        id: 6,
        fullName: "Roberto Antonio Peña",
        nationalIdentifier: "86678901",
        phone: "+57 305 666 7777",
        email: "roberto.pena@cooperativa.com",
        role: "analyst",
        companyId: 3
    },
    {
        id: 7,
        fullName: "Laura Isabel Castillo",
        nationalIdentifier: "44789012",
        phone: "+57 306 777 8888",
        email: "laura.castillo@microcreditos.com",
        role: "manager",
        companyId: 4
    },
    {
        id: 8,
        fullName: "Fernando José Morales",
        nationalIdentifier: "92890123",
        phone: "+57 307 888 9999",
        email: "fernando.morales@creditosfinanzas.com",
        role: "analyst",
        companyId: 5
    }
];

// Datos mock para reportes crediticios
const mockCreditReports: { [identifier: string]: CreditReport } = {
    "12345678": {
        client: {
            id: 1,
            companyId: 1,
            fullName: "Ana María García López",
            nationalIdentifier: "12345678",
            birthDate: "1985-03-15",
            emails: [{ value: "ana.garcia@email.com", dateModified: "2024-01-15" }],
            phones: [{ value: "+57 300 123 4567", dateModified: "2024-01-15" }],
            addresses: [{ value: "Calle 123 #45-67, Bogotá, Colombia", dateModified: "2024-01-15" }],
            flags: ["activo"]
        },
        loans: [
            {
                id: 1,
                clientId: 1,
                originationDate: "2023-06-01",
                originalAmount: 5000000,
                modality: PaymentModality.Mensual,
                interestRate: 2.5,
                installments: 12,
                currentBalance: 2500000,
                status: CreditStatus.Vigente,
                lastReportDate: "2024-08-01",
                payments: [
                    {
                        id: 1,
                        loanId: 1,
                        installmentNumber: 1,
                        expectedPaymentDate: "2023-07-01",
                        actualPaymentDate: "2023-07-01",
                        amountPaid: 450000,
                        status: PaymentStatus.Pagado,
                        daysLate: 0
                    },
                    {
                        id: 2,
                        loanId: 1,
                        installmentNumber: 2,
                        expectedPaymentDate: "2023-08-01",
                        actualPaymentDate: "2023-08-01",
                        amountPaid: 450000,
                        status: PaymentStatus.Pagado,
                        daysLate: 0
                    }
                ]
            }
        ],
        debtSummary: {
            totalCredits: 1,
            activeCredits: 1,
            paidCredits: 0,
            totalOriginalAmount: 5000000,
            totalCurrentBalance: 2500000
        }
    },
    "87654321": {
        client: {
            id: 2,
            companyId: 1,
            fullName: "Carlos Eduardo Rodríguez",
            nationalIdentifier: "87654321",
            birthDate: "1978-11-22",
            emails: [{ value: "carlos.rodriguez@email.com", dateModified: "2024-01-15" }],
            phones: [{ value: "+57 310 987 6543", dateModified: "2024-01-15" }],
            addresses: [{ value: "Carrera 45 #12-34, Medellín, Colombia", dateModified: "2024-01-15" }],
            flags: ["moroso"]
        },
        loans: [
            {
                id: 2,
                clientId: 2,
                originationDate: "2023-03-01",
                originalAmount: 8000000,
                modality: PaymentModality.Quincenal,
                interestRate: 3.2,
                installments: 24,
                currentBalance: 6400000,
                status: CreditStatus.EnMora,
                lastReportDate: "2024-08-01",
                payments: [
                    {
                        id: 3,
                        loanId: 2,
                        installmentNumber: 1,
                        expectedPaymentDate: "2023-03-15",
                        actualPaymentDate: "2023-03-15",
                        amountPaid: 380000,
                        status: PaymentStatus.Pagado,
                        daysLate: 0
                    },
                    {
                        id: 4,
                        loanId: 2,
                        installmentNumber: 2,
                        expectedPaymentDate: "2023-04-01",
                        actualPaymentDate: null,
                        amountPaid: null,
                        status: PaymentStatus.EnMora,
                        daysLate: 45
                    }
                ]
            }
        ],
        debtSummary: {
            totalCredits: 1,
            activeCredits: 1,
            paidCredits: 0,
            totalOriginalAmount: 8000000,
            totalCurrentBalance: 6400000
        }
    },
    "987654321": {
        client: {
            id: 6,
            companyId: 1,
            fullName: "Pedro Luis Martínez",
            nationalIdentifier: "987654321",
            birthDate: "1980-05-10",
            emails: [{ value: "pedro.martinez@email.com", dateModified: "2024-01-15" }],
            phones: [{ value: "+57 315 555 7777", dateModified: "2024-01-15" }],
            addresses: [{ value: "Avenida 68 #45-23, Bogotá, Colombia", dateModified: "2024-01-15" }],
            flags: ["Fraude", "Robo de identidad"]
        },
        loans: [
            {
                id: 3,
                clientId: 6,
                originationDate: "2022-12-01",
                originalAmount: 15000000,
                modality: PaymentModality.Mensual,
                interestRate: 4.5,
                installments: 36,
                currentBalance: 12000000,
                status: CreditStatus.Castigado,
                lastReportDate: "2024-08-01",
                payments: [
                    {
                        id: 5,
                        loanId: 3,
                        installmentNumber: 1,
                        expectedPaymentDate: "2023-01-01",
                        actualPaymentDate: "2023-01-15",
                        amountPaid: 520000,
                        status: PaymentStatus.Pagado,
                        daysLate: 14
                    },
                    {
                        id: 6,
                        loanId: 3,
                        installmentNumber: 2,
                        expectedPaymentDate: "2023-02-01",
                        actualPaymentDate: null,
                        amountPaid: null,
                        status: PaymentStatus.EnMora,
                        daysLate: 120
                    }
                ]
            }
        ],
        debtSummary: {
            totalCredits: 1,
            activeCredits: 0,
            paidCredits: 0,
            totalOriginalAmount: 15000000,
            totalCurrentBalance: 12000000
        }
    },
    "11223344": {
        client: {
            id: 3,
            companyId: 1,
            fullName: "María Fernanda López",
            nationalIdentifier: "11223344",
            birthDate: "1990-07-08",
            emails: [{ value: "maria.lopez@email.com", dateModified: "2024-01-15" }],
            phones: [{ value: "+57 320 456 7890", dateModified: "2024-01-15" }],
            addresses: [{ value: "Avenida 80 #25-15, Cali, Colombia", dateModified: "2024-01-15" }],
            flags: []
        },
        loans: [
            {
                id: 4,
                clientId: 3,
                originationDate: "2024-01-01",
                originalAmount: 3000000,
                modality: PaymentModality.Mensual,
                interestRate: 1.8,
                installments: 18,
                currentBalance: 2700000,
                status: CreditStatus.Vigente,
                lastReportDate: "2024-08-01",
                payments: [
                    {
                        id: 7,
                        loanId: 4,
                        installmentNumber: 1,
                        expectedPaymentDate: "2024-02-01",
                        actualPaymentDate: "2024-02-01",
                        amountPaid: 180000,
                        status: PaymentStatus.Pagado,
                        daysLate: 0
                    }
                ]
            }
        ],
        debtSummary: {
            totalCredits: 1,
            activeCredits: 1,
            paidCredits: 0,
            totalOriginalAmount: 3000000,
            totalCurrentBalance: 2700000
        }
    },
    "55667788": {
        client: {
            id: 4,
            companyId: 1,
            fullName: "José Antonio Martínez",
            nationalIdentifier: "55667788",
            birthDate: "1982-12-03",
            emails: [{ value: "jose.martinez@email.com", dateModified: "2024-01-15" }],
            phones: [{ value: "+57 315 234 5678", dateModified: "2024-01-15" }],
            addresses: [{ value: "Calle 50 #30-40, Barranquilla, Colombia", dateModified: "2024-01-15" }],
            flags: ["alto_riesgo"]
        },
        loans: [
            {
                id: 5,
                clientId: 4,
                originationDate: "2023-08-01",
                originalAmount: 12000000,
                modality: PaymentModality.Quincenal,
                interestRate: 4.2,
                installments: 48,
                currentBalance: 11200000,
                status: CreditStatus.EnJuridica,
                lastReportDate: "2024-08-01",
                payments: [
                    {
                        id: 8,
                        loanId: 5,
                        installmentNumber: 1,
                        expectedPaymentDate: "2023-08-15",
                        actualPaymentDate: "2023-08-20",
                        amountPaid: 300000,
                        status: PaymentStatus.Pagado,
                        daysLate: 5
                    },
                    {
                        id: 9,
                        loanId: 5,
                        installmentNumber: 2,
                        expectedPaymentDate: "2023-09-01",
                        actualPaymentDate: null,
                        amountPaid: null,
                        status: PaymentStatus.EnMora,
                        daysLate: 60
                    }
                ]
            }
        ],
        debtSummary: {
            totalCredits: 1,
            activeCredits: 1,
            paidCredits: 0,
            totalOriginalAmount: 12000000,
            totalCurrentBalance: 11200000
        }
    },
    "99887766": {
        client: {
            id: 5,
            companyId: 1,
            fullName: "Laura Patricia Vargas",
            nationalIdentifier: "99887766",
            birthDate: "1995-09-17",
            emails: [{ value: "laura.vargas@email.com", dateModified: "2024-01-15" }],
            phones: [{ value: "+57 305 876 5432", dateModified: "2024-01-15" }],
            addresses: [{ value: "Carrera 15 #20-25, Bucaramanga, Colombia", dateModified: "2024-01-15" }],
            flags: ["nuevo_cliente"]
        },
        loans: [
            {
                id: 6,
                clientId: 5,
                originationDate: "2024-06-01",
                originalAmount: 2000000,
                modality: PaymentModality.Mensual,
                interestRate: 2.0,
                installments: 12,
                currentBalance: 1800000,
                status: CreditStatus.Vigente,
                lastReportDate: "2024-08-01",
                payments: [
                    {
                        id: 10,
                        loanId: 6,
                        installmentNumber: 1,
                        expectedPaymentDate: "2024-07-01",
                        actualPaymentDate: "2024-07-01",
                        amountPaid: 180000,
                        status: PaymentStatus.Pagado,
                        daysLate: 0
                    }
                ]
            }
        ],
        debtSummary: {
            totalCredits: 1,
            activeCredits: 1,
            paidCredits: 0,
            totalOriginalAmount: 2000000,
            totalCurrentBalance: 1800000
        }
    }
};

// Datos mock para desarrollo cuando el backend no esté disponible
const mockClients: Client[] = [
    {
        id: 1,
        companyId: 1,
        fullName: "Ana María García",
        nationalIdentifier: "12345678",
        birthDate: "1985-03-15",
        emails: [{ value: "ana.garcia@email.com", dateModified: "2024-01-15" }],
        phones: [{ value: "+57 300 123 4567", dateModified: "2024-01-15" }],
        addresses: [{ value: "Calle 123 #45-67, Bogotá, Colombia", dateModified: "2024-01-15" }],
        flags: ["activo"]
    },
    {
        id: 2,
        companyId: 1,
        fullName: "Carlos Eduardo Rodríguez",
        nationalIdentifier: "87654321",
        birthDate: "1978-11-22",
        emails: [{ value: "carlos.rodriguez@email.com", dateModified: "2024-01-15" }],
        phones: [{ value: "+57 310 987 6543", dateModified: "2024-01-15" }],
        addresses: [{ value: "Carrera 45 #12-34, Medellín, Colombia", dateModified: "2024-01-15" }],
        flags: ["moroso"]
    },
    {
        id: 3,
        companyId: 1,
        fullName: "María Fernanda López",
        nationalIdentifier: "11223344",
        birthDate: "1990-07-08",
        emails: [{ value: "maria.lopez@email.com", dateModified: "2024-01-15" }],
        phones: [{ value: "+57 320 456 7890", dateModified: "2024-01-15" }],
        addresses: [{ value: "Avenida 80 #25-15, Cali, Colombia", dateModified: "2024-01-15" }],
        flags: []
    },
    {
        id: 4,
        companyId: 1,
        fullName: "José Antonio Martínez",
        nationalIdentifier: "55667788",
        birthDate: "1982-12-03",
        emails: [{ value: "jose.martinez@email.com", dateModified: "2024-01-15" }],
        phones: [{ value: "+57 315 234 5678", dateModified: "2024-01-15" }],
        addresses: [{ value: "Calle 50 #30-40, Barranquilla, Colombia", dateModified: "2024-01-15" }],
        flags: ["alto_riesgo"]
    },
    {
        id: 5,
        companyId: 1,
        fullName: "Laura Patricia Vargas",
        nationalIdentifier: "99887766",
        birthDate: "1995-09-17",
        emails: [{ value: "laura.vargas@email.com", dateModified: "2024-01-15" }],
        phones: [{ value: "+57 305 876 5432", dateModified: "2024-01-15" }],
        addresses: [{ value: "Carrera 15 #20-25, Bucaramanga, Colombia", dateModified: "2024-01-15" }],
        flags: ["nuevo_cliente"]
    }
];

// La URL base de la API. En una aplicación real, esto provendría de una variable de entorno.
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Datos mock para dashboard
const mockDashboardData = {
    general: {
        total_clients: 150,
        active_clients_up_to_date: 120,
        clients_with_arrears: 25,
        clients_in_legal: 5,
        mora_distribution: {
            "1-30 días": 15,
            "31-60 días": 8,
            "61-90 días": 2,
            "91+ días": 0
        }
    },
    company: [
        {
            company: mockCompanies[0],
            total_clients: 45,
            active_clients_up_to_date: 38,
            clients_with_arrears: 6,
            clients_in_legal: 1,
            mora_distribution: {
                "1-30 días": 4,
                "31-60 días": 2,
                "61-90 días": 0,
                "91+ días": 0
            }
        },
        {
            company: mockCompanies[1],
            total_clients: 35,
            active_clients_up_to_date: 30,
            clients_with_arrears: 4,
            clients_in_legal: 1,
            mora_distribution: {
                "1-30 días": 3,
                "31-60 días": 1,
                "61-90 días": 0,
                "91+ días": 0
            }
        }
    ]
};

class CreditService {
    public clearSession(): void {
        console.log('🧹 Limpiando sesión completamente...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        // Limpiar cualquier otro dato de sesión
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        console.log('🧹 Sesión limpiada. Redirigiendo al login...');
        window.location.href = '/login';
    }
    private isTokenExpired(token: string): boolean {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return true;

            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            // Agregar un margen de 30 segundos para evitar problemas de sincronización
            return payload.exp <= (currentTime + 30);
        } catch (e) {
            console.error('Error parsing token:', e);
            return true;
        }
    }

    private checkTokenBeforeRequest(): string | null {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('No token found');
            return null;
        }

        if (this.isTokenExpired(token)) {
            console.warn('Token expirado, pero NO redirigiendo automáticamente...');
            // NO limpiar sesión automáticamente para permitir que el usuario haga login manual
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('authUser');
            // window.location.href = '/login';
            return null;
        }

        return token;
    }
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            if (response.status === 401) {
                console.warn('🚨 Error 401: Token inválido o expirado');
                // NO limpiar sesión automáticamente para permitir fallback a mock
                throw new Error('Token inválido o expirado');
            }

            const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud' }));
            throw new Error(errorData.message || `Error en el servidor: ${response.statusText}`);
        }
        return response.json();
    }

    // --- MÉTODOS DE CONSULTA ---
    public async fetchCreditHistory(identifier: string): Promise<CreditReport> {
        const token = localStorage.getItem('authToken');
        console.log('📄 fetchCreditHistory para identifier:', identifier);

        try {
            const response = await fetch(`${API_BASE_URL}/reports/${identifier}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (response.ok) {
                console.log('📄 Reporte obtenido del backend');
                return this.handleResponse<CreditReport>(response);
            } else {
                console.warn('📄 Backend error, usando datos mock...');
                throw new Error('Backend no disponible');
            }
        } catch (error) {
            console.warn('📄 Backend no disponible, usando datos mock:', error);

            // Buscar en datos mock
            const mockReport = mockCreditReports[identifier];
            if (mockReport) {
                console.log('📄 Reporte encontrado en datos mock');
                return Promise.resolve(mockReport);
            }

            // Si no se encuentra en mock, crear un reporte básico
            const client = mockClients.find(c => c.nationalIdentifier === identifier);
            if (client) {
                console.log('📄 Cliente encontrado, generando reporte básico');
                const basicReport: CreditReport = {
                    client,
                    loans: [],
                    debtSummary: {
                        totalCredits: 0,
                        activeCredits: 0,
                        paidCredits: 0,
                        totalOriginalAmount: 0,
                        totalCurrentBalance: 0
                    }
                };
                return Promise.resolve(basicReport);
            }

            throw new Error(`No se encontró información crediticia para el identificador: ${identifier}`);
        }
    }

    public async fetchAllClients(): Promise<Client[]> {
        const token = localStorage.getItem('authToken');
        console.log('💫 DEBUG: fetchAllClients - token disponible:', !!token);

        // Si no hay token, usar datos mock directamente
        if (!token) {
            console.log('💫 No hay token, usando datos mock directamente...');
            return Promise.resolve([...mockClients]);
        }

        try {
            // Intentar con backend solo si hay token
            const response = await fetch(`${API_BASE_URL}/clients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('💫 DEBUG: fetchAllClients - response status:', response.status);

            // Si el backend responde correctamente, usar esos datos
            if (response.ok) {
                return this.handleResponse<Client[]>(response);
            } else {
                // Si hay error del backend, usar mock
                console.warn('💫 Backend error, usando datos mock...');
                return Promise.resolve([...mockClients]);
            }
        } catch (error) {
            console.warn('💫 Backend no disponible, usando datos mock:', error);
            return Promise.resolve([...mockClients]);
        }
    }

    public async fetchAllCompanies(): Promise<Company[]> {
        const token = localStorage.getItem('authToken');
        console.log('fetchAllCompanies token:', token);

        try {
            const response = await fetch(`${API_BASE_URL}/companies`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (response.ok) {
                return this.handleResponse<Company[]>(response);
            } else {
                console.warn('Backend error, usando datos mock de empresas...');
                return Promise.resolve([...mockCompanies]);
            }
        } catch (error) {
            console.warn('Backend no disponible, usando datos mock de empresas:', error);
            return Promise.resolve([...mockCompanies]);
        }
    }

    public async fetchCompanyById(companyId: number): Promise<Company | null> {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (response.ok) {
                return this.handleResponse<Company>(response);
            } else {
                console.warn('Backend error, buscando en datos mock...');
                const company = mockCompanies.find(c => c.id === companyId);
                return Promise.resolve(company || null);
            }
        } catch (error) {
            console.warn('Backend no disponible, buscando en datos mock:', error);
            const company = mockCompanies.find(c => c.id === companyId);
            return Promise.resolve(company || null);
        }
    }

    public async updateCompany(companyId: number, updateData: Partial<Company>): Promise<Company> {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                return this.handleResponse<Company>(response);
            } else {
                console.warn('Backend error, actualizando en datos mock...');
                const companyIndex = mockCompanies.findIndex(c => c.id === companyId);
                if (companyIndex !== -1) {
                    const updatedCompany = { ...mockCompanies[companyIndex], ...updateData };
                    mockCompanies[companyIndex] = updatedCompany;
                    return Promise.resolve(updatedCompany);
                }
                throw new Error('Empresa no encontrada');
            }
        } catch (error) {
            console.warn('Backend no disponible, actualizando en datos mock:', error);
            const companyIndex = mockCompanies.findIndex(c => c.id === companyId);
            if (companyIndex !== -1) {
                const updatedCompany = { ...mockCompanies[companyIndex], ...updateData };
                mockCompanies[companyIndex] = updatedCompany;
                return Promise.resolve(updatedCompany);
            }
            throw new Error('Empresa no encontrada');
        }
    }

    public async deleteCompany(companyId: number): Promise<boolean> {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (response.ok) {
                return true;
            } else {
                console.warn('Backend error, eliminando de datos mock...');
                const companyIndex = mockCompanies.findIndex(c => c.id === companyId);
                if (companyIndex !== -1) {
                    mockCompanies.splice(companyIndex, 1);
                    return Promise.resolve(true);
                }
                return Promise.resolve(false);
            }
        } catch (error) {
            console.warn('Backend no disponible, eliminando de datos mock:', error);
            const companyIndex = mockCompanies.findIndex(c => c.id === companyId);
            if (companyIndex !== -1) {
                mockCompanies.splice(companyIndex, 1);
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        }
    }

    public async fetchDashboardData(token?: string): Promise<{ general: any; company: any[] }> {
        const authToken = token || localStorage.getItem('authToken');
        console.log('fetchDashboardData token:', authToken);

        try {
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : undefined
            });

            if (response.ok) {
                return this.handleResponse<{ general: any; company: any[] }>(response);
            } else {
                console.warn('Backend error en dashboard, usando datos mock...');
                return Promise.resolve(mockDashboardData);
            }
        } catch (error) {
            console.warn('Backend no disponible para dashboard, usando datos mock:', error);
            return Promise.resolve(mockDashboardData);
        }
    }

    // --- MÉTODOS DE MANIPULACIÓN ---
    public async updateClient(clientId: number, updateData: ClientUpdateData): Promise<Client> {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(updateData)
            });
            return this.handleResponse<Client>(response);
        } catch (error) {
            console.warn('🔄 Backend no disponible, simulando actualización con mock...');
            // Simular actualización en datos mock
            const clientIndex = mockClients.findIndex(c => c.id === clientId);
            if (clientIndex !== -1) {
                const updatedClient = { ...mockClients[clientIndex], ...updateData };
                mockClients[clientIndex] = updatedClient;
                return Promise.resolve(updatedClient);
            }
            throw new Error('Cliente no encontrado');
        }
    }

    public async updateLoan(loanId: number, loanUpdateData: Partial<Loan>): Promise<Loan> {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/loans/${loanId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(loanUpdateData)
            });

            if (response.ok) {
                return this.handleResponse<Loan>(response);
            } else {
                throw new Error('Backend no disponible');
            }
        } catch (error) {
            console.warn('🔄 Backend no disponible, simulando actualización de préstamo con mock...');

            // Buscar el préstamo en los datos mock y actualizarlo
            for (const identifier in mockCreditReports) {
                const report = mockCreditReports[identifier];
                const loanIndex = report.loans.findIndex(l => l.id === loanId);
                if (loanIndex !== -1) {
                    const updatedLoan = { ...report.loans[loanIndex], ...loanUpdateData };
                    report.loans[loanIndex] = updatedLoan;
                    console.log('🔄 Préstamo actualizado en datos mock');
                    return Promise.resolve(updatedLoan);
                }
            }

            throw new Error('Préstamo no encontrado');
        }
    }

    public async uploadFile(file: File): Promise<ProcessResult> {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/files/upload`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
            body: formData, // No 'Content-Type' header, browser sets it for FormData
        });

        return this.handleResponse<ProcessResult>(response);
    }

    // === MÉTODOS DE GESTIÓN DE USUARIOS ===

    public async fetchAllUsers(): Promise<User[]> {
        const token = localStorage.getItem('authToken');
        console.log('👥 fetchAllUsers - token disponible:', !!token);

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (response.ok) {
                return this.handleResponse<User[]>(response);
            } else {
                console.warn('👥 Backend error, usando datos mock de usuarios...');
                return Promise.resolve([...mockUsers]);
            }
        } catch (error) {
            console.warn('👥 Backend no disponible, usando datos mock de usuarios:', error);
            return Promise.resolve([...mockUsers]);
        }
    }

    public async fetchUserById(userId: number): Promise<User | null> {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (response.ok) {
                return this.handleResponse<User>(response);
            } else {
                console.warn('Backend error, buscando usuario en datos mock...');
                const user = mockUsers.find(u => u.id === userId);
                return Promise.resolve(user || null);
            }
        } catch (error) {
            console.warn('Backend no disponible, buscando usuario en datos mock:', error);
            const user = mockUsers.find(u => u.id === userId);
            return Promise.resolve(user || null);
        }
    }

    public async updateUser(userId: number, updateData: Partial<User>): Promise<User> {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                return this.handleResponse<User>(response);
            } else {
                console.warn('Backend error, actualizando usuario en datos mock...');
                const userIndex = mockUsers.findIndex(u => u.id === userId);
                if (userIndex !== -1) {
                    const updatedUser = { ...mockUsers[userIndex], ...updateData };
                    mockUsers[userIndex] = updatedUser;
                    return Promise.resolve(updatedUser);
                }
                throw new Error('Usuario no encontrado');
            }
        } catch (error) {
            console.warn('Backend no disponible, actualizando usuario en datos mock:', error);
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                const updatedUser = { ...mockUsers[userIndex], ...updateData };
                mockUsers[userIndex] = updatedUser;
                return Promise.resolve(updatedUser);
            }
            throw new Error('Usuario no encontrado');
        }
    }

    public async deleteUser(userId: number): Promise<boolean> {
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (response.ok) {
                return true;
            } else {
                console.warn('Backend error, eliminando usuario de datos mock...');
                const userIndex = mockUsers.findIndex(u => u.id === userId);
                if (userIndex !== -1) {
                    mockUsers.splice(userIndex, 1);
                    return Promise.resolve(true);
                }
                return Promise.resolve(false);
            }
        } catch (error) {
            console.warn('Backend no disponible, eliminando usuario de datos mock:', error);
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                mockUsers.splice(userIndex, 1);
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        }
    }
}

export const creditService = new CreditService();
