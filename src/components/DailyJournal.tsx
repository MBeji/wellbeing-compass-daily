
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { saveWellnessData, getWellnessData, getTodayKey, getAllQuestions, getPillarNames } from '@/utils/wellnessUtils';
import { useToast } from '@/hooks/use-toast';

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
        <Card key={pillar} className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {pillarNames[pillar] || pillar}
          </h3>
          
          <div className="space-y-6">
            {pillarQuestions.map((question: string, questionIndex: number) => {
              const value = responses[pillar]?.[questionIndex] || 50;
              
              return (
                <div key={questionIndex} className="space-y-4">
                  <div className="flex justify-between items-start">
                    <label className="text-gray-700 font-medium flex-1 pr-4">
                      {question}
                    </label>
                    <div className="text-right min-w-16">
                      <span className="text-2xl font-bold text-gray-800">{value}%</span>
                    </div>
                  </div>
                  
                  <div className="px-2">
                    <Slider
                      value={[value]}
                      onValueChange={(newValue) => updateResponse(pillar, questionIndex, newValue[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
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
