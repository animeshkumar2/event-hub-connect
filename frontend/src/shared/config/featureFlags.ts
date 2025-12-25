/**
 * Feature Flags for Phase 1 Release
 * 
 * Control which features are enabled/disabled during the initial vendor beta launch.
 * Set flags to true when ready to enable features in production.
 */

export const FEATURE_FLAGS = {
  // Analytics feature - Advanced reporting and insights
  ANALYTICS_ENABLED: false,
  
  // Wallet feature - Payment management and payouts
  WALLET_ENABLED: false,
  
  // Add more feature flags as needed
} as const;
