// LocalStorage para auto-guardado del setup
const STORAGE_KEY = 'setup_wizard_progress';

export const saveSetupProgress = (data) => {
  try {
    const progress = {
      data,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('Error saving setup progress:', error);
    return false;
  }
};

export const loadSetupProgress = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const progress = JSON.parse(stored);
    
    // Verificar que no sea muy antiguo (más de 24 horas)
    const timestamp = new Date(progress.timestamp);
    const now = new Date();
    const hoursDiff = (now - timestamp) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      clearSetupProgress();
      return null;
    }
    
    return progress.data;
  } catch (error) {
    console.error('Error loading setup progress:', error);
    return null;
  }
};

export const clearSetupProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing setup progress:', error);
    return false;
  }
};

export const hasSetupProgress = () => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};
