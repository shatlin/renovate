'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'

interface AddTimelineNoteProps {
  entryId: number
  onSuccess: () => void
}

export default function AddTimelineNote({ entryId, onSuccess }: AddTimelineNoteProps) {
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return

    setIsSubmitting(true)
    try {
      const projectId = window.location.pathname.split('/').pop()
      const response = await fetch(`/api/projects/${projectId}/timeline/${entryId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note })
      })

      if (response.ok) {
        setNote('')
        onSuccess()
      }
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Add a progress update
      </label>
      <div className="relative">
        <textarea
          placeholder="What progress was made today? Any issues or highlights?"
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[80px] text-gray-700 placeholder:text-gray-400"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isSubmitting}
        />
        <motion.button
          type="submit"
          disabled={!note.trim() || isSubmitting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </motion.button>
      </div>
      <p className="text-xs text-gray-500">
        Track daily progress, issues, and milestones for this renovation phase
      </p>
    </form>
  )
}