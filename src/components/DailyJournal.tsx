
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { saveWellnessData, getWellnessData, getTodayKey, getAllQuestions, getPillarNames } from '@/utils/wellnessUtils';
import { useToast } from '@/hooks/use-toast';
import PillarSection from './PillarSection';

interface DailyJournalProps {
  onSave: () => void;
}

const DailyJournal = ({ onSave }: DailyJournalProps) => {
  const [responses, setResponses] = useState<Record<string, number[]>>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [pillarNames, setPillarNames] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Debounced auto-save function
  const debouncedSave = useCallback(
    debounce((data: Record<string, number[]>) => {
      saveWellnessData(data);
      onSave();
      console.log('Auto-sauvegarde effectuée');
    }, 1000),
    [onSave]
  );

  useEffect(() => {
    // Charger les questions (par défaut + personnalisées)
    const allQuestions = getAllQuestions();
    const allPillarNames = getPillarNames();
    
    setQuestions(allQuestions);
    setPillarNames(allPillarNames);

    const data = getWellnessData();
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
  }, []);

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
  };

  const handleManualSave = () => {
    saveWellnessData(responses);
    onSave();
    toast({
      title: "Données sauvegardées",
      description: "Votre évaluation quotidienne a été enregistrée avec succès.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Journal Quotidien</h2>
        <p className="text-gray-600">Évaluez chaque aspect de votre bien-être sur une échelle de 0 à 100%</p>
        <p className="text-sm text-green-600 mt-2">✓ Sauvegarde automatique activée</p>
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

      <div className="text-center pt-6">
        <Button 
          onClick={handleManualSave}
          variant="outline"
          className="px-8 py-3 text-lg"
        >
          Sauvegarder manuellement
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Les données sont automatiquement sauvegardées pendant la saisie
        </p>
      </div>
    </div>
  );
};

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

export default DailyJournal;
