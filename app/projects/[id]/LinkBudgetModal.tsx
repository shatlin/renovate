'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, X, DollarSign, Package, Check, Filter, Home } from 'lucide-react'

interface BudgetItem {
  id: number
  name: string
  description?: string
  room_id?: number
  room_name?: string
  category_id?: number
  category_name?: string
  category_icon?: string
  category_color?: string
  estimated_cost: number
  actual_cost?: number
  vendor?: string
  notes?: string
  status: string
  timeline_refs?: any[]
}

interface LinkBudgetModalProps {
  projectId: number
  timelineEntryId: number
  existingItems: any[]
  onClose: () => void
  onSuccess: () => void
}

export default function LinkBudgetModal({ 
  projectId, 
  timelineEntryId, 
  existingItems,
  onClose, 
  onSuccess 
}: LinkBudgetModalProps) {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [actualAmounts, setActualAmounts] = useState<Record<number, string>>({})
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [selectedRoom, setSelectedRoom] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [rooms, setRooms] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchBudgetItems()
    
    // Pre-select existing items and load their actual amounts
    if (existingItems && existingItems.length > 0) {
      const existingIds = new Set(existingItems.map(item => item.budget_item_id))
      setSelectedItems(existingIds)
      
      // Load existing actual amounts and notes
      const amounts: Record<number, string> = {}
      const itemNotes: Record<number, string> = {}
      
      existingItems.forEach((item: any) => {
        if (item.actual_amount) {
          amounts[item.budget_item_id] = item.actual_amount.toString()
        }
        if (item.notes) {
          itemNotes[item.budget_item_id] = item.notes
        }
      })
      
      setActualAmounts(amounts)
      setNotes(itemNotes)
    }
  }, [projectId, existingItems])

  const fetchBudgetItems = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/budget-items`)
      const data = await response.json()
      
      // Don't filter out existing items - we want to be able to edit them
      setBudgetItems(data)
      
      // Extract unique rooms and categories for filters
      const uniqueRooms = [...new Set(data.map((item: any) => item.room_name).filter(Boolean))]
      const uniqueCategories = [...new Set(data.map((item: any) => item.category_name).filter(Boolean))]
      
      setRooms(uniqueRooms)
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching budget items:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItems.size === 0) return

    setIsSubmitting(true)
    try {
      // Process each selected item
      for (const itemId of selectedItems) {
        const item = budgetItems.find(b => b.id === itemId)
        if (!item) continue

        const response = await fetch(`/api/projects/${projectId}/timeline/${timelineEntryId}/budget-items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            budget_item_id: itemId,
            allocated_amount: item.estimated_cost,
            actual_amount: parseFloat(actualAmounts[itemId]) || 0,
            notes: notes[itemId] || ''
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Failed to link item ${itemId}:`, errorText)
          // Continue with other items even if one fails
          continue
        }

        // Update the actual cost in the main budget item if actual amount was provided
        if (actualAmounts[itemId]) {
          await fetch(`/api/projects/${projectId}/budget-items/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actual_cost: parseFloat(actualAmounts[itemId])
            })
          })
        }
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error linking budget items:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
      // Clear actual amount and notes when deselecting
      const newActuals = { ...actualAmounts }
      const newNotes = { ...notes }
      delete newActuals[itemId]
      delete newNotes[itemId]
      setActualAmounts(newActuals)
      setNotes(newNotes)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const filteredItems = budgetItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRoom = selectedRoom === 'all' || item.room_name === selectedRoom
    const matchesCategory = selectedCategory === 'all' || item.category_name === selectedCategory
    
    return matchesSearch && matchesRoom && matchesCategory
  })

  const totalEstimated = Array.from(selectedItems).reduce((sum, itemId) => {
    const item = budgetItems.find(b => b.id === itemId)
    return sum + (item?.estimated_cost || 0)
  }, 0)

  const totalActual = Array.from(selectedItems).reduce((sum, itemId) => {
    return sum + (parseFloat(actualAmounts[itemId]) || 0)
  }, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Link Budget Items & Assign Actuals</h2>
              <p className="text-sm text-gray-600 mt-1">Select items and enter actual expenses for this timeline entry</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items by name, description, vendor, or notes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filters:</span>
              </div>
              
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Rooms</option>
                {rooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <div className="ml-auto flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {selectedItems.size} selected
                </span>
                {selectedItems.size > 0 && (
                  <button
                    onClick={() => {
                      setSelectedItems(new Set())
                      setActualAmounts({})
                      setNotes({})
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No items found matching your search criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedItems.has(item.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            {existingItems.some((e: any) => e.budget_item_id === item.id) && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                Already linked
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-3 mt-2">
                            {item.room_name && (
                              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                <Home className="w-3 h-3" />
                                {item.room_name}
                              </span>
                            )}
                            {item.category_name && (
                              <span 
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${item.category_color}20`,
                                  color: item.category_color 
                                }}
                              >
                                {item.category_name}
                              </span>
                            )}
                            {item.vendor && (
                              <span className="text-sm text-gray-600">
                                Vendor: {item.vendor}
                              </span>
                            )}
                            {item.status && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                item.status === 'purchased' ? 'bg-blue-100 text-blue-800' :
                                item.status === 'approved' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.status}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <div className="text-sm text-gray-500">Estimated</div>
                          <div className="text-lg font-bold text-gray-900">
                            R{(item.estimated_cost || 0).toLocaleString()}
                          </div>
                          {item.actual_cost && (
                            <div className="text-sm text-green-600 mt-1">
                              Actual: R{item.actual_cost.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actual Amount Input - Only show when selected */}
                      {selectedItems.has(item.id) && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Actual Amount Spent
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  value={actualAmounts[item.id] || ''}
                                  onChange={(e) => setActualAmounts({
                                    ...actualAmounts,
                                    [item.id]: e.target.value
                                  })}
                                  placeholder="Enter actual amount"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={notes[item.id] || ''}
                                onChange={(e) => setNotes({
                                  ...notes,
                                  [item.id]: e.target.value
                                })}
                                placeholder="Any notes about this expense..."
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Summary and Actions */}
        {selectedItems.size > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-sm text-gray-600">
                  Selected {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}
                </div>
                <div className="flex gap-6">
                  <div>
                    <span className="text-sm text-gray-500">Total Estimated: </span>
                    <span className="font-semibold text-gray-900">R{totalEstimated.toLocaleString()}</span>
                  </div>
                  {totalActual > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Total Actual: </span>
                      <span className="font-semibold text-green-600">R{totalActual.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Link & Save Actuals
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}