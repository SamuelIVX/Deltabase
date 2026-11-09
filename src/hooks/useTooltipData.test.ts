/**
 * Unit tests for useTooltipData hook.
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useTooltipData from './useTooltipData';

describe('useTooltipData hook', () => {
    const sampleData = [
        { name: '2023-01-01', portfolioValue: '1000.00' },
        { name: '2023-02-01', portfolioValue: '1250.00' },
    ];

    it('returns null when tooltip is inactive or missing payload', () => {
        const { result } = renderHook(() =>
            useTooltipData(false, undefined, sampleData)
        );
        expect(result.current).toBeNull();
    });

    it('derives formatted value and performance delta for active tooltip point', () => {
        const payload = [
            {
                value: 1250,
                name: 'portfolioValue',
                color: '#10b981',
                payload: { name: '2023-02-01' },
            },
        ];

        const { result } = renderHook(() =>
            useTooltipData(true, payload, sampleData)
        );

        expect(result.current).not.toBeNull();
        expect(result.current?.label).toBe('2023-02-01');
        expect(result.current?.formattedValue).toBe('1,250.00');
        expect(result.current?.performance).toBe('25.00');
    });

    it('returns null performance for the first point without previous data', () => {
        const payload = [
            {
                value: 1000,
                name: 'portfolioValue',
                color: '#10b981',
                payload: { name: '2023-01-01' },
            },
        ];

        const { result } = renderHook(() =>
            useTooltipData(true, payload, sampleData)
        );

        expect(result.current?.performance).toBeNull();
    });
});
