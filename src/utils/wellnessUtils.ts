export const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getWellnessData = (): Record<string, any> => {
  // Note: Cette fonction reste pour la compatibilité
  // En mode Firebase, les données viennent du hook useFirebaseWellness
  const saved = localStorage.getItem('wellness-data');
  return saved ? JSON.parse(saved) : {};
};

export const saveWellnessData = (data: Record<string, number[]>): void => {
  // Note: Cette fonction reste pour la compatibilité
  // En mode Firebase, utilisez le hook useFirebaseWellness
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
  const coefficients = getPillarCoefficients();
  
  let totalWeightedScore = 0;
  let totalCoefficients = 0;
  
  uniquePillars.forEach(pillar => {
    const score = calculatePillarScore(data, pillar);
    const coefficient = coefficients[pillar] || 1; // Default coefficient = 1
    totalWeightedScore += score * coefficient;
    totalCoefficients += coefficient;
  });
  
  return totalCoefficients > 0 ? Math.round(totalWeightedScore / totalCoefficients) : 0;
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
  },  {
    pillar: 'stress',
    questions: [
      'Ai-je bien géré mon temps d\'écran ?',
      'Ai-je évité les addictions (cigarettes, alcool, etc.) ?',
      'Ai-je su résister aux tentations néfastes ?',
      'Ai-je maintenu un équilibre émotionnel ?',
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

// Gestion des questions modifiées
export const getModifiedDefaultQuestions = (): Record<string, string[]> => {
  const saved = localStorage.getItem('modified-default-questions');
  if (saved) {
    return JSON.parse(saved);
  }
  return {};
};

export const saveModifiedDefaultQuestions = (modifiedQuestions: Record<string, string[]>): void => {
  localStorage.setItem('modified-default-questions', JSON.stringify(modifiedQuestions));
};

export const resetDefaultQuestions = (): void => {
  localStorage.removeItem('modified-default-questions');
};

// Obtenir les questions par défaut avec les modifications appliquées
export const getEffectiveDefaultQuestions = () => {
  const originalQuestions = getDefaultQuestions();
  const modifiedQuestions = getModifiedDefaultQuestions();
  
  return originalQuestions.map(({ pillar, questions }) => ({
    pillar,
    questions: modifiedQuestions[pillar] || questions
  }));
};

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
  const defaultQuestions = getEffectiveDefaultQuestions(); // Utilise les questions modifiées
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
export const getPillarNames = () => {  const defaultNames = {
    alimentation: 'Alimentation 🥗',
    sport: 'Sport 💪',
    sommeil: 'Sommeil 😴',
    stress: 'Équilibre & Addictions ⚖️',
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

// Gestion des coefficients des piliers (gardé pour compatibilité)
export const getDefaultCoefficients = (): Record<string, number> => {
  return {
    alimentation: 1.0,
    sport: 1.0,
    sommeil: 1.2, // Légèrement plus important par défaut
    stress: 1.1,
    spiritualite: 1.0,
    social: 0.9
  };
};

export const getPillarCoefficients = (): Record<string, number> => {
  const saved = localStorage.getItem('pillar-coefficients');
  if (saved) {
    const savedCoefficients = JSON.parse(saved);
    // Fusionner avec les coefficients par défaut pour les nouveaux piliers
    return { ...getDefaultCoefficients(), ...savedCoefficients };
  }
  return getDefaultCoefficients();
};

export const savePillarCoefficients = (coefficients: Record<string, number>): void => {
  localStorage.setItem('pillar-coefficients', JSON.stringify(coefficients));
};

export const resetCoefficientsToDefault = (): void => {
  localStorage.removeItem('pillar-coefficients');
};

// Gestion des coefficients des questions individuelles
export const getDefaultQuestionCoefficients = (): Record<string, number> => {
  const allQuestions = getAllQuestions();
  const coefficients: Record<string, number> = {};
  
  allQuestions.forEach(({ pillar, questions }) => {
    questions.forEach((question, index) => {
      const questionKey = `${pillar}_${index}`;
      coefficients[questionKey] = 1.0; // Coefficient par défaut
    });
  });
  
  return coefficients;
};

export const getQuestionCoefficients = (): Record<string, number> => {
  const saved = localStorage.getItem('question-coefficients');
  if (saved) {
    const savedCoefficients = JSON.parse(saved);
    // Fusionner avec les coefficients par défaut pour les nouvelles questions
    return { ...getDefaultQuestionCoefficients(), ...savedCoefficients };
  }
  return getDefaultQuestionCoefficients();
};

export const saveQuestionCoefficients = (coefficients: Record<string, number>): void => {
  localStorage.setItem('question-coefficients', JSON.stringify(coefficients));
};

export const resetQuestionCoefficientsToDefault = (): void => {
  localStorage.removeItem('question-coefficients');
};

// Fonction pour calculer le score d'un pilier avec coefficients par question
export const calculatePillarScoreWithQuestionCoefficients = (data: any, pillar: string): number => {
  if (!data || !data[pillar] || !Array.isArray(data[pillar])) {
    return 0;
  }
  
  const scores = data[pillar];
  const coefficients = getQuestionCoefficients();
  
  let totalWeightedScore = 0;
  let totalCoefficients = 0;
  
  scores.forEach((score: number, index: number) => {
    const questionKey = `${pillar}_${index}`;
    const coefficient = coefficients[questionKey] || 1.0;
    totalWeightedScore += score * coefficient;
    totalCoefficients += coefficient;
  });
  
  return totalCoefficients > 0 ? Math.round(totalWeightedScore / totalCoefficients) : 0;
};

// Fonction pour calculer le score global avec coefficients par question
export const calculateGlobalScoreWithQuestionCoefficients = (data: any): number => {
  if (!data) return 0;
  
  const allQuestions = getAllQuestions();
  const pillars = allQuestions.map(q => q.pillar);
  const uniquePillars = [...new Set(pillars)];
  
  let totalWeightedScore = 0;
  let totalCoefficients = 0;
  
  uniquePillars.forEach(pillar => {
    const pillarData = data[pillar];
    if (pillarData && Array.isArray(pillarData)) {
      const coefficients = getQuestionCoefficients();
      
      pillarData.forEach((score: number, index: number) => {
        const questionKey = `${pillar}_${index}`;
        const coefficient = coefficients[questionKey] || 1.0;
        totalWeightedScore += score * coefficient;
        totalCoefficients += coefficient;
      });
    }
  });
    return totalCoefficients > 0 ? Math.round(totalWeightedScore / totalCoefficients) : 0;
};
