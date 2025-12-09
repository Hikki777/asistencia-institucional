import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ProgressBar({ currentStep, totalSteps = 3 }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        {/* Indicadores de paso */}
        <div className="flex justify-center items-center mb-2">
          <div className="flex items-center gap-2 sm:gap-4">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              
              return (
                <React.Fragment key={stepNumber}>
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: isCurrent ? 1.05 : 1 }}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check size={16} className="sm:w-5 sm:h-5" /> : stepNumber}
                    </motion.div>
                    <span className={`text-xs mt-1 font-medium hidden sm:block ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {stepNumber === 1 ? 'Institución' : stepNumber === 2 ? 'Admin' : stepNumber === 3 ? 'Confirmar' : 'Términos'}
                    </span>
                  </div>
                  {index < totalSteps - 1 && (
                    <div className="w-12 sm:w-16 h-0.5 bg-gray-200 relative overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-green-500"
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="relative max-w-md mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Progreso</span>
            <span className="text-xs font-bold text-blue-600">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
