'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Building2, Phone, Mail, Wrench, Star, FileText, X, Save, StarIcon } from 'lucide-react'

interface Vendor {
  id: number
  name: string
  company?: string
  phone?: string
  email?: string
  specialization?: string
  rating?: number
  notes?: string
}

interface AddVendorModalProps {
  projectId: number
  vendor?: Vendor | null
  onClose: () => void
  onSuccess: () => void
}

export default function AddVendorModal({ projectId, vendor, onClose, onSuccess }: AddVendorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    specialization: '',
    rating: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        company: vendor.company || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        specialization: vendor.specialization || '',
        rating: vendor.rating?.toString() || '',
        notes: vendor.notes || ''
      })
    }
  }, [vendor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const url = vendor 
        ? `/api/projects/${projectId}/vendors/${vendor.id}`
        : `/api/projects/${projectId}/vendors`
      
      const payload = {
        ...formData,
        rating: formData.rating ? parseFloat(formData.rating) : null
      }
      
      const response = await fetch(url, {
        method: vendor ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        console.error('Failed to save vendor:', error)
        alert(`Failed to save vendor: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(vendor ? 'Error updating vendor:' : 'Error creating vendor:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save vendor'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const specializationOptions = [
    'General Contractor',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Painting',
    'Flooring',
    'Roofing',
    'Carpentry',
    'Masonry',
    'Landscaping',
    'Interior Design',
    'Architecture',
    'Engineering',
    'Demolition',
    'Tiling',
    'Windows & Doors',
    'Kitchen Specialist',
    'Bathroom Specialist'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Beautiful Header */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {vendor ? 'Edit Vendor' : 'Add New Vendor'}
                </h2>
                <p className="text-orange-100 text-sm mt-1">
                  {vendor ? 'Update vendor information' : 'Add a contractor or service provider'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Name and Company */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 text-orange-500" />
                Contact Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 text-pink-500" />
                Company
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Smith Construction Co."
              />
            </div>
          </div>

          {/* Phone and Email */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 text-blue-500" />
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 text-green-500" />
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@smithconstruction.com"
              />
            </div>
          </div>

          {/* Specialization and Rating */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Wrench className="w-4 h-4 text-purple-500" />
                Specialization
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              >
                <option value="">Select specialization...</option>
                {specializationOptions.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star.toString() })}
                    className={`p-2 rounded-lg transition-all ${
                      parseFloat(formData.rating) >= star
                        ? 'text-yellow-500 bg-yellow-50 scale-110'
                        : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-50'
                    }`}
                  >
                    <StarIcon className={`w-6 h-6 ${parseFloat(formData.rating) >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
                {formData.rating && (
                  <span className="ml-2 flex items-center text-sm text-gray-600">
                    {formData.rating} / 5
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Notes & Comments
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this vendor, past work experience, pricing, availability, etc..."
            />
          </div>

          {/* Beautiful Footer */}
          <div className="border-t border-gray-200 -mx-8 px-8 py-6 mt-8 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50">
            <div className="flex justify-end gap-3">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 text-gray-700 hover:text-gray-900 font-medium text-lg transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting || !formData.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-xl hover:from-orange-700 hover:to-pink-700 transition-all font-medium text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {vendor ? 'Update' : 'Add'} Vendor
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}