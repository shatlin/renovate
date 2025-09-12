'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, Clock, User, X, Edit2, Trash2, Save } from 'lucide-react'

interface Note {
  id: number
  note: string
  created_at: string
  created_by_name?: string
}

interface BudgetItemNotesProps {
  budgetItemId: number
  projectId: number
}

export default function BudgetItemNotes({ budgetItemId, projectId }: BudgetItemNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [budgetItemId])

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/budget-items/${budgetItemId}/notes`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/budget-items/${budgetItemId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote })
      })

      if (response.ok) {
        const newNoteData = await response.json()
        setNotes([newNoteData, ...notes])
        setNewNote('')
        setIsAdding(false)
      }
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/projects/${projectId}/budget-items/${budgetItemId}/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotes(notes.filter(n => n.id !== noteId))
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-700">Individual Notes</h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {notes.length}
          </span>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-20"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setNewNote('')
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={loading || !newNote.trim()}
                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notes.length === 0 && !isAdding ? (
          <p className="text-sm text-gray-500 italic text-center py-4">
            No notes yet. Click "Add Note" to add your first note.
          </p>
        ) : (
          notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingId === note.id ? (
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(note.created_at)}
                    </div>
                    {note.created_by_name && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        {note.created_by_name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {editingId === note.id ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditingText('')
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Save logic here
                          setEditingId(null)
                        }}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(note.id)
                          setEditingText(note.note)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}