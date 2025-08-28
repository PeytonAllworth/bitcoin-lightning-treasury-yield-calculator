
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export default function SliderInput({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  description,
  highlighted = false,
}) {
  const handleFinalValue = (currentValue) => {
    let num = parseFloat(currentValue);

    if (isNaN(num)) {
      num = min;
    }
    // Clamp the value
    if (num > max) num = max;
    if (num < min) num = min;

    // Handle float precision issues
    const precision = (step.toString().split('.')[1] || '').length;
    const finalValue = parseFloat(num.toFixed(precision));
    
    if (value !== finalValue) {
      onChange(finalValue);
    }
  };

  return (
    <div className={`space-y-3 p-4 rounded-lg ${highlighted ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
      <Label htmlFor={id} className="text-sm font-semibold text-gray-900">
        {label}
      </Label>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Slider
            id={id}
            value={[typeof value === 'number' ? value : min]}
            onValueChange={(val) => handleFinalValue(val[0])}
            min={min}
            max={max}
            step={step}
            className="w-full [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_.slider-track]:h-2"
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Input
            id={`${id}-input`}
            type="number"
            value={value}
            onFocus={(e) => e.target.select()}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => handleFinalValue(e.target.value)}
            min={min}
            max={max}
            step={step}
            className="w-16 h-9 text-sm rounded-md text-center"
            onKeyDown={(e) => { if (['e', 'E', ','].includes(e.key)) e.preventDefault(); }}
          />
          <span className="text-sm font-medium text-gray-600">%</span>
        </div>
      </div>
      {description && (
        <div className="text-xs text-gray-500 leading-relaxed">
          {description}
        </div>
      )}
    </div>
  );
}
