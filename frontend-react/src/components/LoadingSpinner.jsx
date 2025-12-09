import React from 'react';
import { motion } from 'framer-motion';

/**
 * Spinner de carga reutilizable
 */
export function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
      {text && <p className="text-gray-600 text-sm animate-pulse">{text}</p>}
    </div>
  );
}

/**
 * Skeleton loader para tablas
 */
export function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {/* Header skeleton */}
      <div className="flex gap-4 pb-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="h-4 bg-gray-200 rounded flex-1" />
        ))}
      </div>
      
      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex gap-4 py-3 border-b border-gray-100">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div 
              key={`cell-${rowIdx}-${colIdx}`} 
              className="h-4 bg-gray-100 rounded flex-1"
              style={{ opacity: 1 - (colIdx * 0.1) }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Card skeleton para dashboards
 */
export function CardSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-6 bg-gray-300 rounded w-16" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}

/**
 * Lista skeleton para formularios
 */
export function ListSkeleton({ items = 3 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export default LoadingSpinner;
