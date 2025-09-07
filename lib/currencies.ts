export interface Currency {
  code: string
  symbol: string
  name: string
  locale: string
}

export const currencies: Currency[] = [
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'ar-EG' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH' },
]

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const currency = currencies.find(c => c.code === currencyCode) || currencies.find(c => c.code === 'USD')!
  
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch (error) {
    // Fallback formatting if Intl fails
    return `${currency.symbol}${amount.toLocaleString()}`
  }
}

export function getCurrencySymbol(currencyCode: string): string {
  const currency = currencies.find(c => c.code === currencyCode)
  return currency?.symbol || '$'
}