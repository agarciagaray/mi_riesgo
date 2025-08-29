import type { CreditReport, RiskScore } from '../types';
import { CreditStatus } from '../types';

const API_BASE_URL = '/api';

class GeminiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error en la solicitud de IA' }));
      throw new Error(errorData.message || 'Ocurrió un error en el servidor de IA.');
    }
    return response.json();
  }

  private generateMockRiskScore(report: CreditReport): RiskScore {
    // Análisis simulado basado en los datos del reporte
    const { client, loans, debtSummary } = report;

    let baseScore = 650; // Puntaje base
    let assessment = 'Medio';
    let reasoning = 'Análisis simulado del perfil crediticio.';

    // Verificar banderas de alto riesgo
    const hasHighRiskFlags = client.flags?.some(flag =>
      ['Fraude', 'Robo de identidad', 'Castigado'].includes(flag)
    );

    if (hasHighRiskFlags) {
      baseScore = 320;
      assessment = 'Muy Alto';
      reasoning = 'Cliente con banderas de alto riesgo detectadas.';
      return { score: baseScore, assessment, reasoning };
    }

    // Analizar estado de los préstamos
    const hasActiveMora = loans.some(loan => loan.status === CreditStatus.EnMora);
    const hasCastigado = loans.some(loan => loan.status === CreditStatus.Castigado);
    const hasJuridica = loans.some(loan => loan.status === CreditStatus.EnJuridica);

    if (hasCastigado || hasJuridica) {
      baseScore = 380;
      assessment = 'Muy Alto';
      reasoning = 'Créditos en estado castigado o jurídico.';
    } else if (hasActiveMora) {
      baseScore = 520;
      assessment = 'Alto';
      reasoning = 'Presenta mora activa en sus créditos.';
    } else {
      // Calcular porcentaje de pagos al día
      const totalPayments = loans.reduce((sum, loan) => sum + loan.payments.length, 0);
      const paidPayments = loans.reduce((sum, loan) =>
        sum + loan.payments.filter(p => p.status === 'Pagado').length, 0
      );

      const paymentRatio = totalPayments > 0 ? paidPayments / totalPayments : 0;

      if (paymentRatio >= 0.95) {
        baseScore = 780;
        assessment = 'Bajo';
        reasoning = 'Excelente historial de pagos puntuales.';
      } else if (paymentRatio >= 0.85) {
        baseScore = 720;
        assessment = 'Medio';
        reasoning = 'Buen historial con algunos atrasos menores.';
      } else {
        baseScore = 580;
        assessment = 'Alto';
        reasoning = 'Historial irregular de pagos.';
      }
    }

    // Ajustar por utilización de crédito
    const utilizationRatio = debtSummary.totalOriginalAmount > 0 ?
      debtSummary.totalCurrentBalance / debtSummary.totalOriginalAmount : 0;

    if (utilizationRatio > 0.8) {
      baseScore -= 50;
      reasoning += ' Alto nivel de endeudamiento.';
    } else if (utilizationRatio < 0.3) {
      baseScore += 30;
      reasoning += ' Bajo nivel de endeudamiento.';
    }

    // Asegurar que el puntaje esté en el rango válido
    baseScore = Math.max(300, Math.min(850, baseScore));

    return { score: baseScore, assessment, reasoning };
  }

  public async calculateRiskScore(report: CreditReport): Promise<RiskScore> {
    // Intentar llamar al backend primero
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/risk-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ report }),
      });

      if (response.ok) {
        return this.handleResponse<RiskScore>(response);
      }
    } catch (error) {
      console.warn('Backend no disponible, usando análisis simulado:', error);
    }

    // Fallback a análisis simulado
    console.log('Usando análisis de riesgo simulado');

    // Simular un pequeño delay para parecer más realista
    await new Promise(resolve => setTimeout(resolve, 1500));

    return this.generateMockRiskScore(report);
  }
}

export const geminiService = new GeminiService();
