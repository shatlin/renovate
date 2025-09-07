'use client'

import { useState, useEffect } from 'react'
import { Package, Edit2, Trash2, GripVertical, ChevronUp, ChevronDown, ChevronsUpDown, Filter, X, Home, Layers, CircleDot, RotateCcw } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

const iconMap: any = {
  Package: Package,
  // Add more icons as needed
}

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
  status: string
  vendor?: string
  notes?: string
  timeline_refs?: any[]
  display_order?: number
  type?: string
}

interface Props {
  projectId: number
  budgetItems: BudgetItem[]
  onEdit: (item: BudgetItem) => void
  onDelete: (id: number) => void
  onReorder?: (items: BudgetItem[]) => void
}

type SortField = 'name' | 'room' | 'category' | 'timeline' | 'estimated' | 'actual' | 'status' | null
type SortDirection = 'asc' | 'desc'

export default function BudgetItemsList({ 
  projectId, 
  budgetItems, 
  onEdit, 
  onDelete,
  onReorder 
}: Props) {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filterRoom, setFilterRoom] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Extract unique values for filters
  const rooms = [...new Set(budgetItems.map(item => item.room_name).filter(Boolean))]
  const categories = [...new Set(budgetItems.map(item => item.category_name).filter(Boolean))]
  const statuses = [...new Set(budgetItems.map(item => item.status).filter(Boolean))]

  useEffect(() => {
    let filtered = [...budgetItems]
    
    // Apply filters
    if (filterRoom !== 'all') {
      filtered = filtered.filter(item => item.room_name === filterRoom)
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category_name === filterCategory)
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus)
    }
    
    let sorted = filtered
    
    if (sortField) {
      sorted.sort((a, b) => {
        let aValue: any
        let bValue: any
        
        switch(sortField) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'room':
            aValue = a.room_name?.toLowerCase() || ''
            bValue = b.room_name?.toLowerCase() || ''
            break
          case 'category':
            aValue = a.category_name?.toLowerCase() || ''
            bValue = b.category_name?.toLowerCase() || ''
            break
          case 'timeline':
            aValue = a.timeline_refs?.length || 0
            bValue = b.timeline_refs?.length || 0
            break
          case 'estimated':
            aValue = a.estimated_cost
            bValue = b.estimated_cost
            break
          case 'actual':
            aValue = a.actual_cost || 0
            bValue = b.actual_cost || 0
            break
          case 'status':
            aValue = a.status.toLowerCase()
            bValue = b.status.toLowerCase()
            break
          default:
            return 0
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    } else {
      // Default sort by display_order if no sort is applied
      sorted.sort((a, b) => {
        if (a.display_order !== undefined && b.display_order !== undefined) {
          return a.display_order - b.display_order
        }
        return a.id - b.id
      })
    }
    
    setItems(sorted)
  }, [budgetItems, sortField, sortDirection, filterRoom, filterCategory, filterStatus])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    const statusConfig: any = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      purchased: { color: 'bg-blue-100 text-blue-800', label: 'Purchased' },
      installed: { color: 'bg-purple-100 text-purple-800', label: 'Installed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }


  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // If clicking a different field, set new field and reset to ascending
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    // Clear sorting when manually reordering
    setSortField(null)
    
    const newItems = Array.from(items)
    const [reorderedItem] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination.index, 0, reorderedItem)

    // Update display_order for all items
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      display_order: index
    }))

    setItems(updatedItems)

    // Automatically save the new order
    try {
      const response = await fetch(`/api/projects/${projectId}/budget-items/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedItems.map((item, index) => ({
            id: item.id,
            display_order: index
          }))
        })
      })

      if (response.ok && onReorder) {
        onReorder(updatedItems)
      }
    } catch (error) {
      console.error('Error saving order:', error)
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />
  }

  const clearFilters = () => {
    setFilterRoom('all')
    setFilterCategory('all')
    setFilterStatus('all')
  }

  const hasActiveFilters = filterRoom !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No budget items yet. Add your first item to get started.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900">Budget Items</h3>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 text-sm rounded-full font-medium">
              {items.length} items
            </span>
            <span className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 text-sm rounded-full font-medium">
              {formatCurrency(items.reduce((sum, item) => sum + item.estimated_cost, 0))}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {sortField ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="text-sm text-purple-700">Sorted by {sortField}</span>
              <button 
                onClick={() => setSortField(null)}
                className="text-purple-600 hover:text-purple-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              <GripVertical className="w-4 h-4" />
              <span>Drag to reorder</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Filter Controls - Always Visible */}
      <div className="mb-6 p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-800">Filters</h4>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                {[filterRoom !== 'all', filterCategory !== 'all', filterStatus !== 'all'].filter(Boolean).length} active
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
          )}
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Room Filter */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Home className="w-4 h-4 text-blue-500" />
              Room
            </label>
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer ${
                filterRoom !== 'all' 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <option value="all">All Rooms</option>
              {rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Layers className="w-4 h-4 text-purple-500" />
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-sm font-medium transition-all focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer ${
                filterCategory !== 'all' 
                  ? 'bg-purple-50 border-purple-300 text-purple-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CircleDot className="w-4 h-4 text-green-500" />
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-sm font-medium transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer ${
                filterStatus !== 'all' 
                  ? 'bg-green-50 border-green-300 text-green-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-800">{items.length}</span> of <span className="font-semibold text-gray-800">{budgetItems.length}</span> items
            </p>
            <div className="flex flex-wrap gap-2">
              {filterRoom !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <Home className="w-3 h-3" />
                  {filterRoom}
                  <button onClick={() => setFilterRoom('all')} className="ml-1 hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  <Layers className="w-3 h-3" />
                  {filterCategory}
                  <button onClick={() => setFilterCategory('all')} className="ml-1 hover:text-purple-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CircleDot className="w-3 h-3" />
                  {filterStatus}
                  <button onClick={() => setFilterStatus('all')} className="ml-1 hover:text-green-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10"></th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Item
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('room')}
                >
                  <div className="flex items-center gap-1">
                    Room
                    {getSortIcon('room')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Category
                    {getSortIcon('category')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('timeline')}
                >
                  <div className="flex items-center gap-1">
                    Timeline
                    {getSortIcon('timeline')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('estimated')}
                >
                  <div className="flex items-center gap-1">
                    Est. Cost
                    {getSortIcon('estimated')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('actual')}
                >
                  <div className="flex items-center gap-1">
                    Actual
                    {getSortIcon('actual')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="budget-items">
                {(provided) => (
                  <tbody 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="divide-y divide-gray-200"
                  >
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${snapshot.isDragging ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                          >
                            <td className="px-2 cursor-move" {...provided.dragHandleProps}>
                              <GripVertical className="w-5 h-5 text-gray-400" />
                            </td>
                            <BudgetItemRow item={item} onEdit={onEdit} onDelete={onDelete} />
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </DragDropContext>
          </table>
        </div>
      </div>
    </div>
  )
}

// Separate component for row content to avoid repetition
function BudgetItemRow({ item, onEdit, onDelete }: { item: BudgetItem; onEdit: (item: BudgetItem) => void; onDelete: (id: number) => void }) {
  const Icon = iconMap[item.category_icon] || Package

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    const statusConfig: any = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      purchased: { color: 'bg-blue-100 text-blue-800', label: 'Purchased' },
      installed: { color: 'bg-purple-100 text-purple-800', label: 'Installed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }


  return (
    <>
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          {item.description && (
            <p className="text-sm text-gray-600">{item.description}</p>
          )}
          {item.notes && (
            <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{item.room_name || '-'}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: item.category_color }} />
          <span className="text-sm text-gray-900">{item.category_name || '-'}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {item.timeline_refs && item.timeline_refs.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.timeline_refs.slice(0, 2).map((ref: any) => (
              <span key={ref.id} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                {new Date(ref.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ))}
            {item.timeline_refs.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{item.timeline_refs.length - 2} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Not scheduled</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {formatCurrency(item.estimated_cost)}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {item.actual_cost ? formatCurrency(item.actual_cost) : '-'}
      </td>
      <td className="px-6 py-4">
        {getStatusIcon(item.status)}
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </>
  )
}