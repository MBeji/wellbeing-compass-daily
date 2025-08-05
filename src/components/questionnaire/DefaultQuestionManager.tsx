import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Plus, Trash2, RotateCcw, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getDefaultQuestions, 
  getModifiedDefaultQuestions, 
  saveModifiedDefaultQuestions,
  resetDefaultQuestions,
  getEffectiveDefaultQuestions
} from '@/utils/wellnessUtils';

interface DefaultQuestion {
  pillar: string;
  questions: string[];
}

interface DefaultQuestionManagerProps {
  onChange?: () => void;
}

export const DefaultQuestionManager: React.FC<DefaultQuestionManagerProps> = ({ onChange }) => {
  const [modifiedQuestions, setModifiedQuestions] = useState<Record<string, string[]>>({});
  const [editingPillar, setEditingPillar] = useState<string | null>(null);
  const [editingQuestions, setEditingQuestions] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const originalQuestions = getDefaultQuestions();
  const effectiveQuestions = getEffectiveDefaultQuestions();

  useEffect(() => {
    const saved = getModifiedDefaultQuestions();
    setModifiedQuestions(saved);
  }, []);

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

  const isModified = (pillarId: string): boolean => {
    return !!modifiedQuestions[pillarId];
  };

  const getModificationCount = (): number => {
    return Object.keys(modifiedQuestions).length;
  };

  const startEditing = (pillarId: string) => {
    const currentQuestions = effectiveQuestions.find(p => p.pillar === pillarId)?.questions || [];
    setEditingPillar(pillarId);
    setEditingQuestions([...currentQuestions]);
  };

  const cancelEditing = () => {
    setEditingPillar(null);
    setEditingQuestions([]);
  };

  const saveEditing = () => {
    if (!editingPillar) return;

    const originalPillarQuestions = originalQuestions.find(p => p.pillar === editingPillar)?.questions || [];
    const questionsChanged = JSON.stringify(editingQuestions) !== JSON.stringify(originalPillarQuestions);

    if (questionsChanged) {
      const newModified = {
        ...modifiedQuestions,
        [editingPillar]: [...editingQuestions]
      };
      setModifiedQuestions(newModified);
      setHasUnsavedChanges(true);
    } else {
      // Si les questions sont identiques à l'original, supprimer la modification
      const newModified = { ...modifiedQuestions };
      delete newModified[editingPillar];
      setModifiedQuestions(newModified);
      setHasUnsavedChanges(true);
    }

    setEditingPillar(null);
    setEditingQuestions([]);

    toast({
      title: "✅ Questions modifiées",
      description: `Les questions du pilier "${getPillarName(editingPillar)}" ont été mises à jour.`,
    });
  };

  const addQuestion = () => {
    setEditingQuestions([...editingQuestions, '']);
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...editingQuestions];
    newQuestions[index] = value;
    setEditingQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (editingQuestions.length <= 1) {
      toast({
        title: "❌ Erreur",
        description: "Un pilier doit avoir au moins une question.",
        variant: "destructive"
      });
      return;
    }
    const newQuestions = editingQuestions.filter((_, i) => i !== index);
    setEditingQuestions(newQuestions);
  };

  const saveAllChanges = () => {
    saveModifiedDefaultQuestions(modifiedQuestions);
    setHasUnsavedChanges(false);
    onChange?.();
    
    toast({
      title: "💾 Sauvegardé",
      description: "Toutes vos modifications ont été sauvegardées.",
    });
  };

  const resetAllToDefault = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les questions aux valeurs par défaut ? Cette action est irréversible.')) {
      resetDefaultQuestions();
      setModifiedQuestions({});
      setHasUnsavedChanges(false);
      onChange?.();
      
      toast({
        title: "🔄 Réinitialisé",
        description: "Toutes les questions ont été remises aux valeurs par défaut.",
      });
    }
  };

  const resetPillarToDefault = (pillarId: string) => {
    if (window.confirm(`Voulez-vous remettre les questions de "${getPillarName(pillarId)}" aux valeurs par défaut ?`)) {
      const newModified = { ...modifiedQuestions };
      delete newModified[pillarId];
      setModifiedQuestions(newModified);
      setHasUnsavedChanges(true);
      
      toast({
        title: "🔄 Pilier réinitialisé",
        description: `Les questions de "${getPillarName(pillarId)}" ont été remises par défaut.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Modification des Questions par Défaut</h2>
          <p className="text-gray-600 mt-1">
            Personnalisez les questions système selon vos besoins
          </p>
          {getModificationCount() > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              🔧 {getModificationCount()} pilier(s) modifié(s)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {getModificationCount() > 0 && (
            <Button
              variant="outline"
              onClick={resetAllToDefault}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <RotateCcw size={16} />
              Tout réinitialiser
            </Button>
          )}
          {hasUnsavedChanges && (
            <Button
              onClick={saveAllChanges}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save size={16} />
              Sauvegarder
            </Button>
          )}
        </div>
      </div>

      {hasUnsavedChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle size={16} />
              <span className="font-medium">
                Modifications non sauvegardées - N'oubliez pas de sauvegarder !
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {effectiveQuestions.map(({ pillar, questions }) => (
          <Card key={pillar} className={isModified(pillar) ? 'border-blue-200 bg-blue-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{getPillarName(pillar)}</span>
                  {isModified(pillar) && (
                    <Badge className="bg-blue-100 text-blue-800">Modifié</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {isModified(pillar) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetPillarToDefault(pillar)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <RotateCcw size={14} />
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(pillar)}
                        className="flex items-center gap-2"
                      >
                        <Edit2 size={14} />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Modifier les questions - {getPillarName(pillar)}
                        </DialogTitle>
                      </DialogHeader>
                      {editingPillar === pillar && (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            {editingQuestions.map((question, index) => (
                              <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                  <Textarea
                                    value={question}
                                    onChange={(e) => updateQuestion(index, e.target.value)}
                                    placeholder={`Question ${index + 1}...`}
                                    className="min-h-[60px]"
                                    rows={2}
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeQuestion(index)}
                                  disabled={editingQuestions.length <= 1}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-1"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            variant="outline"
                            onClick={addQuestion}
                            className="w-full flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Ajouter une question
                          </Button>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                              💡 <strong>Conseil :</strong> Formulez vos questions de manière à pouvoir y répondre 
                              par une note de 0 à 100%. Par exemple : "Ai-je..." ou "Dans quelle mesure ai-je..."
                            </p>
                          </div>

                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={cancelEditing}>
                              Annuler
                            </Button>
                            <Button 
                              onClick={saveEditing}
                              disabled={editingQuestions.some(q => !q.trim())}
                            >
                              Valider les modifications
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-gray-300">
                    <p className="text-sm">{question}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {questions.length} question(s) dans ce pilier
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <h4 className="font-medium mb-2">À propos des modifications</h4>
              <ul className="space-y-1 text-xs">
                <li>• Les questions modifiées remplacent les questions par défaut</li>
                <li>• Vos données historiques restent intactes</li>
                <li>• Vous pouvez toujours revenir aux questions d'origine</li>
                <li>• Les modifications sont sauvegardées localement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
