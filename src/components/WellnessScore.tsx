
import React from 'react';
import { Card } from '@/components/ui/card';
import { calculateGlobalScore } from '@/utils/wellnessUtils';

interface WellnessScoreProps {
  data: any;
}

const WellnessScore = ({ data }: WellnessScoreProps) => {
  const globalScore = calculateGlobalScore(data);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent équilibre ! 🌟';
    if (score >= 60) return 'Bon équilibre, quelques améliorations possibles 👍';
    if (score >= 40) return 'Équilibre moyen, concentrez-vous sur vos priorités 💪';
    return 'Prenez soin de vous, chaque petit pas compte ❤️';
  };

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-white to-green-50 border-0 shadow-xl">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Score de Bien-être Global</h2>
      
      <div className="relative mb-6">
        <div className="w-32 h-32 mx-auto rounded-full border-8 border-gray-200 flex items-center justify-center bg-white shadow-inner">
          <div className="text-center">
            <span className={`text-4xl font-bold ${getScoreColor(globalScore)}`}>
              {Math.round(globalScore)}
            </span>
            <div className="text-sm text-gray-500 font-medium">%</div>
          </div>
        </div>
        
        {/* Progress ring */}
        <svg className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={getScoreColor(globalScore)}
            strokeDasharray={`${(globalScore / 100) * 377} 377`}
          />
        </svg>
      </div>
      
      <p className={`text-lg font-medium mb-2 ${getScoreColor(globalScore)}`}>
        {getScoreMessage(globalScore)}
      </p>
      
      <p className="text-sm text-gray-600">
        Basé sur l'évaluation de vos 6 piliers de bien-être
      </p>
    </Card>
  );
};

export default WellnessScore;
