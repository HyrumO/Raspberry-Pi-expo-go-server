export const config = {
  app: {
    name: 'Arabic Learning App',
    version: '1.0.0',
  },
  review: {
    initialInterval: 1, // days
    initialEaseFactor: 2.5,
    minEaseFactor: 1.3,
    maxInterval: 365, // days
  },
  goals: {
    defaultDailyCards: 30,
  },
} as const;

