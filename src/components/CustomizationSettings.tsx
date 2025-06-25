
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { getCustomQuestions, saveCustomQuestions, getDefaultQuestions } from '@/utils/wellnessUtils';
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

const CustomizationSettings = () => {
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [customPillars, setCustomPillars] = useState<CustomPillar[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('');
  const [newPillarName, setNewPillarName] = useState('');
  const [newPillarEmoji, setNewPillarEmoji] = useState('');
  const [isAddingPillar, setIsAddingPillar] = useState(false);
  const { toast } = useToast();

  const defaultPillars = [
    'alimentation', 'sport', 'sommeil', 'stress', 'spiritualite', 'social'
  ];

  useEffect(() => {
    const { customQuestions: questions, customPillars: pillars } = getCustomQuestions();
    setCustomQuestions(questions);
    setCustomPillars(pillars);
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
    setIsAddingPillar(false);
    
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

  const resetToDefault = () => {
    setCustomQuestions([]);
    setCustomPillars([]);
    saveCustomQuestions([], []);
    
    toast({
      title: "Réinitialisé",
      description: "Les questions ont été remises aux valeurs par défaut."
    });
  };

  const allPillars = [...defaultPillars, ...customPillars.map(p => p.id)];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Personnalisation</h2>
        <p className="text-gray-600">Ajoutez vos propres questions et piliers pour personnaliser votre suivi</p>
      </div>

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
              {defaultPillars.map(pillar => (
                <option key={pillar} value={pillar}>{pillar}</option>
              ))}
              {customPillars.map(pillar => (
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
            {customQuestions.map(question => (
              <div key={question.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Pilier: {question.pillar}</p>
                  <p className="text-gray-800">{question.question}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

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
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePillar(pillar.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="text-center pt-6">
        <Button 
          onClick={resetToDefault}
          variant="outline"
          className="px-8 py-3"
        >
          Remettre aux valeurs par défaut
        </Button>
      </div>
    </div>
  );
};

export default CustomizationSettings;
