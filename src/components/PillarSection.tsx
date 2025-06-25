
import React from 'react';
import { Card } from '@/components/ui/card';
import QuestionSlider from './QuestionSlider';

interface PillarSectionProps {
  pillar: string;
  pillarName: string;
  questions: string[];
  responses: number[];
  onResponseChange: (questionIndex: number, value: number) => void;
}

const PillarSection = ({ 
  pillar, 
  pillarName, 
  questions, 
  responses, 
  onResponseChange 
}: PillarSectionProps) => {
  return (
    <Card key={pillar} className="p-6 bg-white/70 backdrop-blur border-0 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        {pillarName}
      </h3>
      
      <div className="space-y-6">
        {questions.map((question: string, questionIndex: number) => {
          const value = responses[questionIndex] || 50;
          
          return (
            <QuestionSlider
              key={questionIndex}
              question={question}
              value={value}
              onChange={(value) => onResponseChange(questionIndex, value)}
            />
          );
        })}
      </div>
    </Card>
  );
};

export default PillarSection;
