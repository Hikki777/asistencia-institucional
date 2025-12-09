import React from 'react';
import { Check, X } from 'lucide-react';
import { calculatePasswordStrength, getPasswordRequirements } from '../utils/passwordValidation';

export default function PasswordStrengthIndicator({ password }) {
  const strength = calculatePasswordStrength(password);
  const requirements = getPasswordRequirements();

  const getBarColor = () => {
    if (strength.color === 'red') return 'bg-red-500';
    if (strength.color === 'yellow') return 'bg-yellow-500';
    if (strength.color === 'green') return 'bg-green-500';
    return 'bg-gray-300';
  };

  const getTextColor = () => {
    if (strength.color === 'red') return 'text-red-600';
    if (strength.color === 'yellow') return 'text-yellow-600';
    if (strength.color === 'green') return 'text-green-600';
    return 'text-gray-500';
  };

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Barra de fortaleza */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-600">Fortaleza de contraseña:</span>
          <span className={`text-xs font-bold ${getTextColor()}`}>{strength.label}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full ${getBarColor()} transition-all duration-300 ease-out`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requisitos */}
      <div className="space-y-1">
        {requirements.map((req) => {
          const isValid = req.check(password);
          return (
            <div key={req.id} className="flex items-center gap-2 text-xs">
              {isValid ? (
                <Check size={14} className="text-green-500 flex-shrink-0" />
              ) : (
                <X size={14} className="text-gray-300 flex-shrink-0" />
              )}
              <span className={isValid ? 'text-green-600' : 'text-gray-500'}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
