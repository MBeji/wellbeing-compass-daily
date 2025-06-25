
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { saveWellnessData, getWellnessData, getTodayKey } from '@/utils/wellnessUtils';
import { useToast } from '@/hooks/use-toast';

interface DailyJournalProps {
  onSave: () => void;
}

const questions = [
  {
    pillar: 'alimentation',
    questions: [
      'Ai-je évité le sucre, le pain blanc et les aliments transformés ?',
      'Ai-je consommé suffisamment de légumes, fruits et de l\'eau ?',
      'Ai-je consommé assez de protéines aujourd\'hui ?'
    ]
  },
  {
    pillar: 'sport',
    questions: [
      'Ai-je fait une séance de sport aujourd\'hui ?'
    ]
  },
  {
    pillar: 'sommeil',
    questions: [
      'Ai-je bien dormi (quantité et qualité) ?'
    ]
  },
  {
    pillar: 'stress',
    questions: [
      'Ai-je bien géré mon temps d\'écran ?',
      'Ai-je protégé mes 5 sens (langue, yeux, pensées, etc.) ?'
    ]
  },
  {
    pillar: 'spiritualite',
    questions: [
      'Ai-je accompli mes 5 prières à l\'heure, dont 3 en groupe ?',
      'Ai-je respecté mon programme de Coran (lecture, mémorisation) ?',
      'Ai-je récité les doâs du matin et du soir ?'
    ]
  },
  {
    pillar: 'social',
    questions: [
      'Ai-je été utile à ma famille ou mon entourage ?',
      'Ai-je aidé quelqu\'un aujourd\'hui (même petit geste) ?',
      'Ai-je été bienveillant dans mes interactions ?'
    ]
  }
];

const pillarNames = {
  alimentation: 'Alimentation 🥗',
  sport: 'Sport 💪',
  sommeil: 'Sommeil 😴',
  stress: 'Stress / Équilibre 🧘',
  spiritualite: 'Spiritualité 🕌',
  social: 'Social ❤️'
};

const DailyJournal = ({ onSave }: DailyJournalProps) => {
  const [responses, setResponses] = useState<Record<string, number[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    const data = getWellnessData();
    const todayKey = getTodayKey();
    const todayData = data[todayKey];
    
    if (todayData) {
      setResponses(todayData);
    } else {
      // Initialize with default values
      const initialResponses: Record<string, number[]> = {};
      questions.forEach(({ pillar, questions: pillarQuestions }) => {
        initialResponses[pillar] = new Array(pillarQuestions.length).fill(50);
      });
      setResponses(initialResponses);
    }
  }, []);

  const updateResponse = (pillar: string, questionIndex: number, value: number) => {
    setResponses(prev => ({
      ...prev,
      [pillar]: prev[pillar] ? 
        prev[pillar].map((v, i) => i === questionIndex ? value : v) :
        new Array(questions.find(q => q.pillar === pillar)?.questions.length || 1).fill(50).map((v, i) => i === questionIndex ? value : v)
    }));
  };

  const handleSave = () => {
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
      </div>

      {questions.map(({ pillar, questions: pillarQuestions }) => (
        <Card key={pillar} className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {pillarNames[pillar as keyof typeof pillarNames]}
          </h3>
          
          <div className="space-y-6">
            {pillarQuestions.map((question, questionIndex) => {
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
          onClick={handleSave}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg"
        >
          Sauvegarder mon évaluation
        </Button>
      </div>
    </div>
  );
};

export default DailyJournal;
