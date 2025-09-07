'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Save, X } from 'lucide-react'

interface ActionPlanModalProps {
  projectId: number
  entry: any
  onClose: () => void
  onSuccess: () => void
}

export default function ActionPlanModal({ projectId, entry, onClose, onSuccess }: ActionPlanModalProps) {
  const [actionPlan, setActionPlan] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load existing action plan if available
    const loadActionPlan = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/projects/${projectId}/timeline/${entry.id}/action-plan`)
        if (response.ok) {
          const data = await response.json()
          setActionPlan(data.action_plan || '')
        }
      } catch (error) {
        console.error('Error loading action plan:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadActionPlan()
  }, [projectId, entry.id])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/timeline/${entry.id}/action-plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_plan: actionPlan })
      })

      if (response.ok) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error saving action plan:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl w-[95vw] max-w-7xl h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Action Plan</h2>
                <p className="text-blue-100 mt-1">{entry.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Action Plan
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Define step-by-step actions, tasks, and requirements for this renovation phase.
            </p>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <textarea
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                placeholder={`Example format:

Day 1: Preparation
- Remove all furniture and protect floors
- Set up dust barriers
- Turn off water and electricity to the area

Day 2: Demolition
- Remove existing fixtures
- Demolish old tiles
- Clear debris

Materials Needed:
- Protective sheets
- Demolition tools
- Waste bags

Safety Requirements:
- Wear protective gear
- Ensure proper ventilation
- Have first aid kit ready

Quality Checkpoints:
- Inspect for structural damage
- Verify measurements
- Check for mold or water damage`}
                className="w-full flex-1 min-h-[500px] px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm leading-relaxed"
              />
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Tips:</strong> Include daily tasks, material lists, safety requirements, 
              quality checkpoints, and coordination notes. This plan will guide the execution of this phase.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {actionPlan.length > 0 && (
                <span>{actionPlan.split('\n').length} lines • {actionPlan.length} characters</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !actionPlan.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Action Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}