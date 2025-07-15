import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit3, Settings, Target, HelpCircle } from 'lucide-react';
import { 
  getCustomQuestions, 
  saveCustomQuestions, 
  getAllQuestions,
  getQuestionCoefficients,
  saveQuestionCoefficients,
  resetQuestionCoefficientsToDefault
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

const AdvancedCustomizationSettings = () => {
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [customPillars, setCustomPillars] = useState<CustomPillar[]>([]);
  const [questionCoefficients, setQuestionCoefficients] = useState<Record<string, number>>({});
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('');
  const [newPillarName, setNewPillarName] = useState('');
  const [newPillarEmoji, setNewPillarEmoji] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const { toast } = useToast();
  const defaultPillars = [
    { id: 'alimentation', name: 'Alimentation', emoji: '🍎' },
    { id: 'sport', name: 'Sport', emoji: '💪' },
    { id: 'sommeil', name: 'Sommeil', emoji: '😴' },
    { id: 'stress', name: 'Équilibre & Addictions', emoji: '⚖️' },
    { id: 'spiritualite', name: 'Spiritualité', emoji: '🙏' },
    { id: 'social', name: 'Social', emoji: '👥' }
  ];

  useEffect(() => {
    const { customQuestions: questions, customPillars: pillars } = getCustomQuestions();
    const coefficients = getQuestionCoefficients();
    
    setCustomQuestions(questions);
    setCustomPillars(pillars);
    setQuestionCoefficients(coefficients);
  }, []);

  const handleAddQuestion = () => {
    if (!newQuestion.trim() || !selectedPillar) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une question et sélectionner un pilier.",
        variant: "destructive"
      });
      return;
    }

    const question: CustomQuestion = {
      id: Date.now().toString(),
      pillar: selectedPillar,
      question: newQuestion.trim()
    };

    const updatedQuestions = [...customQuestions, question];
    setCustomQuestions(updatedQuestions);
    saveCustomQuestions(updatedQuestions, customPillars);
    
    setNewQuestion('');
    setSelectedPillar('');
    
    toast({
      title: "Question ajoutée",
      description: "Votre question personnalisée a été ajoutée avec succès."
    });
  };

  const handleAddPillar = () => {
    if (!newPillarName.trim() || !newPillarEmoji.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom et un emoji pour le pilier.",
        variant: "destructive"
      });
      return;
    }

    const pillar: CustomPillar = {
      id: Date.now().toString(),
      name: newPillarName.trim(),
      emoji: newPillarEmoji.trim(),
      questions: []
    };

    const updatedPillars = [...customPillars, pillar];
    setCustomPillars(updatedPillars);
    saveCustomQuestions(customQuestions, updatedPillars);
    
    setNewPillarName('');
    setNewPillarEmoji('');
    
    toast({
      title: "Pilier ajouté",
      description: "Votre nouveau pilier a été créé avec succès."
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = customQuestions.filter(q => q.id !== questionId);
    setCustomQuestions(updatedQuestions);
    saveCustomQuestions(updatedQuestions, customPillars);
    
    toast({
      title: "Question supprimée",
      description: "La question a été supprimée avec succès."
    });
  };

  const handleDeletePillar = (pillarId: string) => {
    const updatedPillars = customPillars.filter(p => p.id !== pillarId);
    const updatedQuestions = customQuestions.filter(q => q.pillar !== pillarId);
    
    setCustomPillars(updatedPillars);
    setCustomQuestions(updatedQuestions);
    saveCustomQuestions(updatedQuestions, updatedPillars);
    
    toast({
      title: "Pilier supprimé",
      description: "Le pilier et ses questions ont été supprimés."
    });
  };

  const handleEditQuestion = (questionId: string, newText: string) => {
    const updatedQuestions = customQuestions.map(q => 
      q.id === questionId ? { ...q, question: newText } : q
    );
    setCustomQuestions(updatedQuestions);
    saveCustomQuestions(updatedQuestions, customPillars);
    setEditingQuestion(null);
    setEditQuestionText('');
    
    toast({
      title: "Question modifiée",
      description: "La question a été mise à jour avec succès."
    });
  };

  const handleCoefficientChange = (questionKey: string, coefficient: number) => {
    const updatedCoefficients = { ...questionCoefficients, [questionKey]: coefficient };
    setQuestionCoefficients(updatedCoefficients);
    saveQuestionCoefficients(updatedCoefficients);
  };

  const resetToDefault = () => {
    setCustomQuestions([]);
    setCustomPillars([]);
    saveCustomQuestions([], []);
    resetQuestionCoefficientsToDefault();
    setQuestionCoefficients(getQuestionCoefficients());
    
    toast({
      title: "Réinitialisé",
      description: "Tout a été remis aux valeurs par défaut."
    });
  };

  const allQuestions = getAllQuestions();
  const allPillars = [...defaultPillars, ...customPillars.map(p => ({ id: p.id, name: p.name, emoji: p.emoji }))];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Personnalisation Avancée</h2>
        <p className="text-gray-600">Gérez vos piliers, questions et leurs coefficients d'importance</p>
      </div>

      <Tabs defaultValue="coefficients" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="coefficients" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Coefficients
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="pillars" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Piliers
          </TabsTrigger>
        </TabsList>

        {/* Onglet Coefficients */}
        <TabsContent value="coefficients" className="space-y-6">
          <Card className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">Coefficients d'Importance par Question</h3>
              <span className="w-4 h-4 text-gray-500 cursor-help" title="Ajustez l'importance de chaque question individuellement. Un coefficient plus élevé donne plus de poids à cette question dans le calcul du score global.">
                <HelpCircle className="w-4 h-4" />
              </span>
            </div>
            
            <div className="space-y-6">
              {allQuestions.map(({ pillar, questions }) => {
                const pillarInfo = allPillars.find(p => p.id === pillar);
                return (
                  <div key={pillar} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <span>{pillarInfo?.emoji}</span>
                      {pillarInfo?.name || pillar}
                    </h4>
                    
                    <div className="space-y-4">
                      {questions.map((question, index) => {
                        const questionKey = `${pillar}_${index}`;
                        const coefficient = questionCoefficients[questionKey] || 1.0;
                        
                        return (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm text-gray-700 flex-1 pr-4">{question}</span>
                              <span className="text-sm font-medium text-gray-900 min-w-16 text-right">
                                {coefficient.toFixed(1)}x
                              </span>
                            </div>
                            
                            <div className="px-2">
                              <Slider
                                value={[coefficient]}
                                onValueChange={(value) => handleCoefficientChange(questionKey, value[0])}
                                max={2.0}
                                min={0.1}
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
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              <div className="text-center pt-4">
                <Button 
                  onClick={() => {
                    resetQuestionCoefficientsToDefault();
                    setQuestionCoefficients(getQuestionCoefficients());
                    toast({ title: "Coefficients réinitialisés", description: "Tous les coefficients ont été remis à 1.0" });
                  }}
                  variant="outline"
                >
                  Remettre tous les coefficients à 1.0
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Questions */}
        <TabsContent value="questions" className="space-y-6">
          {/* Ajouter une nouvelle question */}
          <Card className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Ajouter une question personnalisée
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="pillar-select">Pilier</Label>
                <select
                  id="pillar-select"
                  value={selectedPillar}
                  onChange={(e) => setSelectedPillar(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionner un pilier...</option>
                  {allPillars.map(pillar => (
                    <option key={pillar.id} value={pillar.id}>
                      {pillar.emoji} {pillar.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="new-question">Question</Label>
                <Textarea
                  id="new-question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Formulez votre question personnalisée..."
                  rows={3}
                />
              </div>
              
              <Button onClick={handleAddQuestion} className="w-full">
                Ajouter la question
              </Button>
            </div>
          </Card>

          {/* Liste des questions personnalisées */}
          {customQuestions.length > 0 && (
            <Card className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Questions personnalisées</h3>
              <div className="space-y-3">
                {customQuestions.map(question => {
                  const pillarInfo = allPillars.find(p => p.id === question.pillar);
                  return (
                    <div key={question.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">
                          {pillarInfo?.emoji} {pillarInfo?.name || question.pillar}
                        </p>
                        {editingQuestion === question.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editQuestionText}
                              onChange={(e) => setEditQuestionText(e.target.value)}
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleEditQuestion(question.id, editQuestionText)}
                              >
                                Sauvegarder
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setEditingQuestion(null);
                                  setEditQuestionText('');
                                }}
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-800">{question.question}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingQuestion(question.id);
                            setEditQuestionText(question.question);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Piliers */}
        <TabsContent value="pillars" className="space-y-6">
          {/* Ajouter un nouveau pilier */}
          <Card className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créer un nouveau pilier
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pillar-name">Nom du pilier</Label>
                  <Input
                    id="pillar-name"
                    value={newPillarName}
                    onChange={(e) => setNewPillarName(e.target.value)}
                    placeholder="ex: Créativité, Finances..."
                  />
                </div>
                <div>
                  <Label htmlFor="pillar-emoji">Emoji</Label>
                  <Input
                    id="pillar-emoji"
                    value={newPillarEmoji}
                    onChange={(e) => setNewPillarEmoji(e.target.value)}
                    placeholder="🎨"
                    maxLength={2}
                  />
                </div>
              </div>
              
              <Button onClick={handleAddPillar} className="w-full">
                Créer le pilier
              </Button>
            </div>
          </Card>

          {/* Liste des piliers personnalisés */}
          {customPillars.length > 0 && (
            <Card className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Piliers personnalisés</h3>
              <div className="space-y-3">
                {customPillars.map(pillar => (
                  <div key={pillar.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <p className="text-gray-800">{pillar.emoji} {pillar.name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeletePillar(pillar.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions globales */}
      <div className="text-center pt-6 border-t">
        <Button 
          onClick={resetToDefault}
          variant="outline"
          className="px-8 py-3"
        >
          Remettre tout aux valeurs par défaut
        </Button>
      </div>
    </div>
  );
};

export default AdvancedCustomizationSettings;
