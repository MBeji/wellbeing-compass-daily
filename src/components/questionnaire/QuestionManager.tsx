import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getAllQuestions } from '@/utils/wellnessUtils';

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

interface QuestionManagerProps {
  allPillars: Pillar[];
  customQuestions: CustomQuestion[];
  onChange: (questions: CustomQuestion[]) => void;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({
  allPillars,
  customQuestions,
  onChange,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionPillar, setNewQuestionPillar] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPillar, setFilterPillar] = useState('all');
  const { toast } = useToast();

  const defaultQuestions = getAllQuestions();

  const handleAddQuestion = () => {
    if (!newQuestionText.trim() || !newQuestionPillar) {
      toast({
        title: "❌ Erreur",
        description: "Veuillez saisir une question et sélectionner un pilier.",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: CustomQuestion = {
      id: `custom_${Date.now()}`,
      pillar: newQuestionPillar,
      question: newQuestionText.trim()
    };

    onChange([...customQuestions, newQuestion]);
    
    // Reset form
    setNewQuestionText('');
    setNewQuestionPillar('');
    setIsAddDialogOpen(false);
    
    toast({
      title: "✅ Question ajoutée",
      description: "Votre question personnalisée a été créée avec succès.",
    });
  };

  const handleEditQuestion = (updatedQuestion: CustomQuestion) => {
    const updatedQuestions = customQuestions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    onChange(updatedQuestions);
    setEditingQuestion(null);
    
    toast({
      title: "✅ Question modifiée",
      description: "La question a été mise à jour avec succès.",
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    const questionToDelete = customQuestions.find(q => q.id === questionId);
    if (window.confirm(`Voulez-vous vraiment supprimer cette question ?\n\n"${questionToDelete?.question}"`)) {
      const updatedQuestions = customQuestions.filter(q => q.id !== questionId);
      onChange(updatedQuestions);
      
      toast({
        title: "🗑️ Question supprimée",
        description: "La question a été supprimée avec succès.",
      });
    }
  };

  const getPillarInfo = (pillarId: string) => {
    return allPillars.find(p => p.id === pillarId) || { name: 'Pilier inconnu', emoji: '❓' };
  };

  const getQuestionsByPillar = (pillarId: string) => {
    return customQuestions.filter(q => q.pillar === pillarId);
  };

  const filteredQuestions = customQuestions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPillar = filterPillar === 'all' || question.pillar === filterPillar;
    return matchesSearch && matchesPillar;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Gestion des Questions</h2>
          <p className="text-gray-600 mt-1">
            Créez et gérez vos questions personnalisées pour chaque pilier
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Nouvelle Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle question</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question-pillar">Pilier de rattachement *</Label>
                <Select value={newQuestionPillar} onValueChange={setNewQuestionPillar}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionnez un pilier" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPillars.map(pillar => (
                      <SelectItem key={pillar.id} value={pillar.id}>
                        <div className="flex items-center gap-2">
                          <span>{pillar.emoji}</span>
                          <span>{pillar.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="question-text">Question *</Label>
                <Textarea
                  id="question-text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Ex: Ai-je pratiqué une activité créative aujourd'hui ?"
                  className="mt-1"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Formulez votre question de manière à pouvoir y répondre par une note de 0 à 100%
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleAddQuestion}>
                  Créer la question
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher dans les questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={filterPillar} onValueChange={setFilterPillar}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <span>Tous les piliers</span>
                    </div>
                  </SelectItem>
                  {allPillars.map(pillar => (
                    <SelectItem key={pillar.id} value={pillar.id}>
                      <div className="flex items-center gap-2">
                        <span>{pillar.emoji}</span>
                        <span>{pillar.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions par défaut */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Questions par défaut
            <Badge variant="secondary">Non modifiables</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {defaultQuestions.map(({ pillar, questions }) => {
              const pillarInfo = getPillarInfo(pillar);
              return (
                <div key={pillar} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <span className="text-xl">{pillarInfo.emoji}</span>
                    {pillarInfo.name}
                    <Badge variant="outline">{questions.length} question(s)</Badge>
                  </h3>
                  <div className="space-y-2">
                    {questions.map((question, index) => (
                      <div key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-gray-300">
                        {question}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Questions personnalisées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ Mes questions personnalisées
            <Badge>{customQuestions.length} question(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plus size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Aucune question personnalisée</p>
              <p>Créez votre première question pour enrichir votre questionnaire.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {allPillars.map(pillar => {
                const pillarQuestions = getQuestionsByPillar(pillar.id);
                if (pillarQuestions.length === 0) return null;

                return (
                  <div key={pillar.id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <span className="text-xl">{pillar.emoji}</span>
                      {pillar.name}
                      <Badge variant="outline">{pillarQuestions.length} question(s)</Badge>
                    </h3>
                    <div className="space-y-3">
                      {pillarQuestions
                        .filter(q => 
                          q.question.toLowerCase().includes(searchTerm.toLowerCase()) &&
                          (filterPillar === 'all' || q.pillar === filterPillar)
                        )
                        .map(question => (
                        <div
                          key={question.id}
                          className="flex items-start justify-between p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-sm">{question.question}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingQuestion(question)}
                                >
                                  <Edit2 size={14} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>Modifier la question</DialogTitle>
                                </DialogHeader>
                                {editingQuestion && (
                                  <QuestionEditForm
                                    question={editingQuestion}
                                    allPillars={allPillars}
                                    onSave={handleEditQuestion}
                                    onCancel={() => setEditingQuestion(null)}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {filteredQuestions.length === 0 && searchTerm && (
                <div className="text-center py-8 text-gray-500">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Aucune question trouvée</p>
                  <p>Essayez de modifier votre recherche ou vos filtres.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface QuestionEditFormProps {
  question: CustomQuestion;
  allPillars: Pillar[];
  onSave: (question: CustomQuestion) => void;
  onCancel: () => void;
}

const QuestionEditForm: React.FC<QuestionEditFormProps> = ({
  question,
  allPillars,
  onSave,
  onCancel,
}) => {
  const [text, setText] = useState(question.question);
  const [pillar, setPillar] = useState(question.pillar);

  const handleSave = () => {
    if (!text.trim()) return;
    
    onSave({
      ...question,
      question: text.trim(),
      pillar,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-pillar">Pilier</Label>
        <Select value={pillar} onValueChange={setPillar}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allPillars.map(p => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  <span>{p.emoji}</span>
                  <span>{p.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="edit-text">Question</Label>
        <Textarea
          id="edit-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={!text.trim()}>
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};
