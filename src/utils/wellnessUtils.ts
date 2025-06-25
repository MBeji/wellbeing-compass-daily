
export const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getWellnessData = (): Record<string, any> => {
  const saved = localStorage.getItem('wellness-data');
  return saved ? JSON.parse(saved) : {};
};

export const saveWellnessData = (data: Record<string, number[]>): void => {
  const existing = getWellnessData();
  const todayKey = getTodayKey();
  
  existing[todayKey] = data;
  localStorage.setItem('wellness-data', JSON.stringify(existing));
};

export const calculatePillarScore = (data: any, pillar: string): number => {
  if (!data || !data[pillar] || !Array.isArray(data[pillar])) {
    return 0;
  }
  
  const scores = data[pillar];
  const average = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
  return Math.round(average);
};

export const calculateGlobalScore = (data: any): number => {
  if (!data) return 0;
  
  const pillars = ['alimentation', 'sport', 'sommeil', 'stress', 'spiritualite', 'social'];
  const pillarScores = pillars.map(pillar => calculatePillarScore(data, pillar));
  
  const totalScore = pillarScores.reduce((sum, score) => sum + score, 0);
  return Math.round(totalScore / pillars.length);
};

export const getScoreHistory = (days: number = 7): Array<{ date: string; score: number }> => {
  const data = getWellnessData();
  const history = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    const dayData = data[dateKey];
    const score = calculateGlobalScore(dayData);
    
    history.push({
      date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      score
    });
  }
  
  return history;
};
