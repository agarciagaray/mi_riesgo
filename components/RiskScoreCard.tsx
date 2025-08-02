
import React from 'react';
import type { RiskScore } from '../types';
import { ShieldCheckIcon, ShieldExclamationIcon, SpinnerIcon } from './Icons';

interface RiskScoreCardProps {
  score: RiskScore | null;
  isLoading: boolean;
}

const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-400';
    if (score >= 650) return 'text-yellow-400';
    if (score >= 550) return 'text-orange-400';
    return 'text-red-400';
};

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ score, isLoading }) => {
  const Icon = score && score.score >= 650 ? ShieldCheckIcon : ShieldExclamationIcon;
  const scoreColor = score ? getScoreColor(score.score) : 'text-gray-400';
  const assessmentColor = {
    'Bajo': 'bg-green-500/20 text-green-300',
    'Medio': 'bg-yellow-500/20 text-yellow-300',
    'Alto': 'bg-orange-500/20 text-orange-300',
    'Muy Alto': 'bg-red-500/20 text-red-300',
    'Error': 'bg-gray-500/20 text-gray-300',
  }[(score?.assessment as keyof typeof assessmentColor) || 'Error'] || 'bg-gray-500/20 text-gray-300';


  return (
    <div className="bg-gray-800 p-6 rounded-lg flex flex-col justify-between h-full">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center"><Icon className={`h-6 w-6 mr-2 ${scoreColor}`}/>Puntaje de Riesgo</h3>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <SpinnerIcon className="h-10 w-10 text-cyan-400" />
          <p className="text-gray-400 mt-2">Calculando puntaje...</p>
        </div>
      ) : score ? (
        <div className="text-center flex-grow flex flex-col justify-center">
            <p className={`text-6xl font-bold ${scoreColor}`}>{score.score}</p>
            <p className={`text-lg font-semibold px-3 py-1 rounded-full inline-block self-center mt-2 ${assessmentColor}`}>{score.assessment} Riesgo</p>
            <p className="text-gray-400 text-sm mt-4 italic">"{score.reasoning}"</p>
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center flex-grow">
            <p className="text-gray-500">Puntaje no disponible.</p>
        </div>
      )}
    </div>
  );
};