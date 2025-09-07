'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, DollarSign, Package, Grip, AlertCircle, Home, Ruler, Hammer, X, Save, Sparkles } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Room {
  id: number
  name: string
  area_sqft?: number
  renovation_type?: string
  estimated_budget?: number
  actual_cost?: number
  status?: string
  display_order: number
  _count?: {
    items: number
  }
}

interface RoomsListProps {
  projectId: number
  rooms: Room[]
  onUpdate: () => void
}

function SortableRoom({ room, onEdit, onDelete }: { room: Room; onEdit: () => void; onDelete: () => void }) {
  const { formatCurrency } = useCurrency()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: room.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'from-green-500 to-emerald-500'
      case 'in_progress': return 'from-blue-500 to-indigo-500'
      case 'planned': return 'from-gray-400 to-gray-500'
      default: return 'from-gray-300 to-gray-400'
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed': return { text: 'Completed', bg: 'bg-green-100 text-green-800' }
      case 'in_progress': return { text: 'In Progress', bg: 'bg-blue-100 text-blue-800' }
      case 'planned': return { text: 'Planned', bg: 'bg-gray-100 text-gray-800' }
      default: return { text: 'Not Started', bg: 'bg-gray-100 text-gray-600' }
    }
  }

  const statusBadge = getStatusBadge(room.status)

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all ${isDragging ? 'z-50' : ''}`}
      whileHover={{ y: -2 }}
    >
      <div className={`h-2 bg-gradient-to-r ${getStatusColor(room.status)} rounded-t-xl`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Grip className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                {room.area_sqft && (
                  <span className="flex items-center gap-1">
                    <span className="text-purple-500">📐</span>
                    {room.area_sqft} sq ft
                  </span>
                )}
                {room.renovation_type && (
                  <span className="flex items-center gap-1">
                    <span className="text-blue-500">🔨</span>
                    {room.renovation_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg}`}>
              {statusBadge.text}
            </span>
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Budget</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(room.estimated_budget || 0)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Actual</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(room.actual_cost || 0)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs font-medium">Items</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {room._count?.items || 0}
            </p>
          </div>
        </div>

        {room.actual_cost && room.estimated_budget && room.actual_cost > room.estimated_budget && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">
              Over budget by {formatCurrency(room.actual_cost - room.estimated_budget)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function RoomsList({ projectId, rooms: initialRooms, onUpdate }: RoomsListProps) {
  const [rooms, setRooms] = useState(initialRooms)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { formatCurrency, getCurrencySymbol } = useCurrency()

  useEffect(() => {
    // Sort rooms by display_order
    const sortedRooms = [...initialRooms].sort((a, b) => 
      (a.display_order ?? 999) - (b.display_order ?? 999)
    )
    setRooms(sortedRooms)
  }, [initialRooms])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = rooms.findIndex((room) => room.id === active.id)
      const newIndex = rooms.findIndex((room) => room.id === over?.id)

      const newRooms = arrayMove(rooms, oldIndex, newIndex)
      setRooms(newRooms)

      // Update display_order for all rooms
      const roomOrders = newRooms.map((room, index) => ({
        id: room.id,
        display_order: index
      }))

      setIsSaving(true)
      try {
        const response = await fetch(`/api/projects/${projectId}/rooms/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomOrders })
        })

        if (!response.ok) {
          throw new Error('Failed to save room order')
        }
      } catch (error) {
        console.error('Error saving room order:', error)
        // Revert on error
        setRooms(initialRooms)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleDelete = async (roomId: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    try {
      const response = await fetch(`/api/projects/${projectId}/rooms/${roomId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error deleting room:', error)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Rooms</h2>
            <p className="text-sm text-gray-600 mt-1">Drag to reorder rooms</p>
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </motion.button>
        </div>

        {isSaving && (
          <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            Saving order...
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rooms.map(r => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {rooms.map((room) => (
                <SortableRoom
                  key={room.id}
                  room={room}
                  onEdit={() => setEditingRoom(room)}
                  onDelete={() => handleDelete(room.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {rooms.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No rooms added yet. Add your first room to get started!</p>
          </div>
        )}
      </div>

      {(showAddModal || editingRoom) && (
        <RoomModal
          projectId={projectId}
          room={editingRoom}
          onClose={() => {
            setShowAddModal(false)
            setEditingRoom(null)
          }}
          onSuccess={() => {
            setShowAddModal(false)
            setEditingRoom(null)
            onUpdate()
          }}
        />
      )}
    </>
  )
}

function RoomModal({ projectId, room, onClose, onSuccess }: {
  projectId: number
  room?: Room | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: room?.name || '',
    area_sqft: room?.area_sqft?.toString() || '',
    renovation_type: room?.renovation_type || '',
    status: room?.status || 'planned'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const url = room 
        ? `/api/projects/${projectId}/rooms/${room.id}`
        : `/api/projects/${projectId}/rooms`
      
      const payload = {
        name: formData.name,
        area_sqft: formData.area_sqft ? parseFloat(formData.area_sqft) : null,
        renovation_type: formData.renovation_type || null,
        status: formData.status
      }
      
      const response = await fetch(url, {
        method: room ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        console.error('Failed to save room:', error)
      }
    } catch (error) {
      console.error('Error saving room:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Beautiful Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {room ? 'Edit Room' : 'Add New Room'}
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  {room ? 'Update room details' : 'Create a new room for your renovation'}
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
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Room Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Master Bedroom, Kitchen"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Ruler className="w-4 h-4 text-blue-500" />
                Area (sq ft)
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                  value={formData.area_sqft}
                  onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                  placeholder="250"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">sq ft</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Hammer className="w-4 h-4 text-orange-500" />
                Renovation Type
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                value={formData.renovation_type}
                onChange={(e) => setFormData({ ...formData, renovation_type: e.target.value })}
              >
                <option value="">Select type...</option>
                <option value="Full Renovation">Full Renovation</option>
                <option value="Partial Renovation">Partial Renovation</option>
                <option value="Cosmetic Update">Cosmetic Update</option>
                <option value="Structural Work">Structural Work</option>
                <option value="Painting Only">Painting Only</option>
                <option value="Flooring Only">Flooring Only</option>
                <option value="Fixtures Update">Fixtures Update</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
              <div className="grid grid-cols-3 gap-2">
                {['planned', 'in_progress', 'completed'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status })}
                    className={`px-3 py-3 rounded-xl font-medium transition-all ${
                      formData.status === status
                        ? status === 'completed' 
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {status === 'planned' && '📋'}
                    {status === 'in_progress' && '🚧'}
                    {status === 'completed' && '✅'}
                    <span className="ml-1 text-sm capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
          </div>

          {/* Beautiful Footer */}
          <div className="border-t border-gray-200 -mx-8 px-8 py-6 mt-8 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50">
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
                className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {room ? 'Update' : 'Create'} Room
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