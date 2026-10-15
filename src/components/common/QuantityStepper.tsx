import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 0.5,
  unit = 'kg',
  disabled = false,
}) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const next = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(next);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const next = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(Math.min(max, parsed));
    }
  };

  return (
    <div className="flex items-center rounded-btn border border-border bg-surface overflow-hidden h-12 w-full max-w-[190px] shadow-subtle">
      {/* Minus Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="w-12 h-12 flex items-center justify-center text-textPrimary hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors border-r border-border shrink-0 touch-manipulation"
        aria-label="Decrease quantity"
      >
        <Minus className="w-5 h-5 text-textPrimary stroke-[2.5]" />
      </button>

      {/* Input Field */}
      <div className="flex-1 flex items-center justify-center px-1 relative">
        <input
          type="number"
          step={step}
          min={min}
          max={max}
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={handleInputChange}
          disabled={disabled}
          inputMode="decimal"
          className="w-full text-center font-semibold text-textPrimary tabular-nums text-lg bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
        />
        <span className="text-xs text-textSecondary select-none ml-0.5">{unit}</span>
      </div>

      {/* Plus Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="w-12 h-12 flex items-center justify-center text-textPrimary hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors border-l border-border shrink-0 touch-manipulation"
        aria-label="Increase quantity"
      >
        <Plus className="w-5 h-5 text-brand stroke-[2.5]" />
      </button>
    </div>
  );
};
