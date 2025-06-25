import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Info } from 'lucide-react';
import { 
  getPillarCoefficients, 
  savePillarCoefficients, 
  resetCoefficientsToDefault, 
  getAllQuestions,
  getPillarNames
} from '@/utils/wellnessUtils';
import { COEFFICIENT_PRESETS, applyPreset } from '@/utils/coefficientUtils';
import { useToast } from '@/hooks/use-toast';

const CoefficientSettings = () => {
  const [coefficients, setCoefficients] = useState<Record<string, number>>({});
  const [pillarNames, setPillarNames] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const currentCoefficients = getPillarCoefficients();
    const names = getPillarNames();
    setCoefficients(currentCoefficients);
    setPillarNames(names);
  }, []);

  const handleCoefficientChange = (pillar: string, value: number[]) => {
    const newCoefficients = {
      ...coefficients,
      [pillar]: value[0]
    };
    setCoefficients(newCoefficients);
    savePillarCoefficients(newCoefficients);
  };

  const handlePresetApply = (presetKey: keyof typeof COEFFICIENT_PRESETS) => {
    const preset = applyPreset(presetKey);
    if (preset) {
      const newCoefficients = getPillarCoefficients();
      setCoefficients(newCoefficients);
      toast({
        title: `Preset "${preset.name}" appliqué`,
        description: preset.description,
      });
    }
  };

  const handleReset = () => {
    resetCoefficientsToDefault();
    const defaultCoefficients = getPillarCoefficients();
    setCoefficients(defaultCoefficients);
    toast({
      title: "Coefficients réinitialisés",
      description: "Les coefficients ont été remis aux valeurs par défaut.",
    });
  };

  const getImportanceLevel = (coefficient: number): { label: string; color: string } => {
    if (coefficient >= 1.5) return { label: "Très important", color: "bg-red-500" };
    if (coefficient >= 1.2) return { label: "Important", color: "bg-orange-500" };
    if (coefficient >= 1.0) return { label: "Normal", color: "bg-green-500" };
    if (coefficient >= 0.7) return { label: "Secondaire", color: "bg-blue-500" };
    return { label: "Minimal", color: "bg-gray-500" };
  };

  const uniquePillars = [...new Set(getAllQuestions().map(q => q.pillar))];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Coefficients d'Importance
          </h3>
          <p className="text-gray-600 text-sm">
            Ajustez l'importance relative de chaque pilier dans le calcul du score global
          </p>
        </div>        <Button 
          onClick={handleReset}
          className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Réinitialiser
        </Button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Comment ça fonctionne ?</p>
            <p>Les coefficients permettent de pondérer l'impact de chaque pilier sur votre score global. Un coefficient de 1.0 = importance normale, 1.5 = très important, 0.5 = moins important.</p>
          </div>
        </div>
      </div>

      {/* Presets de coefficients */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="font-medium text-purple-800 mb-3">🚀 Configurations prédéfinies</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(COEFFICIENT_PRESETS).map(([key, preset]) => (
            <div key={key} className="p-3 bg-white rounded border border-purple-200 hover:border-purple-400 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-purple-700">{preset.name}</h5>
                <Button
                  onClick={() => handlePresetApply(key as keyof typeof COEFFICIENT_PRESETS)}
                  className="text-xs px-3 py-1 bg-purple-600 text-white hover:bg-purple-700"
                >
                  Appliquer
                </Button>
              </div>
              <p className="text-xs text-purple-600">{preset.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {uniquePillars.map((pillar) => {
          const coefficient = coefficients[pillar] || 1.0;
          const { label, color } = getImportanceLevel(coefficient);
          
          return (
            <div key={pillar} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  {pillarNames[pillar] || pillar}
                </Label>
                <div className="flex items-center gap-2">
                  <Badge className={`${color} text-white text-xs`}>
                    {label}
                  </Badge>
                  <span className="text-sm font-mono text-gray-600 min-w-[2rem]">
                    {coefficient.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="px-2">
                <Slider
                  value={[coefficient]}
                  onValueChange={(value) => handleCoefficientChange(pillar, value)}
                  max={2.0}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.1 (Minimal)</span>
                  <span>1.0 (Normal)</span>
                  <span>2.0 (Maximum)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-800 mb-2">Aperçu des coefficients actuels</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {uniquePillars.map((pillar) => (
            <div key={pillar} className="flex justify-between">
              <span className="text-green-700">
                {(pillarNames[pillar] || pillar).replace(/[🥗💪😴🧘🕌❤️]/g, '')}:
              </span>
              <span className="font-mono text-green-800">
                {(coefficients[pillar] || 1.0).toFixed(1)}x
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section d'exemples d'utilisation */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Exemples d'utilisation</h4>
        <div className="text-sm text-yellow-700 space-y-2">
          <p><strong>Période d'examen :</strong> Augmentez "Sommeil" (1.5x) et "Stress" (1.3x)</p>
          <p><strong>Objectif sportif :</strong> Augmentez "Sport" (1.4x) et "Alimentation" (1.2x)</p>
          <p><strong>Période spirituelle :</strong> Augmentez "Spiritualité" (1.5x)</p>
          <p><strong>Récupération :</strong> Réduisez "Social" (0.7x), augmentez "Sommeil" (1.3x)</p>
        </div>
      </div>
    </Card>
  );
};

export default CoefficientSettings;
