
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { saveWellnessData, getWellnessData, getTodayKey, getAllQuestions, getPillarNames } from '@/utils/wellnessUtils';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseWellness } from '@/hooks/useFirebaseWellness';
import PillarSection from './PillarSection';

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface DailyJournalProps {
  onSave: () => void;
}

const DailyJournal = ({ onSave }: DailyJournalProps) => {
  const [responses, setResponses] = useState<Record<string, number[]>>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [pillarNames, setPillarNames] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { wellnessData, saveWellnessData: saveToFirebase, syncing, isOnline } = useFirebaseWellness();  // Debounced auto-save function
  const debouncedSave = useCallback(
    debounce(async (data: Record<string, number[]>) => {
      try {
        // Toujours sauvegarder en localStorage d'abord
        saveWellnessData(data);
        
        // Puis essayer Firebase si disponible
        if (isOnline && saveToFirebase) {
          await saveToFirebase(data);
        }
        
        onSave();
        console.log('Auto-sauvegarde effectuée');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        // En cas d'erreur Firebase, au moins localStorage fonctionne
      }
    }, 1000),
    [onSave, isOnline, saveToFirebase]
  );useEffect(() => {
    // Charger les questions (par défaut + personnalisées)
    const allQuestions = getAllQuestions();
    const allPillarNames = getPillarNames();
    
    setQuestions(allQuestions);
    setPillarNames(allPillarNames);

    // Ne charger les données qu'une seule fois au montage du composant
    const data = getWellnessData(); // Toujours utiliser localStorage pour l'initialisation
    const todayKey = getTodayKey();
    const todayData = data[todayKey];
    
    if (todayData) {
      setResponses(todayData);
    } else {
      // Initialize with default values
      const initialResponses: Record<string, number[]> = {};
      allQuestions.forEach(({ pillar, questions: pillarQuestions }) => {
        initialResponses[pillar] = new Array(pillarQuestions.length).fill(50);
      });
      setResponses(initialResponses);
    }
  }, []); // Retour à la dépendance vide pour éviter les re-rendus

  // Auto-save when responses change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      debouncedSave(responses);
    }
  }, [responses, debouncedSave]);

  const updateResponse = (pillar: string, questionIndex: number, value: number) => {
    setResponses(prev => ({
      ...prev,
      [pillar]: prev[pillar] ? 
        prev[pillar].map((v, i) => i === questionIndex ? value : v) :
        new Array(questions.find(q => q.pillar === pillar)?.questions.length || 1).fill(50).map((v, i) => i === questionIndex ? value : v)
    }));
  };  const handleManualSave = async () => {
    try {
      // Toujours sauvegarder en localStorage
      saveWellnessData(responses);
      
      // Puis essayer Firebase si disponible
      if (isOnline && saveToFirebase) {
        await saveToFirebase(responses);
      }
      
      onSave();
      toast({
        title: "Données sauvegardées",
        description: isOnline 
          ? "Votre évaluation quotidienne a été sauvegardée localement et synchronisée dans le cloud." 
          : "Votre évaluation quotidienne a été enregistrée localement.",
      });
    } catch (error) {
      toast({
        title: "Sauvegarde partielle",
        description: "Les données ont été sauvegardées localement, mais la synchronisation cloud a échoué.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Journal Quotidien</h2>
        <p className="text-gray-600">Évaluez chaque aspect de votre bien-être sur une échelle de 0 à 100%</p>
        <p className="text-sm text-green-600 mt-2">
          {syncing ? "🔄 Synchronisation en cours..." : 
           isOnline ? "✓ Sauvegarde automatique dans le cloud" : 
           "✓ Sauvegarde automatique locale"}
        </p>
      </div>

      {questions.map(({ pillar, questions: pillarQuestions }) => (
        <PillarSection
          key={pillar}
          pillar={pillar}
          pillarName={pillarNames[pillar] || pillar}
          questions={pillarQuestions}
          responses={responses[pillar] || []}
          onResponseChange={(questionIndex, value) => updateResponse(pillar, questionIndex, value)}
        />
      ))}

      <div className="text-center pt-6">        <Button 
          onClick={handleManualSave}
          disabled={syncing}
          className="px-8 py-3 text-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {syncing ? "Sauvegarde..." : "Sauvegarder manuellement"}
        </Button>        <p className="text-xs text-gray-500 mt-2">
          {isOnline 
            ? "Les données sont automatiquement sauvegardées dans le cloud pendant la saisie" 
            : "Les données sont automatiquement sauvegardées localement pendant la saisie"
          }
        </p>
      </div>
    </div>
  );
};

export default DailyJournal;
