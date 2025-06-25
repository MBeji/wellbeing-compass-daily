
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface QuestionSliderProps {
  question: string;
  value: number;
  onChange: (value: number) => void;
}

const QuestionSlider = ({ question, value, onChange }: QuestionSliderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <label className="text-gray-700 font-medium flex-1 pr-4">
          {question}
        </label>
        <div className="text-right min-w-16">
          <span className="text-2xl font-bold text-gray-800">{value}%</span>
        </div>
      </div>
      
      <div className="px-2">
        <Slider
          value={[value]}
          onValueChange={(newValue) => onChange(newValue[0])}
          max={100}
          min={0}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionSlider;
