import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, BarChart3, Calculator, Eye } from 'lucide-react';
import { 
  calculateGlobalScoreWithQuestionCoefficients,
  calculatePillarScoreWithQuestionCoefficients,
  getAllQuestions
} from '@/utils/wellnessUtils';

interface CustomQuestion {
  id: string;
  pillar: string;
  question: string;
}

interface Pillar {
  id: string;
  name: string;
  emoji: string;
}

interface PreviewModeProps {
  allPillars: Pillar[];
  customQuestions: CustomQuestion[];
  questionCoefficients: Record<string, number>;
}

export const PreviewMode: React.FC<PreviewModeProps> = ({
  allPillars,
  customQuestions,
  questionCoefficients,
}) => {
  const [testResponses, setTestResponses] = useState<Record<string, number[]>>({});
  const [showSimulation, setShowSimulation] = useState(false);

  const allQuestions = getAllQuestions();

  const initializeTestResponses = () => {
    const responses: Record<string, number[]> = {};
    allQuestions.forEach(({ pillar, questions }) => {
      responses[pillar] = new Array(questions.length).fill(75); // Valeur par défaut à 75%
    });
    
    // Ajouter les questions personnalisées
    customQuestions.forEach(question => {
      if (!responses[question.pillar]) {
        responses[question.pillar] = [];
      }
      responses[question.pillar].push(75);
    });
    
    setTestResponses(responses);
    setShowSimulation(true);
  };

  const updateTestResponse = (pillar: string, questionIndex: number, value: number) => {
    setTestResponses(prev => ({
      ...prev,
      [pillar]: prev[pillar].map((val, idx) => idx === questionIndex ? value : val)
    }));
  };

  const getPillarName = (pillarId: string): string => {
    const pillar = allPillars.find(p => p.id === pillarId);
    return pillar ? `${pillar.emoji} ${pillar.name}` : pillarId;
  };

  const globalScore = showSimulation ? calculateGlobalScoreWithQuestionCoefficients(testResponses) : 0;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQuestionsByPillar = (pillarId: string) => {
    const defaultQuestions = allQuestions.find(p => p.pillar === pillarId)?.questions || [];
    const customPillarQuestions = customQuestions
      .filter(q => q.pillar === pillarId)
      .map(q => q.question);
    
    return [...defaultQuestions, ...customPillarQuestions];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Aperçu du Questionnaire</h2>
          <p className="text-gray-600 mt-1">
            Visualisez et testez votre questionnaire personnalisé
          </p>
        </div>
        {!showSimulation ? (
          <Button
            onClick={initializeTestResponses}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Play size={16} />
            Tester le questionnaire
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowSimulation(false)}
            className="flex items-center gap-2"
          >
            <Eye size={16} />
            Retour à l'aperçu
          </Button>
        )}
      </div>

      {!showSimulation ? (
        /* Vue d'aperçu statique */
        <div className="space-y-6">
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {allPillars.length}
                  </div>
                  <p className="text-sm text-gray-600">Piliers au total</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {allPillars.filter(p => p.id.startsWith('custom_')).length} personnalisés
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {allQuestions.reduce((total, p) => total + p.questions.length, 0) + customQuestions.length}
                  </div>
                  <p className="text-sm text-gray-600">Questions au total</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {customQuestions.length} personnalisées
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Object.keys(questionCoefficients).filter(k => 
                      questionCoefficients[k] !== 1.0
                    ).length}
                  </div>
                  <p className="text-sm text-gray-600">Coefficients modifiés</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Différents de 1.0x
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Structure du questionnaire */}
          <div className="space-y-4">
            {allPillars.map(pillar => {
              const questions = getQuestionsByPillar(pillar.id);
              if (questions.length === 0) return null;

              return (
                <Card key={pillar.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">{pillar.emoji}</span>
                        {pillar.name}
                      </span>
                      <Badge variant="outline">
                        {questions.length} question(s)
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {questions.map((question, index) => {
                        const isCustom = index >= (allQuestions.find(p => p.pillar === pillar.id)?.questions.length || 0);
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${
                              isCustom 
                                ? 'border-l-blue-500 bg-blue-50' 
                                : 'border-l-gray-300 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <p className="text-sm flex-1">{question}</p>
                              <div className="flex items-center gap-2 ml-4">
                                {isCustom && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    Personnalisée
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  Coeff: {(questionCoefficients[`${pillar.id}_${index}`] || 1.0).toFixed(1)}x
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* Mode simulation */
        <div className="space-y-6">
          {/* Score global en temps réel */}
          <Card className="bg-gradient-to-br from-green-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Score Global Simulé</h3>
                <div className="relative mb-4">
                  <div className="w-32 h-32 mx-auto rounded-full border-8 border-gray-200 flex items-center justify-center bg-white">
                    <div className="text-center">
                      <span className={`text-3xl font-bold ${getScoreColor(globalScore)}`}>
                        {Math.round(globalScore)}
                      </span>
                      <div className="text-sm text-gray-500">%</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Modifiez les valeurs ci-dessous pour voir l'impact en temps réel
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scores par pilier */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPillars.map(pillar => {
              const questions = getQuestionsByPillar(pillar.id);
              if (questions.length === 0) return null;

              const pillarScore = calculatePillarScoreWithQuestionCoefficients(testResponses, pillar.id);
              
              return (
                <Card key={pillar.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{getPillarName(pillar.id)}</span>
                      <Badge className={getScoreColor(pillarScore).replace('text-', 'bg-').replace('-600', '-100')}>
                        {Math.round(pillarScore)}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {questions.map((question, index) => {
                        const currentValue = testResponses[pillar.id]?.[index] || 0;
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-start">
                              <p className="text-sm flex-1 pr-2">{question}</p>
                              <span className="text-sm font-medium text-gray-600 min-w-[40px]">
                                {currentValue}%
                              </span>
                            </div>
                            <Slider
                              value={[currentValue]}
                              onValueChange={([value]) => updateTestResponse(pillar.id, index, value)}
                              min={0}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Informations sur les coefficients */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Calculator size={20} className="text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h4 className="font-medium mb-2">Simulation en temps réel</h4>
                  <p>
                    Cette simulation utilise vos coefficients personnalisés pour calculer les scores.
                    Modifiez les valeurs pour voir comment vos réglages affectent le score global.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
