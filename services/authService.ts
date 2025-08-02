import type { User, UserRegistrationData } from '../types';

// La URL base de la API. En una aplicación real, esto provendría de una variable de entorno.
const API_BASE_URL = '/api';

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
        // El backend espera 'username' y 'password' como x-www-form-urlencoded (OAuth2PasswordRequestForm)
        const body = new URLSearchParams({ username: email, password }).toString();
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        return this.handleResponse<{ user: User, token: string }>(response);
    }

    /**
     * Registra un nuevo usuario.
     * @param userData Los datos del nuevo usuario.
     * @returns Una promesa con el nuevo usuario y un token simulado.
     */
    public async register(userData: UserRegistrationData): Promise<{ user: User, token: string }> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return this.handleResponse<{ user: User, token: string }>(response);
    }
}

export const authService = new AuthService();
