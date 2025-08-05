import React from 'react';
import { DefaultQuestionManager } from './questionnaire/DefaultQuestionManager';
import AdvancedCustomizationSettings from './AdvancedCustomizationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const EnhancedCustomizationSettings = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🛠️ Personnalisation Complète
        </h1>
        <p className="text-gray-600">
          Modifiez vos questions, piliers et coefficients selon vos besoins
        </p>
      </div>

      <Tabs defaultValue="system-questions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system-questions" className="flex items-center gap-2">
            📝 Modifier les Questions Système
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            ⚙️ Personnalisation Avancée
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system-questions" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <DefaultQuestionManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <AdvancedCustomizationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCustomizationSettings;
