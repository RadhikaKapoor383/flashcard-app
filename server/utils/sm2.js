/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm by Piotr Wozniak
 *
 * quality: 0-5
 *   5 - perfect response
 *   4 - correct response after a hesitation
 *   3 - correct response with serious difficulty
 *   2 - incorrect response; where the correct one seemed easy to recall
 *   1 - incorrect response; the correct one was hard to recall
 *   0 - complete blackout
 */
function sm2(quality, repetitions, easeFactor, interval) {
  // Edge case: quality must be 0-5
  if (quality < 0) quality = 0;
  if (quality > 5) quality = 5;

  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response — reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // EF must not fall below 1.3
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    easeFactor: parseFloat(newEaseFactor.toFixed(4)),
    interval: newInterval,
    nextReviewDate,
  };
}

module.exports = { sm2 };
