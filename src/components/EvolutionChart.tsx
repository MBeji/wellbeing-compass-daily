import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { 
  getWellnessData, 
  calculateGlobalScoreWithQuestionCoefficients,
  calculatePillarScoreWithQuestionCoefficients,
  getAllQuestions 
} from '@/utils/wellnessUtils';
import EvolutionInsights from './EvolutionInsights';

interface EvolutionChartProps {
  currentData?: any;
}

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  globalScore: number;
  [key: string]: any; // Pour les scores des piliers
}

const EvolutionChart = ({ currentData }: EvolutionChartProps) => {
  const [period, setPeriod] = useState<7 | 30>(7);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [showPillars, setShowPillars] = useState(false);

  // Couleurs pour les piliers
  const pillarColors = {
    alimentation: '#10B981', // Green
    sport: '#F59E0B', // Orange
    sommeil: '#8B5CF6', // Purple
    stress: '#3B82F6', // Blue
    spiritualite: '#EF4444', // Red
    social: '#EC4899' // Pink
  };

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
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Aujourd\'hui';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  useEffect(() => {
    const wellnessData = getWellnessData();
    const dateRange = generateDateRange(period);
    const allQuestions = getAllQuestions();
    const uniquePillars = [...new Set(allQuestions.map(q => q.pillar))];
    
    const data: ChartDataPoint[] = dateRange.map(date => {
      const dayData = wellnessData[date];
      const dataPoint: ChartDataPoint = {
        date,
        dateLabel: formatDateLabel(date),
        globalScore: dayData ? calculateGlobalScoreWithQuestionCoefficients(dayData) : 0
      };
      
      // Ajouter les scores par pilier
      uniquePillars.forEach(pillar => {
        dataPoint[pillar] = dayData ? calculatePillarScoreWithQuestionCoefficients(dayData, pillar) : 0;
      });
      
      return dataPoint;
    });
    
    setChartData(data);
  }, [period]);

  const getAverageScore = (): number => {
    const scores = chartData.filter(d => d.globalScore > 0).map(d => d.globalScore);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  };

  const getTrend = (): { value: number; isPositive: boolean } => {
    const validData = chartData.filter(d => d.globalScore > 0);
    if (validData.length < 2) return { value: 0, isPositive: true };
    
    const firstScore = validData[0].globalScore;
    const lastScore = validData[validData.length - 1].globalScore;
    const difference = lastScore - firstScore;
    
    return {
      value: Math.round(difference),
      isPositive: difference >= 0
    };
  };

  const getBestDay = (): { date: string; score: number } | null => {
    const validData = chartData.filter(d => d.globalScore > 0);
    if (validData.length === 0) return null;
    
    const best = validData.reduce((prev, current) => 
      prev.globalScore > current.globalScore ? prev : current
    );
    
    return { date: best.dateLabel, score: best.globalScore };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.name === 'globalScore' ? 'Score Global' : 
                 entry.name.charAt(0).toUpperCase() + entry.name.slice(1)} : {entry.value}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const allQuestions = getAllQuestions();
  const uniquePillars = [...new Set(allQuestions.map(q => q.pillar))];
  const trend = getTrend();
  const averageScore = getAverageScore();
  const bestDay = getBestDay();
  return (
    <div className="space-y-6">
      {/* Insights */}
      <EvolutionInsights period={period} />
      
      {/* En-tête avec contrôles */}
      <Card className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">Évolution Temporelle</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={period === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(7)}
            >
              7 jours
            </Button>
            <Button
              variant={period === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(30)}
            >
              30 jours
            </Button>
            <Button
              variant={chartType === 'line' ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant={showPillars ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPillars(!showPillars)}
            >
              Piliers
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{averageScore}%</div>
            <div className="text-sm text-blue-800">Score Moyen</div>
          </div>
          
          <div className={`p-4 rounded-lg text-center ${trend.isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`text-2xl font-bold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
            <div className={`text-sm ${trend.isPositive ? 'text-green-800' : 'text-red-800'}`}>
              Tendance
            </div>
          </div>
          
          {bestDay && (
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{bestDay.score}%</div>
              <div className="text-sm text-yellow-800">{bestDay.date}</div>
            </div>
          )}
        </div>

        {/* Graphique */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Line
                  type="monotone"
                  dataKey="globalScore"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                  name="Score Global"
                />
                
                {showPillars && uniquePillars.map(pillar => (
                  <Line
                    key={pillar}
                    type="monotone"
                    dataKey={pillar}
                    stroke={pillarColors[pillar as keyof typeof pillarColors] || '#6B7280'}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name={pillar.charAt(0).toUpperCase() + pillar.slice(1)}
                  />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Area
                  type="monotone"
                  dataKey="globalScore"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  strokeWidth={3}
                  name="Score Global"
                />
                
                {showPillars && uniquePillars.map(pillar => (
                  <Area
                    key={pillar}
                    type="monotone"
                    dataKey={pillar}
                    stroke={pillarColors[pillar as keyof typeof pillarColors] || '#6B7280'}
                    fill={pillarColors[pillar as keyof typeof pillarColors] || '#6B7280'}
                    fillOpacity={0.05}
                    strokeWidth={2}
                    name={pillar.charAt(0).toUpperCase() + pillar.slice(1)}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Légende explicative */}
        <div className="mt-4 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Évolution de vos scores sur les {period} derniers jours
            {showPillars && " avec détail par pilier"}
          </p>
          {chartData.filter(d => d.globalScore === 0).length > 0 && (
            <p className="text-yellow-600 mt-2">
              ⚠️ Certains jours sans données ne sont pas affichés dans les tendances
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EvolutionChart;
