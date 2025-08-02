import type { ClientUpdateData } from '../components/EditClientForm';
import type { Client, Company, CreditReport, Loan, ProcessResult } from '../types';

// La URL base de la API. En una aplicación real, esto provendría de una variable de entorno.
const API_BASE_URL = '/api';

class CreditService {
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud' }));
            throw new Error(errorData.message || `Error en el servidor: ${response.statusText}`);
        }
        return response.json();
    }

    // --- MÉTODOS DE CONSULTA ---
    public async fetchCreditHistory(identifier: string): Promise<CreditReport> {
        const token = localStorage.getItem('authToken');
        console.log('fetchCreditHistory token:', token);
        const response = await fetch(`${API_BASE_URL}/reports/${identifier}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });
        return this.handleResponse<CreditReport>(response);
    }

    public async fetchAllClients(): Promise<Client[]> {
        const token = localStorage.getItem('authToken');
        console.log('fetchAllClients token:', token);
        const response = await fetch(`${API_BASE_URL}/clients`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });
        return this.handleResponse<Client[]>(response);
    }

    public async fetchAllCompanies(): Promise<Company[]> {
        const token = localStorage.getItem('authToken');
        console.log('fetchAllCompanies token:', token);
        const response = await fetch(`${API_BASE_URL}/companies`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });
        return this.handleResponse<Company[]>(response);
    }

    public async fetchDashboardData(): Promise<{ general: any; company: any[] }> {
        const token = localStorage.getItem('authToken');
        console.log('fetchDashboardData token:', token);
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });
        return this.handleResponse<{ general: any; company: any[] }>(response);
    }

    // --- MÉTODOS DE MANIPULACIÓN ---
    public async updateClient(clientId: number, updateData: ClientUpdateData): Promise<Client> {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(updateData)
        });
        return this.handleResponse<Client>(response);
    }

    public async updateLoan(loanId: number, loanUpdateData: Partial<Loan>): Promise<Loan> {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/loans/${loanId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(loanUpdateData)
        });
        return this.handleResponse<Loan>(response);
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
}

export const creditService = new CreditService();
