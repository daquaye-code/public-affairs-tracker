import { describe, it, expect } from 'vitest';
import { getMonthOptions, getCurrentMonth, formatMonthLabel } from '../utils/months';

describe('Month utilities', () => {
  it('getCurrentMonth returns YYYY-MM format', () => {
    const result = getCurrentMonth();
    expect(result).toMatch(/^\d{4}-\d{2}$/);
  });

  it('getMonthOptions returns 12 months', () => {
    const options = getMonthOptions();
    expect(options).toHaveLength(12);
    options.forEach((opt) => {
      expect(opt.value).toMatch(/^\d{4}-\d{2}$/);
      expect(opt.label).toBeTruthy();
    });
  });

  it('formatMonthLabel formats correctly', () => {
    const result = formatMonthLabel('2026-03');
    expect(result).toContain('March');
    expect(result).toContain('2026');
  });

  it('formatMonthLabel handles empty input', () => {
    expect(formatMonthLabel('')).toBe('');
    expect(formatMonthLabel(null)).toBe('');
  });
});
