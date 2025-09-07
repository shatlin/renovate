'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol as getCurrencySymbolUtil } from '@/lib/currencies'

interface CurrencyContextType {
  currency: string
  formatCurrency: (amount: number) => string
  getCurrencySymbol: () => string
  getCurrencyCode: () => string
  updateCurrency: (currency: string) => void
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'ZAR',
  formatCurrency: (amount: number) => formatCurrencyUtil(amount, 'ZAR'),
  getCurrencySymbol: () => getCurrencySymbolUtil('ZAR'),
  getCurrencyCode: () => 'ZAR',
  updateCurrency: () => {}
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState('ZAR')

  useEffect(() => {
    fetchUserCurrency()
  }, [])

  const fetchUserCurrency = async () => {
    try {
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        setCurrency(data.currency || 'ZAR')
      }
    } catch (error) {
      console.error('Error fetching user currency:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency)
  }

  const getCurrencySymbol = () => {
    return getCurrencySymbolUtil(currency)
  }

  const getCurrencyCode = () => {
    return currency
  }

  const updateCurrency = (newCurrency: string) => {
    setCurrency(newCurrency)
  }

  return (
    <CurrencyContext.Provider value={{ currency, formatCurrency, getCurrencySymbol, getCurrencyCode, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}