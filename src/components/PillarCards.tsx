
import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  calculatePillarScore, 
  calculatePillarScoreWithQuestionCoefficients,
  getQuestionCoefficients 
} from '@/utils/wellnessUtils';
import { 
  Apple, 
  Dumbbell, 
  Moon, 
  Brain, 
  Heart, 
  Users 
} from 'lucide-react';

interface PillarCardsProps {
  data: any;
}

const pillars = [
  {
    key: 'alimentation',
    name: 'Alimentation',
    icon: Apple,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50'
  },
  {
    key: 'sport',
    name: 'Sport',
    icon: Dumbbell,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    key: 'sommeil',
    name: 'Sommeil',
    icon: Moon,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    key: 'stress',
    name: 'Équilibre',
    icon: Brain,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    key: 'spiritualite',
    name: 'Spiritualité',
    icon: Heart,
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  {
    key: 'social',
    name: 'Social',
    icon: Users,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50'
  }
];

const PillarCards = ({ data }: PillarCardsProps) => {
  const questionCoefficients = getQuestionCoefficients();
  
  // Fonction pour déterminer l'importance moyenne d'un pilier basée sur ses questions
  const getPillarImportance = (pillarKey: string) => {
    const pillarQuestionKeys = Object.keys(questionCoefficients).filter(key => key.startsWith(pillarKey + '_'));
    if (pillarQuestionKeys.length === 0) return 1.0;
    
    const totalCoefficient = pillarQuestionKeys.reduce((sum, key) => sum + questionCoefficients[key], 0);
    return totalCoefficient / pillarQuestionKeys.length;
  };
  
  const getImportanceIndicator = (coefficient: number) => {
    if (coefficient >= 1.3) return { emoji: '🔴', label: 'Très important' };
    if (coefficient >= 1.1) return { emoji: '🟡', label: 'Important' };
    if (coefficient <= 0.8) return { emoji: '🔵', label: 'Secondaire' };
    return null;
  };
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Scores par Pilier</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">        {pillars.map((pillar) => {
          const score = calculatePillarScoreWithQuestionCoefficients(data, pillar.key);
          const avgCoefficient = getPillarImportance(pillar.key);
          const importanceIndicator = getImportanceIndicator(avgCoefficient);
          const IconComponent = pillar.icon;
          
          return (
            <Card key={pillar.key} className={`p-6 ${pillar.bgColor} border-0 shadow-md hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full bg-gradient-to-br ${pillar.color} text-white`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.round(score)}%
                  </div>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center justify-between">
                <span>{pillar.name}</span>
                {importanceIndicator && (
                  <span className="text-xs" title={`Coefficient moyen: ${avgCoefficient.toFixed(1)}x - ${importanceIndicator.label}`}>
                    {importanceIndicator.emoji}
                  </span>
                )}
              </h4>
              
              {/* Progress bar */}
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${pillar.color} transition-all duration-500 ease-out`}
                  style={{ width: `${score}%` }}
                />
              </div>
              
              <p className="text-xs text-gray-600 mt-2">
                {score >= 80 ? 'Excellent' : score >= 60 ? 'Bon' : score >= 40 ? 'Moyen' : 'À améliorer'}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PillarCards;
