import React, { createContext, useContext } from 'react';
import { useProgress } from '../hooks/useProgress';

const ProgressContext = createContext<ReturnType<typeof useProgress> | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const progress = useProgress();

  return (
    <ProgressContext.Provider value={progress}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgressContext = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgressContext must be used within a ProgressProvider');
  }
  return context;
};