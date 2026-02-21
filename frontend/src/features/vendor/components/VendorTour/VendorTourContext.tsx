import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { TOUR_STEPS, TOUR_STORAGE_KEY, TOUR_TRIGGER_KEY } from './tourSteps';

interface VendorTourContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  hasCompletedTour: boolean;
}

const defaultContext: VendorTourContextType = {
  isActive: false,
  currentStep: 0,
  totalSteps: 0,
  startTour: () => {},
  endTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipTour: () => {},
  hasCompletedTour: localStorage.getItem(TOUR_STORAGE_KEY) === 'true',
};

const VendorTourContext = createContext<VendorTourContextType>(defaultContext);

export const useVendorTour = () => useContext(VendorTourContext);

export const VendorTourProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  });
  const location = useLocation();

  // Check if tour should auto-trigger when navigating to dashboard
  useEffect(() => {
    if (hasCompletedTour || isActive) return;
    if (location.pathname !== '/vendor/dashboard') return;

    const hasOnboarded = localStorage.getItem(TOUR_TRIGGER_KEY) === 'true';
    if (!hasOnboarded) return;

    const timer = setTimeout(() => {
      localStorage.removeItem(TOUR_TRIGGER_KEY);
      setIsActive(true);
      setCurrentStep(0);
    }, 1200);
    return () => clearTimeout(timer);
  }, [location.pathname, hasCompletedTour, isActive]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setHasCompletedTour(true);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  }, []);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setHasCompletedTour(true);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  }, [currentStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  return (
    <VendorTourContext.Provider value={{
      isActive,
      currentStep,
      totalSteps: TOUR_STEPS.length,
      startTour,
      endTour,
      nextStep,
      prevStep,
      skipTour,
      hasCompletedTour,
    }}>
      {children}
    </VendorTourContext.Provider>
  );
};
