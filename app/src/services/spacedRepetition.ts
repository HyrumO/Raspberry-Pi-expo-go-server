import { DifficultyRating } from '../types/review';
import { config } from '../constants/config';

export interface SpacedRepetitionResult {
  newEaseFactor: number;
  newInterval: number;
  nextReview: Date;
}

export function calculateSpacedRepetition(
  currentEaseFactor: number,
  currentInterval: number,
  difficulty: DifficultyRating
): SpacedRepetitionResult {
  let newEaseFactor = currentEaseFactor;
  let newInterval = currentInterval;

  // Adjust ease factor based on difficulty
  switch (difficulty) {
    case 'easy':
      newEaseFactor = Math.max(
        config.review.minEaseFactor,
        currentEaseFactor + 0.15
      );
      newInterval = Math.min(
        config.review.maxInterval,
        Math.round(currentInterval * newEaseFactor * 1.3)
      );
      break;
    case 'good':
      newEaseFactor = Math.max(
        config.review.minEaseFactor,
        currentEaseFactor + 0.0
      );
      newInterval = Math.min(
        config.review.maxInterval,
        Math.round(currentInterval * newEaseFactor)
      );
      break;
    case 'hard':
      newEaseFactor = Math.max(
        config.review.minEaseFactor,
        currentEaseFactor - 0.15
      );
      newInterval = Math.max(
        1,
        Math.round(currentInterval * 1.2)
      );
      break;
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    newEaseFactor,
    newInterval,
    nextReview,
  };
}

export function getInitialInterval(): number {
  return config.review.initialInterval;
}

export function getInitialEaseFactor(): number {
  return config.review.initialEaseFactor;
}

