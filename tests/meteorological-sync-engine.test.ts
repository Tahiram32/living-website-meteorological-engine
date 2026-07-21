import { describe, it, expect } from 'vitest';
import { evaluateTriggers } from '../meteorological-sync-engine';

describe('evaluateTriggers', () => {
  it('should return false for empty triggers', () => {
    expect(evaluateTriggers([], { temp: 100 })).toBe(false);
  });

  it('should correctly evaluate greater than condition', () => {
    expect(evaluateTriggers(['temp > 95'], { temp: 100 })).toBe(true);
    expect(evaluateTriggers(['temp > 95'], { temp: 90 })).toBe(false);
  });

  it('should correctly evaluate less than condition', () => {
    expect(evaluateTriggers(['temp < 32'], { temp: 30 })).toBe(true);
    expect(evaluateTriggers(['temp < 32'], { temp: 40 })).toBe(false);
  });

  it('should safely ignore non-whitelisted fields', () => {
    expect(evaluateTriggers(['unknownField > 50'], { unknownField: 100 })).toBe(false);
  });
});
