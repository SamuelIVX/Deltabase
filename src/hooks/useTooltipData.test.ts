/**
 * Comprehensive unit tests for useTooltipData hook (kills all Stryker mutants).
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useTooltipData from './useTooltipData';

describe('useTooltipData hook', () => {
    const sampleData = [
        { name: '2023-01-01', portfolioValue: '1000.00' },
        { name: '2023-02-01', portfolioValue: '1250.00' },
        { name: '2023-03-01', portfolioValue: '0' },
        { name: '2023-04-01', portfolioValue: 'invalid' },
        { name: '2023-05-01', portfolioValue: undefined },
    ];

    it('returns null when tooltip is inactive or missing payload or data', () => {
        const { result: r1 } = renderHook(() =>
            useTooltipData(false, [{ value: 100, payload: { name: '2023-01-01' } }], sampleData)
        );
        expect(r1.current).toBeNull();

        const { result: r2 } = renderHook(() =>
            useTooltipData(true, undefined, sampleData)
        );
        expect(r2.current).toBeNull();

        const { result: r3 } = renderHook(() =>
            useTooltipData(true, [], sampleData)
        );
        expect(r3.current).toBeNull();

        const { result: r4 } = renderHook(() =>
            useTooltipData(true, [{ value: 100, payload: { name: '2023-01-01' } }], undefined)
        );
        expect(r4.current).toBeNull();
    });

    it('derives formatted value, name, color, and performance delta for active tooltip point', () => {
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
        expect(result.current?.value).toBe(1250);
        expect(result.current?.name).toBe('portfolioValue');
        expect(result.current?.color).toBe('#10b981');
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

    it('returns null performance when label is not in dataset', () => {
        const payload = [
            {
                value: 500,
                name: 'portfolioValue',
                color: '#10b981',
                payload: { name: 'unknown-date' },
            },
        ];

        const { result } = renderHook(() =>
            useTooltipData(true, payload, sampleData)
        );

        expect(result.current?.performance).toBeNull();
    });

    it('returns null performance when previous value is zero', () => {
        // Point after 2023-03-01 (which has portfolioValue '0')
        const payload = [
            {
                value: 200,
                payload: { name: '2023-04-01' },
            },
        ];

        const { result } = renderHook(() =>
            useTooltipData(true, payload, sampleData)
        );

        expect(result.current?.performance).toBeNull();
    });

    it('returns null performance when previous value is invalid non-finite string', () => {
        // Point after 2023-04-01 (which has portfolioValue 'invalid')
        const payload = [
            {
                value: 300,
                payload: { name: '2023-05-01' },
            },
        ];

        const { result } = renderHook(() =>
            useTooltipData(true, payload, sampleData)
        );

        expect(result.current?.performance).toBeNull();
    });

    it('returns null performance when previous value is undefined', () => {
        const customData = [
            { name: '2023-01-01', portfolioValue: undefined },
            { name: '2023-02-01', portfolioValue: 500 },
        ];

        const payload = [
            {
                value: 500,
                payload: { name: '2023-02-01' },
            },
        ];

        const { result } = renderHook(() =>
            useTooltipData(true, payload, customData)
        );

        expect(result.current?.performance).toBeNull();
    });
});
