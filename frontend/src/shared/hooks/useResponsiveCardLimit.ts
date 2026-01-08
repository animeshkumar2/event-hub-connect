import { useState, useEffect } from 'react';

export function useResponsiveCardLimit() {
  const [cardLimit, setCardLimit] = useState(4);

  useEffect(() => {
    const updateCardLimit = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCardLimit(2); // Mobile
      } else if (width < 1024) {
        setCardLimit(3); // Tablet
      } else {
        setCardLimit(4); // Desktop
      }
    };

    updateCardLimit();
    window.addEventListener('resize', updateCardLimit);
    return () => window.removeEventListener('resize', updateCardLimit);
  }, []);

  return cardLimit;
}
