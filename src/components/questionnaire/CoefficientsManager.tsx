import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Target, TrendingUp, Info } from 'lucide-react';
import { getAllQuestions, getQuestionCoefficients } from '@/utils/wellnessUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CoefficientsManagerProps {
  questionCoefficients: Record<string, number>;
  onChange: (coefficients: Record<string, number>) => void;
}

export const CoefficientsManager: React.FC<CoefficientsManagerProps> = ({
  questionCoefficients,
  onChange,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  const allQuestions = getAllQuestions();

  const presets = [
    {
      id: 'balanced',
      name: 'Équilibré',
      description: 'Tous les aspects ont la même importance',
      icon: '⚖️',
      coefficients: {} // Tous à 1.0
    },
    {
      id: 'health',
      name: 'Santé Physique',
      description: 'Focus sur alimentation, sport et sommeil',
      icon: '💪',
      coefficients: {
        'alimentation': 1.5,
        'sport': 1.5,
        'sommeil': 1.5,
        'stress': 1.2,
        'spiritualite': 0.8,
        'social': 0.8
      }
    },
    {
      id: 'wellness',
      name: 'Bien-être Mental',
      description: 'Focus sur équilibre et spiritualité',
      icon: '🧘',
      coefficients: {
        'stress': 1.5,
        'spiritualite': 1.5,
        'social': 1.3,
        'sommeil': 1.2,
        'alimentation': 1.0,
        'sport': 1.0
      }
    },
    {
      id: 'social',
      name: 'Vie Sociale',
      description: 'Focus sur relations et spiritualité',
      icon: '👥',
      coefficients: {
        'social': 1.5,
        'spiritualite': 1.3,
        'stress': 1.2,
        'alimentation': 1.0,
        'sport': 1.0,
        'sommeil': 1.0
      }
    }
  ];

  const applyPreset = (preset: any) => {
    const newCoefficients = { ...questionCoefficients };
    
    // Reset tous les coefficients à 1.0
    allQuestions.forEach(({ pillar, questions }) => {
      questions.forEach((_, index) => {
        const questionKey = `${pillar}_${index}`;
        newCoefficients[questionKey] = 1.0;
      });
    });

    // Appliquer les coefficients du preset par pilier
    if (preset.id !== 'balanced') {
      Object.entries(preset.coefficients).forEach(([pillarId, coefficient]) => {
        const pillarQuestions = allQuestions.find(p => p.pillar === pillarId);
        if (pillarQuestions) {
          pillarQuestions.questions.forEach((_, index) => {
            const questionKey = `${pillarId}_${index}`;
            newCoefficients[questionKey] = coefficient as number;
          });
        }
      });
    }

    onChange(newCoefficients);
    setSelectedPreset(preset.id);
  };

  const resetToDefault = () => {
    const defaultCoefficients: Record<string, number> = {};
    allQuestions.forEach(({ pillar, questions }) => {
      questions.forEach((_, index) => {
        const questionKey = `${pillar}_${index}`;
        defaultCoefficients[questionKey] = 1.0;
      });
    });
    onChange(defaultCoefficients);
    setSelectedPreset(null);
  };

  const updateQuestionCoefficient = (questionKey: string, value: number) => {
    onChange({
      ...questionCoefficients,
      [questionKey]: value
    });
    setSelectedPreset(null); // Désélectionner le preset car l'utilisateur fait des modifications manuelles
  };

  const getPillarName = (pillarId: string): string => {
    const names: Record<string, string> = {
      'alimentation': 'Alimentation 🥗',
      'sport': 'Sport 💪',
      'sommeil': 'Sommeil 😴',
      'stress': 'Équilibre & Addictions ⚖️',
      'spiritualite': 'Spiritualité 🕌',
      'social': 'Social ❤️'
    };
    return names[pillarId] || pillarId;
  };

  const getImportanceLabel = (value: number): { label: string; color: string } => {
    if (value >= 1.7) return { label: 'Critique', color: 'bg-red-100 text-red-800' };
    if (value >= 1.4) return { label: 'Très important', color: 'bg-orange-100 text-orange-800' };
    if (value >= 1.1) return { label: 'Important', color: 'bg-yellow-100 text-yellow-800' };
    if (value >= 0.9) return { label: 'Normal', color: 'bg-green-100 text-green-800' };
    if (value >= 0.6) return { label: 'Secondaire', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Minimal', color: 'bg-gray-100 text-gray-800' };
  };

  const calculatePillarImportance = (pillarId: string): number => {
    const pillarQuestions = allQuestions.find(p => p.pillar === pillarId);
    if (!pillarQuestions) return 1.0;

    const coefficients = pillarQuestions.questions.map((_, index) => {
      const questionKey = `${pillarId}_${index}`;
      return questionCoefficients[questionKey] || 1.0;
    });

    return coefficients.reduce((sum, coeff) => sum + coeff, 0) / coefficients.length;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Coefficients d'Importance</h2>
            <p className="text-gray-600 mt-1">
              Ajustez l'importance de chaque question dans le calcul de votre score global
            </p>
          </div>
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Réinitialiser
          </Button>
        </div>

        {/* Presets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={20} />
              Configurations prédéfinies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {presets.map(preset => (
                <div
                  key={preset.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedPreset === preset.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => applyPreset(preset)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{preset.icon}</div>
                    <h3 className="font-medium mb-1">{preset.name}</h3>
                    <p className="text-sm text-gray-600">{preset.description}</p>
                    {selectedPreset === preset.id && (
                      <Badge className="mt-2 bg-blue-600">Appliqué</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vue d'ensemble des piliers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Importance par pilier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allQuestions.map(({ pillar }) => {
                const importance = calculatePillarImportance(pillar);
                const { label, color } = getImportanceLabel(importance);
                
                return (
                  <div key={pillar} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{getPillarName(pillar)}</h3>
                      <Badge className={color}>{label}</Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-700">
                      {importance.toFixed(1)}x
                    </div>
                    <div className="text-sm text-gray-500">
                      Coefficient moyen
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Coefficients détaillés par question */}
        <div className="space-y-6">
          {allQuestions.map(({ pillar, questions }) => (
            <Card key={pillar}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{getPillarName(pillar)}</span>
                  <Badge variant="outline">
                    {questions.length} question(s)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {questions.map((question, index) => {
                    const questionKey = `${pillar}_${index}`;
                    const currentValue = questionCoefficients[questionKey] || 1.0;
                    const { label, color } = getImportanceLabel(currentValue);

                    return (
                      <div key={index} className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <p className="text-sm font-medium mb-1">{question}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={color}>{label}</Badge>
                              <span className="text-sm text-gray-600">
                                Coefficient: {currentValue.toFixed(1)}x
                              </span>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info size={14} className="text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Plus le coefficient est élevé, plus cette question</p>
                                  <p>aura d'impact sur votre score global.</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <div className="w-48">
                            <Slider
                              value={[currentValue]}
                              onValueChange={([value]) => updateQuestionCoefficient(questionKey, value)}
                              min={0.1}
                              max={2.0}
                              step={0.1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>0.1x</span>
                              <span>1.0x</span>
                              <span>2.0x</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Explication */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <h4 className="font-medium mb-2">Comment ça marche ?</h4>
                <ul className="space-y-1">
                  <li>• <strong>1.0x</strong> = Importance normale (valeur par défaut)</li>
                  <li>• <strong>&gt; 1.0x</strong> = Plus important dans le calcul du score</li>
                  <li>• <strong>&lt; 1.0x</strong> = Moins important dans le calcul du score</li>
                  <li>• Les coefficients permettent de personnaliser l'évaluation selon vos priorités</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
