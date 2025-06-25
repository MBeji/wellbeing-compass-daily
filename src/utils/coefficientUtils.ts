import { 
  calculateGlobalScore, 
  calculatePillarScore, 
  getPillarCoefficients, 
  savePillarCoefficients,
  getAllQuestions 
} from '@/utils/wellnessUtils';

// Utilitaires pour les presets de coefficients
export const COEFFICIENT_PRESETS = {
  default: {
    name: "Équilibré",
    description: "Tous les piliers ont la même importance",
    coefficients: {
      alimentation: 1.0,
      sport: 1.0,
      sommeil: 1.0,
      stress: 1.0,
      spiritualite: 1.0,
      social: 1.0
    }
  },
  
  wellness: {
    name: "Bien-être physique",
    description: "Focus sur la santé physique",
    coefficients: {
      alimentation: 1.3,
      sport: 1.4,
      sommeil: 1.3,
      stress: 1.1,
      spiritualite: 0.8,
      social: 0.9
    }
  },
  
  spiritual: {
    name: "Développement spirituel",
    description: "Focus sur la spiritualité et l'équilibre mental",
    coefficients: {
      alimentation: 1.0,
      sport: 0.9,
      sommeil: 1.1,
      stress: 1.2,
      spiritualite: 1.5,
      social: 1.1
    }
  },
  
  productivity: {
    name: "Productivité",
    description: "Focus sur la performance et l'efficacité",
    coefficients: {
      alimentation: 1.1,
      sport: 1.0,
      sommeil: 1.4,
      stress: 1.3,
      spiritualite: 0.8,
      social: 0.7
    }
  },
  
  social: {
    name: "Vie sociale",
    description: "Focus sur les relations et le bien-être social",
    coefficients: {
      alimentation: 1.0,
      sport: 0.9,
      sommeil: 1.0,
      stress: 1.0,
      spiritualite: 1.0,
      social: 1.4
    }
  }
};

// Fonction pour appliquer un preset
export const applyPreset = (presetKey: keyof typeof COEFFICIENT_PRESETS) => {
  const preset = COEFFICIENT_PRESETS[presetKey];
  if (preset) {
    savePillarCoefficients(preset.coefficients);
    return preset;
  }
  return null;
};

// Fonction pour simuler l'impact des coefficients
export const simulateScoreImpact = (data: any, newCoefficients: Record<string, number>) => {
  if (!data) return { before: 0, after: 0, difference: 0 };
  
  // Score avant
  const before = calculateGlobalScore(data);
  
  // Sauvegarder les coefficients actuels
  const currentCoefficients = getPillarCoefficients();
  
  // Appliquer temporairement les nouveaux coefficients
  savePillarCoefficients({ ...currentCoefficients, ...newCoefficients });
  
  // Calculer le nouveau score
  const after = calculateGlobalScore(data);
  
  // Restaurer les coefficients originaux
  savePillarCoefficients(currentCoefficients);
  
  return {
    before,
    after,
    difference: after - before
  };
};

// Fonction pour obtenir des suggestions de coefficients basées sur les scores actuels
export const getCoefficientsRecommendations = (data: any) => {
  if (!data) return [];
  
  const recommendations = [];
  const allQuestions = getAllQuestions();
  const uniquePillars = [...new Set(allQuestions.map(q => q.pillar))];
  
  uniquePillars.forEach(pillar => {
    const score = calculatePillarScore(data, pillar);
    
    if (score < 40) {
      recommendations.push({
        pillar,
        suggestion: `Augmenter l'importance de "${pillar}" (coefficient 1.3-1.5)`,
        reason: `Score faible (${score}%) - nécessite plus d'attention`,
        suggestedCoefficient: 1.4
      });
    } else if (score > 90) {
      recommendations.push({
        pillar,
        suggestion: `Réduire l'importance de "${pillar}" (coefficient 0.8-0.9)`,
        reason: `Score excellent (${score}%) - permet de se concentrer sur d'autres aspects`,
        suggestedCoefficient: 0.8
      });
    }
  });
  
  return recommendations;
};

export default {
  COEFFICIENT_PRESETS,
  applyPreset,
  simulateScoreImpact,
  getCoefficientsRecommendations
};
