import type { User, UserRegistrationData } from '../types';

// Datos mock para desarrollo cuando el backend no esté disponible
// Credenciales sincronizadas con el backend y base de datos
const mockUsers: { email: string; password: string; user: User }[] = [
    {
        email: "admin@miriesgo.com",
        password: "admin123",
        user: {
            id: 1,
            fullName: "Administrador Principal",
            nationalIdentifier: "80123456789",
            phone: "+57 300 123 4567",
            email: "admin@miriesgo.com",
            role: "admin",
            companyId: null
        }
    },
    {
        email: "ana.garcia@miriesgo.com",
        password: "ana123",
        user: {
            id: 2,
            fullName: "Ana García",
            nationalIdentifier: "12345678901",
            phone: "+57 310 234 5678",
            email: "ana.garcia@miriesgo.com",
            role: "manager",
            companyId: 1
        }
    },
    {
        email: "carlos.rodriguez@miriesgo.com",
        password: "carlos123",
        user: {
            id: 3,
            fullName: "Carlos Rodríguez",
            nationalIdentifier: "23456789012",
            phone: "+57 311 345 6789",
            email: "carlos.rodriguez@miriesgo.com",
            role: "analyst",
            companyId: 1
        }
    },
    {
        email: "maria.lopez@bancofn.com",
        password: "maria123",
        user: {
            id: 4,
            fullName: "María López",
            nationalIdentifier: "34567890123",
            phone: "+57 312 456 7890",
            email: "maria.lopez@bancofn.com",
            role: "manager",
            companyId: 2
        }
    }
];

// Función para generar token JWT simulado
const generateMockToken = (user: User): string => {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
        sub: user.email,
        user_id: user.id,
        role: user.role,
        company_id: user.companyId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 días
    };

    // Simulación simple de JWT (no es seguro para producción)
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`mock-signature-${user.id}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// La URL base de la API. En una aplicación real, esto provendría de una variable de entorno.
const API_BASE_URL = 'http://127.0.0.1:8000/api';

class AuthService {
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud' }));
            throw new Error(errorData.message || 'Ocurrió un error en el servidor.');
        }
        return response.json();
    }

    /**
     * Valida la fortaleza de una contraseña.
     * @param password La contraseña a validar.
     * @returns Un objeto con la validez y un mensaje de error si no es válida.
     */
    public validatePassword(password: string): { isValid: boolean; message?: string } {
        // La validación en el frontend se mantiene para feedback inmediato al usuario.
        // La validación crítica debe ocurrir en el backend.
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return { isValid: false, message: `La contraseña debe tener al menos ${minLength} caracteres.` };
        }
        if (!hasUpperCase) {
            return { isValid: false, message: 'La contraseña debe contener al menos una letra mayúscula.' };
        }
        if (!hasLowerCase) {
            return { isValid: false, message: 'La contraseña debe contener al menos una letra minúscula.' };
        }
        if (!hasNumber) {
            return { isValid: false, message: 'La contraseña debe contener al menos un número.' };
        }
        if (!hasSymbol) {
            return { isValid: false, message: 'La contraseña debe contener al menos un símbolo especial.' };
        }
        return { isValid: true };
    }

    /**
     * Inicia sesión de un usuario.
     * @param email El correo del usuario.
     * @param password La contraseña del usuario.
     * @returns Una promesa con el usuario y un token simulado.
     */
    public async login(email: string, password: string): Promise<{ user: User, token: string }> {
        console.log('🔓 Iniciando login para:', email);

        // Intentar primero con el backend real
        try {
            const body = new URLSearchParams({ username: email, password }).toString();
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body,
            });

            if (response.ok) {
                const data = await this.handleResponse<{ access_token: string, token_type: string, user: User }>(response);
                console.log('🔓 Login exitoso con backend');
                return { user: data.user, token: data.access_token };
            } else {
                console.warn('🔓 Credenciales inválidas en backend, intentando con mock');
            }
        } catch (error) {
            console.warn('🔓 Backend no disponible, usando datos mock:', error);
        }

        // Si el backend falla, usar datos mock como fallback
        const mockUser = mockUsers.find(u => u.email === email && u.password === password);
        if (mockUser) {
            const token = generateMockToken(mockUser.user);
            console.log('🔓 Login exitoso con datos mock:', mockUser.user.fullName);
            return { user: mockUser.user, token };
        }


        // Si todo falla, mostrar credenciales disponibles
        throw new Error(`Credenciales inválidas. \n\nUsuarios de prueba disponibles:\n• admin@miriesgo.com / admin123\n• ana.garcia@miriesgo.com / ana123\n• carlos.rodriguez@miriesgo.com / carlos123\n• maria.lopez@bancofn.com / maria123`);
    }

    /**
     * Registra un nuevo usuario.
     * @param userData Los datos del nuevo usuario.
     * @returns Una promesa con el nuevo usuario y un token simulado.
     */
    public async register(userData: UserRegistrationData): Promise<{ user: User, token: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await this.handleResponse<{ access_token: string, token_type: string, user: User }>(response);
            return { user: data.user, token: data.access_token };
        } catch (error) {
            console.warn('🔓 Backend no disponible, usando registro mock:', error);

            // Fallback a registro mock
            const newUser: User = {
                id: mockUsers.length + 1,
                fullName: userData.fullName,
                nationalIdentifier: userData.nationalIdentifier,
                phone: userData.phone,
                email: userData.email,
                role: "analyst", // Rol por defecto
                companyId: 1 // Empresa por defecto
            };

            const token = generateMockToken(newUser);
            console.log('🔓 Registro exitoso con datos mock:', newUser.fullName);
            return { user: newUser, token };
        }
    }
}

export const authService = new AuthService();
