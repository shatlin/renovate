'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, ChevronRight, Plus, Edit2, Trash2, Package, 
  HardHat, Wrench, MoreHorizontal, ShoppingCart, DollarSign,
  Calendar, FileText, Hash, Save, X, Check, Home, Layers,
  StickyNote, FileTextIcon
} from 'lucide-react'

interface BudgetActual {
  id: number
  detail_id: number
  name: string
  quantity: number
  unit_price: number
  total_amount: number
  vendor?: string
  invoice_number?: string
  purchase_date?: string
  payment_method?: string
  notes?: string
}

interface BudgetDetail {
  id: number
  detail_type: 'material' | 'labour' | 'service' | 'other' | 'new_item'
  name: string
  description?: string
  quantity: number
  unit_price: number
  total_amount: number
  vendor?: string
  purchase_date?: string
  invoice_number?: string
  notes?: string
  actuals?: BudgetActual[]
  actual_total?: number
}

interface BudgetMasterRowProps {
  projectId: number
  item: {
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
    total_material: number
    total_labour: number
    total_service: number
    total_other: number
    total_new_item: number
    detail_count: number
    details?: BudgetDetail[]
    status: string
    notes?: string
    long_notes?: string
  }
  rooms: any[]
  categories: any[]
  onAddDetail: (masterId: number) => void
  onEditMaster: (item: any) => void
  onDeleteMaster: (masterId: number) => void
  onEditDetail: (detail: BudgetDetail) => void
  onDeleteDetail: (detailId: number) => void
  onAddActual: (detailId: number, detailName: string) => void
  onEditActual: (actual: BudgetActual, detailName: string) => void
  onDeleteActual: (actualId: number) => void
  onOpenNotesModal?: (item: any) => void
  onRefresh?: () => void
  expandedDetailsAfterActual?: Set<number>
  forceExpandAll?: boolean
}

const getDetailTypeIcon = (type: string) => {
  switch (type) {
    case 'material': return Package
    case 'labour': return HardHat
    case 'service': return Wrench
    case 'new_item': return ShoppingCart
    default: return MoreHorizontal
  }
}

const getDetailTypeColor = (type: string) => {
  switch (type) {
    case 'material': return 'text-blue-500 bg-blue-50'
    case 'labour': return 'text-green-500 bg-green-50'
    case 'service': return 'text-purple-500 bg-purple-50'
    case 'new_item': return 'text-orange-500 bg-orange-50'
    default: return 'text-gray-500 bg-gray-50'
  }
}

export default function BudgetMasterDetailRowEditable({
  projectId,
  item,
  rooms,
  categories,
  onAddDetail,
  onEditMaster,
  onDeleteMaster,
  onEditDetail,
  onDeleteDetail,
  onAddActual,
  onEditActual,
  onDeleteActual,
  onOpenNotesModal,
  onRefresh,
  expandedDetailsAfterActual,
  forceExpandAll
}: BudgetMasterRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [details, setDetails] = useState<BudgetDetail[]>(item.details || [])
  const [expandedDetails, setExpandedDetails] = useState<Set<number>>(new Set())
  
  // Handle force expand all
  useEffect(() => {
    if (forceExpandAll !== undefined) {
      setIsExpanded(forceExpandAll)
      if (forceExpandAll) {
        // Expand all details too
        const allDetailIds = new Set(details.map(d => d.id))
        setExpandedDetails(allDetailIds)
      } else {
        // Collapse all details
        setExpandedDetails(new Set())
      }
    }
  }, [forceExpandAll, details])
  
  // Auto-expand details that just had actuals added
  useEffect(() => {
    if (expandedDetailsAfterActual && expandedDetailsAfterActual.size > 0) {
      setExpandedDetails(prev => {
        const newSet = new Set(prev)
        expandedDetailsAfterActual.forEach(id => newSet.add(id))
        return newSet
      })
    }
  }, [expandedDetailsAfterActual])
  const [isSaving, setIsSaving] = useState(false)
  
  // Edit form state
  const [editData, setEditData] = useState({
    name: item.name,
    description: item.description || '',
    room_id: item.room_id || '',
    category_id: item.category_id || ''
  })

  // Update local state when props change
  useEffect(() => {
    setDetails(item.details || [])
  }, [item.details])

  const loadDetails = async () => {
    if (details.length > 0 || loadingDetails) return
    
    setLoadingDetails(true)
    try {
      const response = await fetch(`/api/budget-items/${item.id}/details`)
      if (response.ok) {
        const data = await response.json()
        setDetails(data)
      }
    } catch (error) {
      console.error('Failed to load details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const loadActuals = async (detailId: number) => {
    try {
      const response = await fetch(`/api/budget-details/${detailId}/actuals`)
      if (response.ok) {
        const actuals = await response.json()
        setDetails(prevDetails => 
          prevDetails.map(d => 
            d.id === detailId 
              ? { ...d, actuals, actual_total: actuals.reduce((sum: number, a: BudgetActual) => sum + a.total_amount, 0) }
              : d
          )
        )
      }
    } catch (error) {
      console.error('Failed to load actuals:', error)
    }
  }

  const toggleDetailExpand = (detailId: number) => {
    const newExpanded = new Set(expandedDetails)
    if (newExpanded.has(detailId)) {
      newExpanded.delete(detailId)
    } else {
      newExpanded.add(detailId)
      const detail = details.find(d => d.id === detailId)
      if (detail && !detail.actuals) {
        loadActuals(detailId)
      }
    }
    setExpandedDetails(newExpanded)
  }

  const toggleExpand = () => {
    if (!isExpanded && details.length === 0) {
      loadDetails()
    }
    setIsExpanded(!isExpanded)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/budget-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (!response.ok) throw new Error('Failed to update')

      setIsEditMode(false)
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: item.name,
      description: item.description || '',
      room_id: item.room_id || '',
      category_id: item.category_id || ''
    })
    setIsEditMode(false)
  }

  const estimatedTotal = item.estimated_cost || 0
  const actualTotal = item.actual_cost || 0
  const variance = actualTotal - estimatedTotal
  const hasActualCost = actualTotal !== null && actualTotal !== undefined && actualTotal > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      {/* Master Row */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="p-4">
          {isEditMode ? (
            // Edit Mode - Inline Form
            <div className="flex items-center gap-4">
              <button
                onClick={toggleExpand}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Name Field */}
              <div className="flex-1">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Item name"
                  autoFocus
                />
              </div>

              {/* Room Selector */}
              <select
                value={editData.room_id}
                onChange={(e) => setEditData({ ...editData, room_id: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Room</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>

              {/* Category Selector */}
              <select
                value={editData.category_id}
                onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              {/* Description Field */}
              <input
                type="text"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Description (optional)"
              />

              {/* Budget Display (Read-only) */}
              <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500">Estimated</div>
                  <div className="font-semibold text-gray-900">R{estimatedTotal.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Actual</div>
                  <div className="font-semibold text-gray-900">
                    {hasActualCost ? `R${actualTotal.toLocaleString()}` : '-'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            // View Mode - Normal Display
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <button
                  onClick={toggleExpand}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                    {item.room_name && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                        {item.room_name}
                      </span>
                    )}
                    {item.category_name && (
                      <span 
                        className="px-2 py-1 rounded-lg text-xs"
                        style={{ 
                          backgroundColor: `${item.category_color}15`,
                          color: item.category_color 
                        }}
                      >
                        {item.category_name}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                      {item.detail_count} items
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-8">
                {/* Breakdown by type - Fixed width */}
                <div className="flex gap-3 text-sm min-w-[250px]">
                  {item.total_material > 0 && (
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">R{item.total_material.toLocaleString()}</span>
                    </div>
                  )}
                  {item.total_labour > 0 && (
                    <div className="flex items-center gap-1">
                      <HardHat className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">R{item.total_labour.toLocaleString()}</span>
                    </div>
                  )}
                  {item.total_service > 0 && (
                    <div className="flex items-center gap-1">
                      <Wrench className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-600">R{item.total_service.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Budget Summary - Fixed width columns for consistent alignment */}
                <div className="flex items-center gap-4">
                  <div className="text-right w-24">
                    <div className="text-xs text-gray-500">Estimated</div>
                    <div className="text-base font-semibold text-gray-900">
                      R{estimatedTotal.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="text-right w-20">
                    <div className="text-xs text-gray-500">Actual</div>
                    <div className={`text-base font-semibold ${hasActualCost ? 'text-gray-900' : 'text-gray-400'}`}>
                      {hasActualCost ? `R${actualTotal.toLocaleString()}` : 'R0'}
                    </div>
                  </div>
                  
                  <div className="text-right w-24">
                    <div className="text-xs text-gray-500">Variance</div>
                    <div className={`text-base font-semibold ${variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {variance !== 0 ? `${variance > 0 ? '+' : ''}R${Math.abs(variance).toLocaleString()}` : 'R0'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAddDetail(item.id)}
                    className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    title="Add Detail"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  {onOpenNotesModal && (
                    <button
                      onClick={() => onOpenNotesModal(item)}
                      className="p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                      title="Notes"
                    >
                      <StickyNote className="w-4 h-4 text-yellow-600" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteMaster(item.id, item.name)}
                    className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail Rows - Same as before */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100 overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
                {loadingDetails ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : details.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No detail items yet</p>
                    <button
                      onClick={() => onAddDetail(item.id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      Add First Detail Item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {details.map((detail) => {
                      const Icon = getDetailTypeIcon(detail.detail_type)
                      const colorClass = getDetailTypeColor(detail.detail_type)
                      const isDetailExpanded = expandedDetails.has(detail.id)
                      const actualTotal = detail.actual_total || 0
                      const budgetTotal = detail.total_amount
                      const actualCount = detail.actuals?.length || 0
                      
                      return (
                        <div key={detail.id} className="space-y-2">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300"
                          >
                            <div className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <button
                                    onClick={() => toggleDetailExpand(detail.id)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    {isDetailExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-gray-600" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-600" />
                                    )}
                                  </button>
                                  <div className={`p-2 rounded-lg ${colorClass}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900">{detail.name}</span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                                        {detail.detail_type}
                                      </span>
                                      {actualCount > 0 && (
                                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                                          {actualCount} actual{actualCount > 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        Budget: {detail.quantity} × R{detail.unit_price} = R{budgetTotal.toLocaleString()}
                                      </span>
                                      {actualTotal > 0 && (
                                        <span className={`font-medium ${actualTotal > budgetTotal ? 'text-red-600' : 'text-green-600'}`}>
                                          Actual: R{actualTotal.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => onAddActual(detail.id, detail.name)}
                                    className="p-1.5 hover:bg-green-50 rounded-lg transition-colors group"
                                    title="Add Actual Expense"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-green-600 group-hover:text-green-700" />
                                  </button>
                                  <button
                                    onClick={() => onEditDetail(detail)}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit Detail"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteDetail(detail.id, detail.name)}
                                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Detail"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Actuals section */}
                            {isDetailExpanded && (
                              <div className="border-t border-gray-100 p-3 bg-gray-50">
                                {detail.actuals && detail.actuals.length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="text-xs font-medium text-gray-600 mb-2">Actuals:</div>
                                    {detail.actuals.map((actual) => (
                                      <div
                                        key={actual.id}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base font-medium text-gray-900">{actual.name}</span>
                                            {actual.invoice_number && (
                                              <span className="text-sm text-gray-500">[{actual.invoice_number}]</span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                            {actual.purchase_date && (
                                              <span className="font-medium">{new Date(actual.purchase_date).toLocaleDateString()}: </span>
                                            )}
                                            <span className="font-medium">{actual.quantity} × R{actual.unit_price} = R{actual.total_amount.toLocaleString()}</span>
                                            {actual.vendor && <span>• {actual.vendor}</span>}
                                            {actual.payment_method && <span>• {actual.payment_method}</span>}
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={() => onEditActual(actual, detail.name)}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                          >
                                            <Edit2 className="w-4 h-4 text-gray-500" />
                                          </button>
                                          <button
                                            onClick={() => onDeleteActual(actual.id, actual.name)}
                                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                          >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </motion.div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}