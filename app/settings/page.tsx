'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, User, Coins, Save, Check } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { currencies } from '@/lib/currencies'

interface UserSettings {
  id: number
  email: string
  name: string
  currency: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    currency: 'ZAR'
  })

  useEffect(() => {
    fetchUserSettings()
  }, [])

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setFormData({
          name: data.name || '',
          currency: data.currency || 'ZAR'
        })
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        await fetchUserSettings()
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* User Info Section */}
          <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.email}</h2>
                <p className="text-gray-600">Account ID: {user?.id}</p>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="p-6 space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Coins className="w-4 h-4 inline mr-1" />
                Preferred Currency
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.code} ({curr.name})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                This currency will be used for all your projects and budget calculations
              </p>
            </div>

            {/* Currency Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Currency Preview:</p>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-gray-900">
                  {currencies.find(c => c.code === formData.currency)?.symbol}1,000
                </span>
                <span className="text-gray-600">
                  ({currencies.find(c => c.code === formData.currency)?.name})
                </span>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                  saved
                    ? 'bg-green-600 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}