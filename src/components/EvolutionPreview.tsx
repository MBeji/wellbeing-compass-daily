import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { 
  getWellnessData, 
  calculateGlobalScoreWithQuestionCoefficients 
} from '@/utils/wellnessUtils';

interface EvolutionPreviewProps {
  onViewFullChart: () => void;
  currentData?: any;
}

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  globalScore: number;
}

const EvolutionPreview = ({ onViewFullChart, currentData }: EvolutionPreviewProps) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [trend, setTrend] = useState<{ value: number; isPositive: boolean }>({ value: 0, isPositive: true });

  const generateDateRange = (days: number): string[] => {
    const dates = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const formatDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  useEffect(() => {
    const wellnessData = getWellnessData();
    const dateRange = generateDateRange(7);
    
    const data: ChartDataPoint[] = dateRange.map(date => ({
      date,
      dateLabel: formatDateLabel(date),
      globalScore: wellnessData[date] ? calculateGlobalScoreWithQuestionCoefficients(wellnessData[date]) : 0
    }));
    
    setChartData(data);

    // Calculer la tendance
    const validData = data.filter(d => d.globalScore > 0);
    if (validData.length >= 2) {
      const firstScore = validData[0].globalScore;
      const lastScore = validData[validData.length - 1].globalScore;
      const difference = lastScore - firstScore;
      
      setTrend({
        value: Math.round(difference),
        isPositive: difference >= 0
      });
    }
  }, []);

  const hasData = chartData.some(d => d.globalScore > 0);

  if (!hasData) {
    return (
      <Card className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Évolution des 7 derniers jours
          </h3>
        </div>
        
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
          </div>
          <p className="text-gray-600 mb-4">
            Pas encore de données pour afficher l'évolution
          </p>
          <p className="text-sm text-gray-500">
            Commencez à remplir votre journal quotidien pour voir vos tendances
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Évolution des 7 derniers jours
        </h3>
        
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
          trend.isPositive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {trend.isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {trend.isPositive ? '+' : ''}{trend.value}%
        </div>
      </div>

      {/* Mini graphique */}
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="dateLabel" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
            />
            <YAxis hide domain={[0, 100]} />
            <Line
              type="monotone"
              dataKey="globalScore"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 1, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">
            {Math.round(chartData.filter(d => d.globalScore > 0).reduce((sum, d) => sum + d.globalScore, 0) / 
                        chartData.filter(d => d.globalScore > 0).length)}%
          </div>
          <div className="text-xs text-gray-600">Score moyen</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">
            {Math.max(...chartData.map(d => d.globalScore))}%
          </div>
          <div className="text-xs text-gray-600">Meilleur score</div>
        </div>
      </div>

      <Button 
        onClick={onViewFullChart}
        variant="outline"
        className="w-full"
      >
        Voir le graphique complet
      </Button>
    </Card>
  );
};

export default EvolutionPreview;
