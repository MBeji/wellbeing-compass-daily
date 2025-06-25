import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Target, Award } from 'lucide-react';
import { 
  getWellnessData, 
  calculateGlobalScoreWithQuestionCoefficients,
  calculatePillarScoreWithQuestionCoefficients,
  getAllQuestions 
} from '@/utils/wellnessUtils';

interface EvolutionInsightsProps {
  period?: 7 | 30;
}

interface Insight {
  type: 'improvement' | 'decline' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  value?: number;
  pillar?: string;
  icon: React.ReactNode;
}

const EvolutionInsights = ({ period = 7 }: EvolutionInsightsProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);

  const generateDateRange = (days: number): string[] => {
    const dates = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  useEffect(() => {
    const wellnessData = getWellnessData();
    const dateRange = generateDateRange(period);
    const allQuestions = getAllQuestions();
    const uniquePillars = [...new Set(allQuestions.map(q => q.pillar))];
    
    const globalScores = dateRange.map(date => {
      const dayData = wellnessData[date];
      return dayData ? calculateGlobalScoreWithQuestionCoefficients(dayData) : 0;
    }).filter(score => score > 0);

    const insights: Insight[] = [];

    if (globalScores.length >= 2) {
      // Tendance globale
      const firstScore = globalScores[0];
      const lastScore = globalScores[globalScores.length - 1];
      const improvement = lastScore - firstScore;

      if (improvement > 5) {
        insights.push({
          type: 'improvement',
          title: 'Progression Positive',
          description: `Votre bien-être s'améliore avec un gain de ${Math.round(improvement)} points sur ${period} jours !`,
          value: improvement,
          icon: <TrendingUp className="w-5 h-5 text-green-600" />
        });
      } else if (improvement < -5) {
        insights.push({
          type: 'decline',
          title: 'Attention Requise',
          description: `Votre score a baissé de ${Math.round(Math.abs(improvement))} points. Prenez soin de vous.`,
          value: improvement,
          icon: <TrendingDown className="w-5 h-5 text-red-600" />
        });
      }

      // Meilleur score
      const maxScore = Math.max(...globalScores);
      if (maxScore >= 80) {
        insights.push({
          type: 'achievement',
          title: 'Excellent Équilibre',
          description: `Félicitations ! Vous avez atteint ${maxScore}% de bien-être.`,
          value: maxScore,
          icon: <Award className="w-5 h-5 text-yellow-600" />
        });
      }

      // Analyse par pilier
      uniquePillars.forEach(pillar => {
        const pillarScores = dateRange.map(date => {
          const dayData = wellnessData[date];
          return dayData ? calculatePillarScoreWithQuestionCoefficients(dayData, pillar) : 0;
        }).filter(score => score > 0);

        if (pillarScores.length >= 2) {
          const pillarImprovement = pillarScores[pillarScores.length - 1] - pillarScores[0];
          const avgScore = pillarScores.reduce((a, b) => a + b, 0) / pillarScores.length;

          if (pillarImprovement > 10) {
            insights.push({
              type: 'improvement',
              title: `Progrès en ${pillar.charAt(0).toUpperCase() + pillar.slice(1)}`,
              description: `Amélioration remarquable de ${Math.round(pillarImprovement)} points dans ce domaine.`,
              value: pillarImprovement,
              pillar,
              icon: <TrendingUp className="w-5 h-5 text-blue-600" />
            });
          } else if (avgScore < 40) {
            insights.push({
              type: 'suggestion',
              title: `Focus sur ${pillar.charAt(0).toUpperCase() + pillar.slice(1)}`,
              description: `Ce pilier mériterait plus d'attention (moyenne: ${Math.round(avgScore)}%).`,
              value: avgScore,
              pillar,
              icon: <Target className="w-5 h-5 text-orange-600" />
            });
          }
        }
      });

      // Consistance
      const variance = globalScores.reduce((acc, score) => {
        const mean = globalScores.reduce((a, b) => a + b, 0) / globalScores.length;
        return acc + Math.pow(score - mean, 2);
      }, 0) / globalScores.length;

      if (Math.sqrt(variance) < 10) {
        insights.push({
          type: 'achievement',
          title: 'Stabilité Remarquable',
          description: `Votre bien-être est très stable sur cette période. Continuez ainsi !`,
          icon: <Calendar className="w-5 h-5 text-green-600" />
        });
      }
    } else {
      insights.push({
        type: 'suggestion',
        title: 'Commencez Votre Suivi',
        description: `Remplissez votre journal quotidien pour recevoir des insights personnalisés.`,
        icon: <Calendar className="w-5 h-5 text-blue-600" />
      });
    }

    setInsights(insights.slice(0, 4)); // Limiter à 4 insights
  }, [period]);

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'improvement':
        return 'border-green-200 bg-green-50';
      case 'decline':
        return 'border-red-200 bg-red-50';
      case 'achievement':
        return 'border-yellow-200 bg-yellow-50';
      case 'suggestion':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'improvement':
        return 'bg-green-100 text-green-800';
      case 'decline':
        return 'bg-red-100 text-red-800';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800';
      case 'suggestion':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        Insights des {period} derniers jours
      </h3>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${getInsightStyle(insight.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {insight.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{insight.title}</h4>
                    <Badge className={getBadgeStyle(insight.type)}>
                      {insight.type === 'improvement' ? 'Progrès' :
                       insight.type === 'decline' ? 'Attention' :
                       insight.type === 'achievement' ? 'Réussite' :
                       'Conseil'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                  {insight.pillar && (
                    <p className="text-xs text-gray-500 mt-1">
                      Pilier: {insight.pillar.charAt(0).toUpperCase() + insight.pillar.slice(1)}
                    </p>
                  )}
                </div>
              </div>
              
              {insight.value !== undefined && (
                <div className="text-right ml-2">
                  <div className={`text-lg font-bold ${
                    insight.type === 'improvement' ? 'text-green-600' :
                    insight.type === 'decline' ? 'text-red-600' :
                    insight.type === 'achievement' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {insight.type === 'improvement' && insight.value > 0 ? '+' : ''}
                    {Math.round(insight.value)}
                    {insight.type !== 'suggestion' ? '%' : ''}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EvolutionInsights;
