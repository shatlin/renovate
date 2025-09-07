'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, Grip, Star } from 'lucide-react'
import AddVendorModal from './AddVendorModal'
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

interface Vendor {
  id: number
  name: string
  company?: string
  phone?: string
  email?: string
  specialization?: string
  rating?: number
  notes?: string
  display_order: number
}

interface VendorsListProps {
  projectId: number
  vendors: Vendor[]
  onUpdate: () => void
}

function SortableVendor({ vendor, onEdit, onDelete }: { vendor: Vendor; onEdit: () => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vendor.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            <Grip className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{vendor.name}</h4>
            {vendor.company && (
              <p className="text-sm text-gray-500">{vendor.company}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {vendor.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{vendor.phone}</span>
                </div>
              )}
              {vendor.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{vendor.email}</span>
                </div>
              )}
              {vendor.specialization && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                  {vendor.specialization}
                </span>
              )}
              {vendor.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span>{vendor.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
    </motion.div>
  )
}

export default function VendorsList({ projectId, vendors, onUpdate }: VendorsListProps) {
  const [localVendors, setLocalVendors] = useState<Vendor[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    setLocalVendors(vendors.sort((a, b) => a.display_order - b.display_order))
  }, [vendors])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localVendors.findIndex((v) => v.id === active.id)
      const newIndex = localVendors.findIndex((v) => v.id === over.id)

      const newVendors = arrayMove(localVendors, oldIndex, newIndex)
      setLocalVendors(newVendors)

      // Update display_order for all vendors
      const updates = newVendors.map((vendor, index) => ({
        id: vendor.id,
        display_order: index
      }))

      setIsSaving(true)
      try {
        const response = await fetch(`/api/projects/${projectId}/vendors/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendors: updates })
        })
        
        if (response.ok) {
          onUpdate()
        }
      } catch (error) {
        console.error('Error reordering vendors:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleDelete = async (vendorId: number) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return
    
    try {
      const response = await fetch(`/api/projects/${projectId}/vendors/${vendorId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error deleting vendor:', error)
    }
  }

  if (localVendors.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors yet</h3>
          <p className="text-gray-600 mb-6">Add vendors and contractors for your project</p>
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Your First Vendor
          </motion.button>
        </div>

        {(showAddModal || editingVendor) && (
          <AddVendorModal
            projectId={projectId}
            vendor={editingVendor}
            onClose={() => {
              setShowAddModal(false)
              setEditingVendor(null)
            }}
            onSuccess={() => {
              setShowAddModal(false)
              setEditingVendor(null)
              onUpdate()
            }}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Vendors & Contractors</h3>
            <p className="text-sm text-gray-600 mt-1">Drag to reorder vendors</p>
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Vendor
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
            items={localVendors.map(v => v.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {localVendors.map((vendor) => (
                <SortableVendor
                  key={vendor.id}
                  vendor={vendor}
                  onEdit={() => setEditingVendor(vendor)}
                  onDelete={() => handleDelete(vendor.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {vendors.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Total vendors: {vendors.length}
            </p>
          </div>
        )}
      </div>

      {(showAddModal || editingVendor) && (
        <AddVendorModal
          projectId={projectId}
          vendor={editingVendor}
          onClose={() => {
            setShowAddModal(false)
            setEditingVendor(null)
          }}
          onSuccess={() => {
            setShowAddModal(false)
            setEditingVendor(null)
            onUpdate()
          }}
        />
      )}
    </>
  )
}