
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
  
  const allQuestions = getAllQuestions();
  const pillars = allQuestions.map(q => q.pillar);
  const uniquePillars = [...new Set(pillars)];
  
  const pillarScores = uniquePillars.map(pillar => calculatePillarScore(data, pillar));
  
  const totalScore = pillarScores.reduce((sum, score) => sum + score, 0);
  return Math.round(totalScore / uniquePillars.length);
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

// Questions par défaut
export const getDefaultQuestions = () => [
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

// Gestion des questions personnalisées
export const getCustomQuestions = (): { customQuestions: any[], customPillars: any[] } => {
  const saved = localStorage.getItem('custom-questions');
  if (saved) {
    return JSON.parse(saved);
  }
  return { customQuestions: [], customPillars: [] };
};

export const saveCustomQuestions = (customQuestions: any[], customPillars: any[]): void => {
  localStorage.setItem('custom-questions', JSON.stringify({ customQuestions, customPillars }));
};

// Combine les questions par défaut et personnalisées
export const getAllQuestions = () => {
  const defaultQuestions = getDefaultQuestions();
  const { customQuestions, customPillars } = getCustomQuestions();
  
  // Ajouter les questions personnalisées aux piliers existants
  const questionsMap = new Map();
  
  // Initialiser avec les questions par défaut
  defaultQuestions.forEach(({ pillar, questions }) => {
    questionsMap.set(pillar, [...questions]);
  });
  
  // Ajouter les questions personnalisées
  customQuestions.forEach((customQ: any) => {
    const existing = questionsMap.get(customQ.pillar) || [];
    questionsMap.set(customQ.pillar, [...existing, customQ.question]);
  });
  
  // Ajouter les nouveaux piliers personnalisés
  customPillars.forEach((pillar: any) => {
    if (!questionsMap.has(pillar.id)) {
      questionsMap.set(pillar.id, []);
    }
  });
  
  // Convertir en format attendu
  const result = [];
  for (const [pillar, questions] of questionsMap.entries()) {
    result.push({ pillar, questions });
  }
  
  return result;
};

// Noms des piliers (par défaut + personnalisés)
export const getPillarNames = () => {
  const defaultNames = {
    alimentation: 'Alimentation 🥗',
    sport: 'Sport 💪',
    sommeil: 'Sommeil 😴',
    stress: 'Stress / Équilibre 🧘',
    spiritualite: 'Spiritualité 🕌',
    social: 'Social ❤️'
  };
  
  const { customPillars } = getCustomQuestions();
  const customNames: Record<string, string> = {};
  
  customPillars.forEach((pillar: any) => {
    customNames[pillar.id] = `${pillar.name} ${pillar.emoji}`;
  });
  
  return { ...defaultNames, ...customNames };
};
