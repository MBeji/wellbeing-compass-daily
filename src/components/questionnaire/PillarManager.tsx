import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface CustomPillar {
  id: string;
  name: string;
  emoji: string;
  questions: string[];
}

interface CustomQuestion {
  id: string;
  pillar: string;
  question: string;
}

interface DefaultPillar {
  id: string;
  name: string;
  emoji: string;
}

interface PillarManagerProps {
  defaultPillars: DefaultPillar[];
  customPillars: CustomPillar[];
  customQuestions: CustomQuestion[];
  onPillarChange: (pillars: CustomPillar[]) => void;
  onQuestionChange: (questions: CustomQuestion[]) => void;
}

const emojiList = [
  '🎯', '💼', '🎨', '💰', '🏠', '🌱', '📚', '🎵', '🍳', '🧘',
  '🚀', '⭐', '🌟', '💎', '🔥', '⚡', '🌈', '🎪', '🎭', '🎨',
  '🏆', '🎖️', '🥇', '🏅', '👑', '💪', '🧠', '❤️', '🌸', '🌺'
];

export const PillarManager: React.FC<PillarManagerProps> = ({
  defaultPillars,
  customPillars,
  customQuestions,
  onPillarChange,
  onQuestionChange,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<CustomPillar | null>(null);
  const [newPillarName, setNewPillarName] = useState('');
  const [newPillarEmoji, setNewPillarEmoji] = useState('🎯');
  const [newPillarDescription, setNewPillarDescription] = useState('');
  const [showDefaultPillars, setShowDefaultPillars] = useState(true);
  const { toast } = useToast();

  const handleAddPillar = () => {
    if (!newPillarName.trim()) {
      toast({
        title: "❌ Erreur",
        description: "Le nom du pilier est obligatoire.",
        variant: "destructive"
      });
      return;
    }

    // Vérifier si le nom existe déjà
    const existingNames = [
      ...defaultPillars.map(p => p.name.toLowerCase()),
      ...customPillars.map(p => p.name.toLowerCase())
    ];
    
    if (existingNames.includes(newPillarName.toLowerCase())) {
      toast({
        title: "❌ Erreur",
        description: "Un pilier avec ce nom existe déjà.",
        variant: "destructive"
      });
      return;
    }

    const newPillar: CustomPillar = {
      id: `custom_${Date.now()}`,
      name: newPillarName.trim(),
      emoji: newPillarEmoji,
      questions: []
    };

    onPillarChange([...customPillars, newPillar]);
    
    // Reset form
    setNewPillarName('');
    setNewPillarEmoji('🎯');
    setNewPillarDescription('');
    setIsAddDialogOpen(false);
    
    toast({
      title: "✅ Pilier ajouté",
      description: `Le pilier "${newPillar.name}" a été créé avec succès.`,
    });
  };

  const handleEditPillar = (pillar: CustomPillar) => {
    const updatedPillars = customPillars.map(p => 
      p.id === pillar.id ? pillar : p
    );
    onPillarChange(updatedPillars);
    setEditingPillar(null);
    
    toast({
      title: "✅ Pilier modifié",
      description: `Le pilier "${pillar.name}" a été mis à jour.`,
    });
  };

  const handleDeletePillar = (pillarId: string) => {
    const pillarToDelete = customPillars.find(p => p.id === pillarId);
    const questionsInPillar = customQuestions.filter(q => q.pillar === pillarId);
    
    if (questionsInPillar.length > 0) {
      const confirmMessage = `Le pilier "${pillarToDelete?.name}" contient ${questionsInPillar.length} question(s). Voulez-vous vraiment le supprimer ? Toutes ses questions seront également supprimées.`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    // Supprimer le pilier
    const updatedPillars = customPillars.filter(p => p.id !== pillarId);
    onPillarChange(updatedPillars);
    
    // Supprimer les questions associées
    const updatedQuestions = customQuestions.filter(q => q.pillar !== pillarId);
    onQuestionChange(updatedQuestions);
    
    toast({
      title: "🗑️ Pilier supprimé",
      description: `Le pilier "${pillarToDelete?.name}" et ses questions ont été supprimés.`,
    });
  };

  const getQuestionCount = (pillarId: string) => {
    return customQuestions.filter(q => q.pillar === pillarId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Gestion des Piliers</h2>
          <p className="text-gray-600 mt-1">
            Créez et gérez vos domaines de bien-être personnalisés
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDefaultPillars(!showDefaultPillars)}
            className="flex items-center gap-2"
          >
            {showDefaultPillars ? <EyeOff size={16} /> : <Eye size={16} />}
            {showDefaultPillars ? 'Masquer' : 'Afficher'} les piliers par défaut
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Nouveau Pilier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un nouveau pilier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pillar-name">Nom du pilier *</Label>
                  <Input
                    id="pillar-name"
                    value={newPillarName}
                    onChange={(e) => setNewPillarName(e.target.value)}
                    placeholder="Ex: Créativité, Finances, Famille..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Emoji représentatif</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2 max-h-32 overflow-y-auto">
                    {emojiList.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewPillarEmoji(emoji)}
                        className={`p-2 text-xl rounded hover:bg-gray-100 ${
                          newPillarEmoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Sélectionné: <span className="text-xl">{newPillarEmoji}</span>
                  </p>
                </div>

                <div>
                  <Label htmlFor="pillar-description">Description (optionnelle)</Label>
                  <Textarea
                    id="pillar-description"
                    value={newPillarDescription}
                    onChange={(e) => setNewPillarDescription(e.target.value)}
                    placeholder="Décrivez brièvement ce pilier..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAddPillar}>
                    Créer le pilier
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Piliers par défaut */}
      {showDefaultPillars && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏛️ Piliers par défaut
              <Badge variant="secondary">Non modifiables</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {defaultPillars.map(pillar => (
                <div
                  key={pillar.id}
                  className="p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pillar.emoji}</span>
                    <div>
                      <h3 className="font-medium">{pillar.name}</h3>
                      <p className="text-sm text-gray-500">Pilier système</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Piliers personnalisés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ Mes piliers personnalisés
            <Badge>{customPillars.length} pilier(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customPillars.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plus size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Aucun pilier personnalisé</p>
              <p>Créez votre premier pilier pour commencer à personnaliser votre questionnaire.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customPillars.map(pillar => (
                <div
                  key={pillar.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pillar.emoji}</span>
                      <div>
                        <h3 className="font-medium">{pillar.name}</h3>
                        <p className="text-sm text-gray-500">
                          {getQuestionCount(pillar.id)} question(s) associée(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingPillar(pillar)}
                          >
                            <Edit2 size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Modifier le pilier</DialogTitle>
                          </DialogHeader>
                          {editingPillar && (
                            <PillarEditForm
                              pillar={editingPillar}
                              onSave={handleEditPillar}
                              onCancel={() => setEditingPillar(null)}
                              emojiList={emojiList}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePillar(pillar.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface PillarEditFormProps {
  pillar: CustomPillar;
  onSave: (pillar: CustomPillar) => void;
  onCancel: () => void;
  emojiList: string[];
}

const PillarEditForm: React.FC<PillarEditFormProps> = ({
  pillar,
  onSave,
  onCancel,
  emojiList,
}) => {
  const [name, setName] = useState(pillar.name);
  const [emoji, setEmoji] = useState(pillar.emoji);

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      ...pillar,
      name: name.trim(),
      emoji,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Nom du pilier</Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label>Emoji</Label>
        <div className="grid grid-cols-6 gap-2 mt-2 max-h-32 overflow-y-auto">
          {emojiList.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`p-2 text-xl rounded hover:bg-gray-100 ${
                emoji === e ? 'bg-blue-100 ring-2 ring-blue-500' : ''
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={!name.trim()}>
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};
