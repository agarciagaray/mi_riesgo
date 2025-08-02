import { GoogleGenAI, Type } from "@google/genai";
import type { CreditReport, RiskScore } from '../types';

const API_BASE_URL = '/api';

class GeminiService {
  private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud de IA' }));
            throw new Error(errorData.message || 'Ocurrió un error en el servidor de IA.');
        }
        return response.json();
    }
    
  public async calculateRiskScore(report: CreditReport): Promise<RiskScore> {
    // This now calls our own backend, which will then securely call the Gemini API.
    const response = await fetch(`${API_BASE_URL}/risk-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report }),
    });
    return this.handleResponse<RiskScore>(response);
  }
}

export const geminiService = new GeminiService();
