/**
 * Currency Conversion Utilities
 * Base currency: LKR (Sri Lankan Rupee)
 */

export type Currency = 'LKR' | 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD' | 'JPY';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  LKR: { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee', flag: '🇱🇰' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
};

// Exchange rates relative to LKR (1 LKR = X currency)
// These should be updated from an API in production
export const EXCHANGE_RATES: Record<Currency, number> = {
  LKR: 1,
  USD: 0.0031, // 1 LKR ≈ 0.0031 USD
  EUR: 0.0029, // 1 LKR ≈ 0.0029 EUR
  GBP: 0.0025, // 1 LKR ≈ 0.0025 GBP
  INR: 0.26,   // 1 LKR ≈ 0.26 INR
  AUD: 0.0048, // 1 LKR ≈ 0.0048 AUD
  CAD: 0.0043, // 1 LKR ≈ 0.0043 CAD
  JPY: 0.47,   // 1 LKR ≈ 0.47 JPY
};

/**
 * Convert amount from LKR to target currency
 * @param amountInLKR Amount in LKR
 * @param targetCurrency Target currency code
 * @returns Converted amount
 */
export function convertFromLKR(
  amountInLKR: number,
  targetCurrency: Currency
): number {
  return amountInLKR * EXCHANGE_RATES[targetCurrency];
}

/**
 * Convert amount from source currency to LKR
 * @param amount Amount in source currency
 * @param sourceCurrency Source currency code
 * @returns Amount in LKR
 */
export function convertToLKR(
  amount: number,
  sourceCurrency: Currency
): number {
  return amount / EXCHANGE_RATES[sourceCurrency];
}

/**
 * Convert between any two currencies
 * @param amount Amount in source currency
 * @param from Source currency
 * @param to Target currency
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;
  const amountInLKR = convertToLKR(amount, from);
  return convertFromLKR(amountInLKR, to);
}

/**
 * Format currency amount with symbol
 * @param amount Amount to format
 * @param currency Currency code
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'LKR',
  decimals: number = 2
): string {
  const currencyInfo = CURRENCIES[currency];
  const formatted = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currencyInfo.symbol} ${formatted}`;
}

/**
 * Get currency symbol
 * @param currency Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: Currency = 'LKR'): string {
  return CURRENCIES[currency].symbol;
}

/**
 * Fetch latest exchange rates from API
 * This should be called periodically to update rates
 */
export async function fetchExchangeRates(): Promise<Record<Currency, number>> {
  try {
    // Using a free API (exchangerate-api.com)
    // You can sign up for a free API key at https://www.exchangerate-api.com/
    const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
    
    if (!apiKey) {
      console.warn('Exchange rate API key not configured, using default rates');
      return EXCHANGE_RATES;
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/LKR`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    if (data.result === 'success') {
      return {
        LKR: 1,
        USD: data.conversion_rates.USD || EXCHANGE_RATES.USD,
        EUR: data.conversion_rates.EUR || EXCHANGE_RATES.EUR,
        GBP: data.conversion_rates.GBP || EXCHANGE_RATES.GBP,
        INR: data.conversion_rates.INR || EXCHANGE_RATES.INR,
        AUD: data.conversion_rates.AUD || EXCHANGE_RATES.AUD,
        CAD: data.conversion_rates.CAD || EXCHANGE_RATES.CAD,
        JPY: data.conversion_rates.JPY || EXCHANGE_RATES.JPY,
      };
    }

    return EXCHANGE_RATES;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return EXCHANGE_RATES;
  }
}
