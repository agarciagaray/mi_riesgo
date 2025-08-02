export enum CreditStatus {
  Vigente = 'Vigente',
  EnMora = 'En Mora',
  Pagado = 'Pagado',
  Cancelado = 'Cancelado',
  Castigado = 'Castigado',
  Fraudulento = 'Fraudulento',
  Siniestrado = 'Siniestrado',
  EnJuridica = 'En Jurídica',
  Embargo = 'Embargo',
}

export enum PaymentStatus {
  Pendiente = 'Pendiente',
  Pagado = 'Pagado',
  EnMora = 'En Mora',
}

export enum PaymentModality {
    Diario = 'Diario',
    Semanal = 'Semanal',
    Quincenal = 'Quincenal',
    Mensual = 'Mensual',
    Anual = 'Anual'
}

export interface Company {
  id: number;
  name: string;
  nit: string;
  code: string; // Código de entidad de TransUnion
}

export interface HistoricEntry<T> {
  value: T;
  dateModified: string;
}

export interface Client {
  id: number;
  companyId: number;
  nationalIdentifier: string;
  fullName: string;
  birthDate: string;
  addresses: HistoricEntry<string>[];
  phones: HistoricEntry<string>[];
  emails: HistoricEntry<string>[];
  flags?: string[];
}

export interface Payment {
  id: number;
  loanId: number;
  installmentNumber: number;
  expectedPaymentDate: string;
  actualPaymentDate: string | null;
  amountPaid: number | null;
  status: PaymentStatus;
  daysLate: number;
}

export interface Loan {
  id: number;
  clientId: number;
  originationDate: string;
  originalAmount: number;
  modality: PaymentModality;
  interestRate: number;
  installments: number;
  currentBalance: number;
  status: CreditStatus;
  lastReportDate: string;
  payments: Payment[];
}

export interface DebtSummary {
  totalCredits: number;
  activeCredits: number;
  paidCredits: number;
  totalOriginalAmount: number;
  totalCurrentBalance: number;
}

export interface CreditReport {
  client: Client;
  loans: Loan[];
  debtSummary: DebtSummary;
}

export interface RiskScore {
  score: number;
  assessment: string;
  reasoning: string;
}

export interface ProcessResult {
    status: 'success' | 'error';
    message: string;
    fileName: string;
    totalRecords: number;
    processedRecords: number;
    newClients: number;
    newLoans: number;
    updatedLoans: number;
    errors: string[];
}

// --- Tipos para Autenticación ---

export interface User {
  id: number;
  fullName: string;
  nationalIdentifier: string; // Cédula
  phone: string; // Celular
  email: string;
  role: 'analyst' | 'manager' | 'admin';
  companyId?: number; // Opcional para admins de sistema
}

export type UserRegistrationData = Omit<User, 'id'| 'role' | 'companyId'> & {
  password: string;
};


export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: UserRegistrationData) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}
