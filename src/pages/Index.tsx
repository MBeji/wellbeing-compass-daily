
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp } from 'lucide-react';
import WellnessScore from '@/components/WellnessScore';
import PillarCards from '@/components/PillarCards';
import DailyJournal from '@/components/DailyJournal';
import { getWellnessData, getTodayKey } from '@/utils/wellnessUtils';

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [wellnessData, setWellnessData] = useState(null);

  useEffect(() => {
    const data = getWellnessData();
    setWellnessData(data);
  }, []);

  const refreshData = () => {
    const data = getWellnessData();
    setWellnessData(data);
  };

  const todayKey = getTodayKey();
  const todayData = wellnessData?.[todayKey];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mon Bien-être</h1>
            <p className="text-gray-600">Suivi quotidien de votre équilibre de vie</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Aujourd'hui</p>
            <p className="text-lg font-semibold text-gray-700">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setCurrentView('dashboard')}
            variant={currentView === 'dashboard' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </Button>
          <Button
            onClick={() => setCurrentView('journal')}
            variant={currentView === 'journal' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Journal du jour
          </Button>
        </div>

        {/* Content */}
        {currentView === 'dashboard' ? (
          <div className="space-y-8">
            {/* Global Score */}
            <WellnessScore data={todayData} />
            
            {/* Pillar Cards */}
            <PillarCards data={todayData} />
            
            {/* Quick Action */}
            <Card className="p-6 text-center bg-white/70 backdrop-blur border-0 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Commencer votre évaluation quotidienne
              </h3>
              <p className="text-gray-600 mb-4">
                Prenez quelques minutes pour évaluer votre bien-être d'aujourd'hui
              </p>
              <Button 
                onClick={() => setCurrentView('journal')}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Ouvrir le journal
              </Button>
            </Card>
          </div>
        ) : (
          <DailyJournal onSave={refreshData} />
        )}
      </div>
    </div>
  );
};

export default Index;
