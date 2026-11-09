import { describe, it, expect } from 'vitest';
import {
    isValidStockSymbol,
    isValidCryptoSymbol,
    isValidCryptoMarket,
    isValidSearchTerm,
} from '@/lib/validation';

describe('API Input Validation', () => {
    describe('isValidStockSymbol', () => {
        it('accepts standard tickers and index symbols', () => {
            expect(isValidStockSymbol('AAPL')).toBe(true);
            expect(isValidStockSymbol('MSFT')).toBe(true);
            expect(isValidStockSymbol('BRK.B')).toBe(true);
            expect(isValidStockSymbol('BF-B')).toBe(true);
            expect(isValidStockSymbol('^GSPC')).toBe(true);
            expect(isValidStockSymbol('^IXIC')).toBe(true);
        });

        it('rejects un-trimmed whitespace and invalid symbols', () => {
            expect(isValidStockSymbol(' AAPL ')).toBe(false);
            expect(isValidStockSymbol('')).toBe(false);
            expect(isValidStockSymbol('   ')).toBe(false);
            expect(isValidStockSymbol(null)).toBe(false);
            expect(isValidStockSymbol(undefined)).toBe(false);
            expect(isValidStockSymbol(123)).toBe(false);
            expect(isValidStockSymbol('AAPL; DROP TABLE users;')).toBe(false);
            expect(isValidStockSymbol('<script>alert(1)</script>')).toBe(false);
            expect(isValidStockSymbol('TOOLONGTICKERNAMEEXCEEDINGLIMIT')).toBe(false);
        });
    });

    describe('isValidCryptoSymbol', () => {
        it('accepts standard crypto pairs', () => {
            expect(isValidCryptoSymbol('BTC-USD')).toBe(true);
            expect(isValidCryptoSymbol('ETH-USD')).toBe(true);
            expect(isValidCryptoSymbol('SOL-USD')).toBe(true);
        });

        it('rejects malicious or malformed crypto symbols', () => {
            expect(isValidCryptoSymbol(' BTC-USD ')).toBe(false);
            expect(isValidCryptoSymbol('')).toBe(false);
            expect(isValidCryptoSymbol(null)).toBe(false);
            expect(isValidCryptoSymbol('BTC-USD?param=1')).toBe(false);
            expect(isValidCryptoSymbol('BTC/USD')).toBe(false);
        });
    });

    describe('isValidCryptoMarket', () => {
        it('accepts standard crypto exchanges', () => {
            expect(isValidCryptoMarket('kraken')).toBe(true);
            expect(isValidCryptoMarket('coinbase')).toBe(true);
            expect(isValidCryptoMarket('binance')).toBe(true);
        });

        it('rejects invalid markets or malicious strings', () => {
            expect(isValidCryptoMarket('')).toBe(false);
            expect(isValidCryptoMarket(null)).toBe(false);
            expect(isValidCryptoMarket('kraken/evil')).toBe(false);
            expect(isValidCryptoMarket('a'.repeat(35))).toBe(false);
        });
    });

    describe('isValidSearchTerm', () => {
        it('accepts typical user searches', () => {
            expect(isValidSearchTerm('apple')).toBe(true);
            expect(isValidSearchTerm('S&P 500')).toBe(true);
            expect(isValidSearchTerm('Berkshire Hathaway Inc.')).toBe(true);
        });

        it('rejects malicious payload injection strings', () => {
            expect(isValidSearchTerm('')).toBe(false);
            expect(isValidSearchTerm(null)).toBe(false);
            expect(isValidSearchTerm('<svg onload=alert(1)>')).toBe(false);
            expect(isValidSearchTerm('A'.repeat(50))).toBe(false);
        });
    });
});

