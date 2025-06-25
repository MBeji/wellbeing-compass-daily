import React from 'react';
import { Card } from '@/components/ui/card';
import { calculateGlobalScore, calculatePillarScore, getPillarCoefficients, getAllQuestions } from '@/utils/wellnessUtils';

interface ScoreDetailsProps {
  data: any;
}

const ScoreDetails = ({ data }: ScoreDetailsProps) => {
  if (!data) return null;

  const coefficients = getPillarCoefficients();
  const allQuestions = getAllQuestions();
  const uniquePillars = [...new Set(allQuestions.map(q => q.pillar))];
  
  const calculations = uniquePillars.map(pillar => {
    const score = calculatePillarScore(data, pillar);
    const coefficient = coefficients[pillar] || 1.0;
    const weightedScore = score * coefficient;
    
    return {
      pillar,
      score,
      coefficient,
      weightedScore
    };
  });

  const totalWeightedScore = calculations.reduce((sum, calc) => sum + calc.weightedScore, 0);
  const totalCoefficients = calculations.reduce((sum, calc) => sum + calc.coefficient, 0);
  const globalScore = calculateGlobalScore(data);

  return (
    <Card className="p-4 bg-blue-50 border border-blue-200">
      <h4 className="font-semibold text-blue-800 mb-3 text-sm">
        🧮 Détail du calcul du score global
      </h4>
      <div className="space-y-2 text-xs">
        {calculations.map(calc => (
          <div key={calc.pillar} className="flex justify-between items-center">
            <span className="text-blue-700">
              {calc.pillar}: {calc.score}% × {calc.coefficient.toFixed(1)}
            </span>
            <span className="font-mono text-blue-800">
              = {calc.weightedScore.toFixed(1)}
            </span>
          </div>
        ))}
        <hr className="border-blue-300" />
        <div className="flex justify-between items-center font-semibold">
          <span className="text-blue-700">
            Total: {totalWeightedScore.toFixed(1)} ÷ {totalCoefficients.toFixed(1)}
          </span>
          <span className="font-mono text-blue-800">
            = {globalScore}%
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ScoreDetails;
