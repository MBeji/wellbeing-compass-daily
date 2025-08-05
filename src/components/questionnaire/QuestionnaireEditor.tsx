import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RotateCcw, Eye, Settings2 } from 'lucide-react';
import { PillarManager } from './PillarManager';
import { QuestionManager } from './QuestionManager';
import { DefaultQuestionManager } from './DefaultQuestionManager';
import { 
  getCustomQuestions, 
  saveCustomQuestions,
  getQuestionCoefficients,
  saveQuestionCoefficients,
  resetQuestionCoefficientsToDefault,
  getAllQuestions
} from '@/utils/wellnessUtils';
import { useToast } from '@/hooks/use-toast';

interface CustomQuestion {
  id: string;
  pillar: string;
  question: string;
}

interface CustomPillar {
  id: string;
  name: string;
  emoji: string;
  questions: string[];
}

const QuestionnaireEditor: React.FC = () => {
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [customPillars, setCustomPillars] = useState<CustomPillar[]>([]);
  const [questionCoefficients, setQuestionCoefficients] = useState<Record<string, number>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('pillars');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const { customQuestions: questions, customPillars: pillars } = getCustomQuestions();
    const coefficients = getQuestionCoefficients();
    
    setCustomQuestions(questions);
    setCustomPillars(pillars);
    setQuestionCoefficients(coefficients);
    setHasUnsavedChanges(false);
  };

  const handleSaveAll = () => {
    try {
      saveCustomQuestions(customQuestions, customPillars);
      saveQuestionCoefficients(questionCoefficients);
      setHasUnsavedChanges(false);
      
      toast({
        title: "✅ Sauvegardé",
        description: "Toutes vos modifications ont été sauvegardées avec succès.",
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Erreur lors de la sauvegarde. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      setCustomQuestions([]);
      setCustomPillars([]);
      saveCustomQuestions([], []);
      resetQuestionCoefficientsToDefault();
      setQuestionCoefficients(getQuestionCoefficients());
      setHasUnsavedChanges(false);
      
      toast({
        title: "🔄 Réinitialisé",
        description: "Toutes les données ont été remises aux valeurs par défaut.",
      });
    }
  };

  const handlePillarChange = (pillars: CustomPillar[]) => {
    setCustomPillars(pillars);
    setHasUnsavedChanges(true);
  };

  const handleQuestionChange = (questions: CustomQuestion[]) => {
    setCustomQuestions(questions);
    setHasUnsavedChanges(true);
  };

  const handleCoefficientChange = (coefficients: Record<string, number>) => {
    setQuestionCoefficients(coefficients);
    setHasUnsavedChanges(true);
  };

  const defaultPillars = [
    { id: 'alimentation', name: 'Alimentation', emoji: '🥗' },
    { id: 'sport', name: 'Sport', emoji: '💪' },
    { id: 'sommeil', name: 'Sommeil', emoji: '😴' },
    { id: 'stress', name: 'Équilibre & Addictions', emoji: '⚖️' },
    { id: 'spiritualite', name: 'Spiritualité', emoji: '🕌' },
    { id: 'social', name: 'Social', emoji: '❤️' }
  ];

  const allPillars = [...defaultPillars, ...customPillars.map(p => ({ 
    id: p.id, 
    name: p.name, 
    emoji: p.emoji 
  }))];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🛠️ Éditeur de Questionnaire
          </h1>
          <p className="text-gray-600">
            Personnalisez entièrement vos piliers, questions et coefficients d'importance
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleResetAll}
            className="flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Réinitialiser
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Save size={16} />
            Sauvegarder {hasUnsavedChanges && '•'}
          </Button>
        </div>
      </div>

      {/* Warning for unsaved changes */}
      {hasUnsavedChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-700">
              <Settings2 size={16} />
              <span className="font-medium">
                Modifications non sauvegardées - N'oubliez pas de sauvegarder vos changements !
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pillars" className="flex items-center gap-2">
            🏛️ Piliers ({allPillars.length})
          </TabsTrigger>
          <TabsTrigger value="default-questions" className="flex items-center gap-2">
            📋 Questions système
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            ✨ Questions perso ({customQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="coefficients" className="flex items-center gap-2">
            ⚖️ Coefficients
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye size={16} />
            Aperçu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pillars" className="mt-6">
          <PillarManager
            defaultPillars={defaultPillars}
            customPillars={customPillars}
            customQuestions={customQuestions}
            onPillarChange={handlePillarChange}
            onQuestionChange={handleQuestionChange}
          />
        </TabsContent>

        <TabsContent value="default-questions" className="mt-6">
          <DefaultQuestionManager
            onChange={() => setHasUnsavedChanges(true)}
          />
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <QuestionManager
            allPillars={allPillars}
            customQuestions={customQuestions}
            onChange={handleQuestionChange}
          />
        </TabsContent>

        <TabsContent value="coefficients" className="mt-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Gestionnaire de coefficients en cours de développement...</p>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Mode aperçu en cours de développement...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionnaireEditor;
