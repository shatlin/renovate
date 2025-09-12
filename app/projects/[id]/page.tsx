'use client'

import { useState, useEffect, useRef } from 'react'
import { useCurrency } from '@/contexts/CurrencyContext'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, Plus, Edit, Trash2, DollarSign, Home, Package, 
  HardHat, Lightbulb, Sofa, FileText, Palette, Zap, Droplets, 
  Grid3x3, DoorOpen, Trees, MoreHorizontal, TrendingUp, PieChart,
  CheckCircle, Clock, AlertCircle, Calculator, Hammer, Star,
  Phone, Mail, Building2, Wrench, MessageSquare, Edit2, Calendar,
  CalendarDays, StickyNote, ChevronRight, CircleCheck, X,
  Bed, Bath, ChefHat, Tv, TreePine, Wind, Warehouse, FootprintsIcon
} from 'lucide-react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import AddVendorModal from './AddVendorModal'
import AddTimelineModal from './AddTimelineModal'
import AddTimelineNote from './AddTimelineNote'
import LinkBudgetModal from './LinkBudgetModal'
import EditTimelineModal from './EditTimelineModal'
import AddItemModal from './AddItemModal'
import EditItemModal from './EditItemModal'
import RoomsList from './RoomsList'
import BudgetItemsList from './BudgetItemsList'
import VendorsList from './VendorsList'
import ActionPlanModal from './ActionPlanModal'
import BudgetItemNotesModal from './BudgetItemNotesModal'

interface Project {
  id: number
  name: string
  description: string
  total_budget: number
  start_date: string
  target_end_date: string
  status: string
}

interface Room {
  id: number
  name: string
  description: string
  allocated_budget: number
  actual_spent: number
  status: string
}

interface BudgetItem {
  id: number
  name: string
  description: string
  quantity: number
  unit_price: number
  estimated_cost: number
  actual_cost: number
  vendor: string
  status: string
  room_name: string
  category_name: string
  category_icon: string
  category_color: string
}

interface Category {
  id: number
  name: string
  icon: string
  color: string
  description: string
}

interface Vendor {
  id: number
  name: string
  company: string
  phone: string
  email: string
  specialization: string
  rating: number
  notes: string
}

const iconMap: { [key: string]: any } = {
  Package, HardHat, Lightbulb, Home, Sofa, FileText, Palette,
  Zap, Droplets, Grid3x3, DoorOpen, Trees, MoreHorizontal
}

const getRoomIcon = (roomName: string) => {
  const name = roomName.toLowerCase()
  if (name.includes('kitchen')) return { icon: ChefHat, color: '#F97316' } // Orange
  if (name.includes('bathroom')) return { icon: Bath, color: '#06B6D4' } // Cyan
  if (name.includes('bedroom')) return { icon: Bed, color: '#8B5CF6' } // Purple
  if (name.includes('living')) return { icon: Tv, color: '#10B981' } // Green
  if (name.includes('balcony')) return { icon: TreePine, color: '#84CC16' } // Lime
  if (name.includes('walk') || name.includes('corridor')) return { icon: FootprintsIcon, color: '#F59E0B' } // Amber
  if (name.includes('garage') || name.includes('storage')) return { icon: Warehouse, color: '#6B7280' } // Gray
  if (name.includes('whole') || name.includes('house')) return { icon: Home, color: '#3B82F6' } // Blue
  return { icon: DoorOpen, color: '#EC4899' } // Pink for other rooms
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const projectId = params.id as string
  const { formatCurrency, getCurrencySymbol } = useCurrency()

  const [project, setProject] = useState<Project | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [timeline, setTimeline] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddRoomModal, setShowAddRoomModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [notesItem, setNotesItem] = useState<BudgetItem | null>(null)
  const [showAddVendorModal, setShowAddVendorModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [showAddTimelineModal, setShowAddTimelineModal] = useState(false)
  const [selectedTimelineEntry, setSelectedTimelineEntry] = useState<any>(null)
  const [showLinkBudgetModal, setShowLinkBudgetModal] = useState(false)
  const [showEditTimelineModal, setShowEditTimelineModal] = useState(false)
  const [selectedTimelineForBudget, setSelectedTimelineForBudget] = useState<any>(null)
  const [editingTimelineEntry, setEditingTimelineEntry] = useState<any>(null)
  const [showActionPlanModal, setShowActionPlanModal] = useState(false)
  const [selectedEntryForActionPlan, setSelectedEntryForActionPlan] = useState<any>(null)

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const [projectRes, roomsRes, itemsRes, summaryRes, categoriesRes, vendorsRes, timelineRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/rooms`),
        fetch(`/api/projects/${projectId}/budget-items`),
        fetch(`/api/projects/${projectId}/summary`),
        fetch('/api/categories'),
        fetch(`/api/projects/${projectId}/vendors`),
        fetch(`/api/projects/${projectId}/timeline`)
      ])

      // Check if responses are ok before parsing JSON
      const responses = [projectRes, roomsRes, itemsRes, summaryRes, categoriesRes, vendorsRes, timelineRes]
      const results = await Promise.all(
        responses.map(async (res) => {
          if (!res.ok) {
            console.warn(`API call failed: ${res.url} - ${res.status}`)
            return null
          }
          try {
            return await res.json()
          } catch (e) {
            console.error(`Failed to parse JSON from ${res.url}`, e)
            return null
          }
        })
      )

      const [projectData, roomsData, itemsData, summaryData, categoriesData, vendorsData, timelineData] = results

      setProject(projectData)
      setRooms(Array.isArray(roomsData) ? roomsData : [])
      setBudgetItems(Array.isArray(itemsData) ? itemsData : [])
      setSummary(summaryData)
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setVendors(Array.isArray(vendorsData) ? vendorsData : [])
      setTimeline(Array.isArray(timelineData) ? timelineData : [])
      
      // Debug budget items
      console.log('Budget items fetched:', itemsData?.length, 'items')
      if (itemsData && itemsData.length > 0) {
        console.log('Sample budget item:', itemsData[0])
      }
      
      // Debug vendors
      console.log('Vendors fetched:', vendorsData)
      
      // Debug: Check if timeline entries have notes
      console.log('Timeline entries received:', timelineData?.length)
      if (timelineData && timelineData.length > 0) {
        console.log('First entry notes:', timelineData[0].notes)
      }
    } catch (error) {
      console.error('Error fetching project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVendor = async (vendorId: number) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}/vendors/${vendorId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchProjectData()
        }
      } catch (error) {
        console.error('Error deleting vendor:', error)
      }
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}/budget-items/${itemId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchProjectData()
        }
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const handleDeleteTimelineEntry = async (entryId: number) => {
    if (confirm('Are you sure you want to delete this timeline entry?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}/timeline/${entryId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchProjectData()
        }
      } catch (error) {
        console.error('Error deleting timeline entry:', error)
      }
    }
  }


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-gray-400" />
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <Link href="/projects" className="text-blue-600 hover:underline">
            Back to projects
          </Link>
        </div>
      </div>
    )
  }

  const budgetUsed = summary?.summary?.total_actual || 0
  const budgetAllocated = summary?.summary?.total_estimated || 0
  const budgetPercentage = project.total_budget > 0 
    ? (budgetAllocated / project.total_budget) * 100 
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/projects" className="text-gray-600 hover:text-gray-900">
              Projects
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{project.name}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Project Header with 3D Effects */}
      <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-purple-400/5" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-indigo-400/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-start"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-gray-600 mt-3 text-lg">{project.description}</p>
              )}
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-xl border border-white/50">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(project.total_budget)}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Budget Progress Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-6 bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">Budget Allocation Progress</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {budgetPercentage.toFixed(0)}%
                </span>
                <p className="text-sm text-gray-600">{formatCurrency(budgetAllocated)} allocated</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-sm" />
              <div className="relative bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full relative overflow-hidden rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899)',
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/30" />
                </motion.div>
              </div>
            </div>
            
            {/* Budget Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <p className="text-xs text-gray-600">Remaining</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(project.total_budget - budgetAllocated)}
                </p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <p className="text-xs text-gray-600">Spent</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(budgetUsed)}
                </p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <p className="text-xs text-gray-600">Efficiency</p>
                <p className="text-lg font-bold text-green-600">
                  {budgetAllocated > 0 ? ((budgetUsed / budgetAllocated) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </motion.div>

          {/* Enhanced 3D Tabs Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative mt-8"
          >
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-2xl" />
            
            <div className="relative flex gap-3 p-2 bg-gradient-to-br from-gray-100/90 via-white/50 to-gray-100/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl">
              {[
                { id: 'overview', label: 'Overview', icon: Grid3x3, color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50' },
                { id: 'rooms', label: 'Rooms', icon: Home, color: 'from-emerald-500 to-green-500', bgColor: 'from-emerald-50 to-green-50' },
                { id: 'items', label: 'Budget & Items', icon: Package, color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50' },
                { id: 'vendors', label: 'Vendors', icon: Wrench, color: 'from-orange-500 to-red-500', bgColor: 'from-orange-50 to-red-50' },
                { id: 'renovation-plan', label: 'Renovation Plan', icon: CalendarDays, color: 'from-indigo-500 to-purple-500', bgColor: 'from-indigo-50 to-purple-50' },
                { id: 'analytics', label: 'Analytics', icon: PieChart, color: 'from-teal-500 to-cyan-500', bgColor: 'from-teal-50 to-cyan-50' }
              ].map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -4,
                    transition: { type: "spring", stiffness: 400 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group flex-1"
                  style={{ perspective: '1000px' }}
                >
                  <div className={`
                    relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300
                    ${
                      activeTab === tab.id
                        ? 'text-white shadow-2xl transform-gpu'
                        : 'text-gray-700 hover:text-gray-900'
                    }
                  `}>
                    {/* Active tab background gradient */}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl shadow-lg`}
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    {/* Hover effect background */}
                    {activeTab !== tab.id && (
                      <div className={`
                        absolute inset-0 bg-gradient-to-r ${tab.bgColor} rounded-xl 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      `} />
                    )}
                    
                    {/* Icon with rotation effect */}
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="relative z-10"
                    >
                      <tab.icon className={`
                        w-5 h-5 transition-all duration-300
                        ${activeTab === tab.id ? 'text-white drop-shadow-lg' : 'text-gray-600 group-hover:text-gray-800'}
                      `} />
                    </motion.div>
                    
                    {/* Label */}
                    <span className={`
                      relative z-10 transition-all duration-300
                      ${activeTab === tab.id ? 'text-white font-semibold' : 'group-hover:font-medium'}
                    `}>
                      {tab.label}
                    </span>
                    
                    {/* Active indicator dot */}
                    {activeTab === tab.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"
                      />
                    )}
                    
                    {/* Glow effect for active tab */}
                    {activeTab === tab.id && (
                      <div className={`
                        absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl blur-xl opacity-50 -z-10
                        animate-pulse
                      `} />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
            
            {/* Bottom reflection effect */}
            <div className="absolute -bottom-4 left-0 right-0 h-8 bg-gradient-to-b from-white/10 to-transparent rounded-full blur-xl" />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Enhanced 3D Summary Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  z: 50
                }}
                className="relative group"
                style={{ perspective: '1000px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100/50 transform-gpu">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Items</span>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{summary?.summary?.total_items || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">Total Items</p>
                  <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  z: 50
                }}
                className="relative group"
                style={{ perspective: '1000px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-emerald-100/50 transform-gpu">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl shadow-lg">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Spaces</span>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{rooms.length}</p>
                  <p className="text-sm text-gray-600 mt-2">Active Rooms</p>
                  <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  z: 50
                }}
                className="relative group"
                style={{ perspective: '1000px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-100/50 transform-gpu">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Budget</span>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{formatCurrency(budgetAllocated)}</p>
                  <p className="text-sm text-gray-600 mt-2">Estimated Total</p>
                  <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${Math.min(budgetPercentage, 100)}%` }} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  z: 50
                }}
                className="relative group"
                style={{ perspective: '1000px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-orange-100/50 transform-gpu">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Spent</span>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{formatCurrency(budgetUsed)}</p>
                  <p className="text-sm text-gray-600 mt-2">Actual Spent</p>
                  <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${budgetUsed > 0 ? (budgetUsed / budgetAllocated) * 100 : 0}%` }} />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Category Breakdown with 3D Cards - Full Width */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-blue-400 to-purple-400 rounded-2xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
              <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-100/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Budget by Category</h3>
                  <div className="flex gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg text-indigo-600"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg text-indigo-600"
                    >
                      <PieChart className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summary?.byCategory?.slice(0, 6).map((cat: any, index: number) => {
                    const Icon = iconMap[cat.icon] || Package
                    const percentage = budgetAllocated > 0 ? (cat.estimated_total / budgetAllocated) * 100 : 0
                    return (
                      <motion.div
                        key={cat.category}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="relative group/item"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-xl blur-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                        <div className="relative p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100/50 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                          <div className="flex items-center gap-3 mb-3">
                            <motion.div 
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                              className="relative"
                            >
                              <div className="absolute inset-0 blur-xl opacity-50" style={{ backgroundColor: cat.color }} />
                              <div 
                                className="relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform-gpu"
                                style={{ 
                                  background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)`,
                                  border: `2px solid ${cat.color}30`
                                }}
                              >
                                <Icon className="w-6 h-6" style={{ color: cat.color }} />
                              </div>
                            </motion.div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 truncate">{cat.category || 'Uncategorized'}</p>
                              <p className="text-xs text-gray-500">{cat.item_count} items</p>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-lg bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                                    {formatCurrency(cat.estimated_total)}
                                  </p>
                                  <p className="text-xs text-gray-500">Budgeted</p>
                                </div>
                                <span className="text-xs font-medium text-gray-500">{percentage.toFixed(1)}%</span>
                              </div>
                              <div className={`flex justify-between items-center pt-1 ${cat.actual_total !== null && cat.actual_total > 0 ? 'border-t border-gray-100' : ''}`}>
                                {cat.actual_total !== null && cat.actual_total > 0 ? (
                                  <>
                                    <div>
                                      <p className="font-semibold text-md text-green-600">
                                        {formatCurrency(cat.actual_total)}
                                      </p>
                                      <p className="text-xs text-gray-500">Actual</p>
                                    </div>
                                    <span className="text-xs font-medium text-green-600">
                                      {((cat.actual_total / cat.estimated_total) * 100).toFixed(0)}%
                                    </span>
                                  </>
                                ) : (
                                  <div className="h-8" /> 
                                )}
                              </div>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.6 + index * 0.05 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Room Summary with 3D Effects - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400 rounded-2xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
              <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-100/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">Rooms Overview</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-3">
                      <div className="text-center px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-cyan-600">{rooms.length}</p>
                        <p className="text-xs text-gray-600">Total Rooms</p>
                      </div>
                      <div className="text-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-indigo-600">{summary?.summary?.total_items || 0}</p>
                        <p className="text-xs text-gray-600">Total Items</p>
                      </div>
                    </div>
                    <motion.div 
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.5 }}
                      className="p-2 bg-gradient-to-r from-cyan-100 to-indigo-100 rounded-lg"
                    >
                      <Home className="w-5 h-5 text-cyan-600" />
                    </motion.div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {summary?.byRoom?.map((room: any, index: number) => {
                    const roomPercentage = budgetAllocated > 0 ? (room.estimated_total / budgetAllocated) * 100 : 0
                    const { icon: RoomIcon, color: roomColor } = getRoomIcon(room.room)
                    return (
                      <motion.div
                        key={room.room}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -5, rotateY: 5 }}
                        className="relative group/room"
                        style={{ perspective: '1000px' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-indigo-400/20 rounded-xl blur-xl opacity-0 group-hover/room:opacity-100 transition-opacity duration-300" />
                        <div className="relative p-5 bg-gradient-to-br from-white via-cyan-50/20 to-indigo-50/20 rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform-gpu h-full flex flex-col">
                          <div className="flex items-center gap-3 mb-3">
                            <motion.div 
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                              className="relative"
                            >
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                                style={{ 
                                  background: `linear-gradient(135deg, ${roomColor}20, ${roomColor}40)`,
                                  border: `2px solid ${roomColor}30`
                                }}
                              >
                                <RoomIcon className="w-5 h-5" style={{ color: roomColor }} />
                              </div>
                            </motion.div>
                            <p className="font-semibold text-gray-900 truncate flex-1">{room.room}</p>
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text">
                                    {formatCurrency(room.estimated_total)}
                                  </p>
                                  <p className="text-xs text-gray-500">Budgeted</p>
                                </div>
                                <span className="text-xs font-medium text-gray-500">{roomPercentage.toFixed(0)}%</span>
                              </div>
                              <div className="min-h-[32px]">
                                {room.actual_total !== null && room.actual_total > 0 ? (
                                  <div className="pt-2 border-t border-gray-100">
                                    <p className="text-md font-semibold text-green-600">
                                      {formatCurrency(room.actual_total)}
                                    </p>
                                    <p className="text-xs text-gray-500">Actual • {((room.actual_total / room.estimated_total) * 100).toFixed(0)}%</p>
                                  </div>
                                ) : (
                                  <div className="h-8" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{room.item_count} items</p>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${roomPercentage}%` }}
                                transition={{ duration: 1, delay: 0.8 + index * 0.05 }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full shadow-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <RoomsList projectId={parseInt(projectId)} rooms={rooms} onUpdate={fetchProjectData} />
        )}

        {activeTab === 'items' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Budget & Items</h2>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <BudgetItemsList
              projectId={parseInt(projectId)}
              budgetItems={budgetItems}
              onEdit={(item) => setEditingItem(item)}
              onDelete={handleDeleteItem}
              onReorder={(items) => setBudgetItems(items)}
              onViewNotes={(item) => setNotesItem(item)}
            />
          </div>
        )}

        {activeTab === 'vendors' && (
          <VendorsList projectId={parseInt(projectId)} vendors={vendors} onUpdate={fetchProjectData} />
        )}

        {activeTab === 'renovation-plan' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Renovation Plan</h3>
                <p className="text-sm text-gray-600 mt-1">Plan and track your renovation day by day</p>
              </div>
              <button
                onClick={() => setShowAddTimelineModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Day
              </button>
            </div>

            {timeline.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No renovation plan entries yet</p>
                <button
                  onClick={() => setShowAddTimelineModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Start planning your timeline
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((entry, index) => (
                  <motion.div 
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl" />
                    <div className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                      <div className="p-6">
                        <div className="flex gap-6">
                          <motion.div 
                            className="flex flex-col items-center min-w-[120px]"
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl px-5 py-4 flex flex-col items-center shadow-lg">
                              <span className="text-white font-bold text-xl">
                                {entry.end_day && entry.end_day !== entry.start_day ? (
                                  <>D{entry.start_day || entry.day_number}-{entry.end_day}</>
                                ) : (
                                  <>D{entry.start_day || entry.day_number}</>
                                )}
                              </span>
                              {entry.duration > 1 && (
                                <span className="text-sm text-blue-100 mt-1 font-medium">
                                  {entry.duration} days
                                </span>
                              )}
                            </div>
                            {(entry.start_date || entry.date) && (
                              <div className="text-xs text-gray-500 mt-2 text-center space-y-1">
                                <div className="font-medium">
                                  {new Date(entry.start_date || entry.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric'
                                  })}
                                </div>
                                {entry.end_date && entry.end_date !== entry.start_date && (
                                  <>
                                    <div className="text-gray-400">to</div>
                                    <div className="font-medium">
                                      {new Date(entry.end_date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric'
                                      })}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </motion.div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 text-lg">{entry.title}</h4>
                              <motion.span 
                                whileHover={{ scale: 1.1 }}
                                className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  entry.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-md' :
                                  entry.status === 'in_progress' ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-md' :
                                  entry.status === 'delayed' ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-md' :
                                  'bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-md'
                                }`}>
                                {entry.status?.replace('_', ' ')}
                              </motion.span>
                            </div>
                            {entry.description && (
                              <p className="text-gray-600">{entry.description}</p>
                            )}
                            
                            {/* Show action plan if available */}
                            {entry.action_plan && (
                              <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                                  📋 Action Plan
                                </p>
                                <p className="text-xs text-gray-700 whitespace-pre-line line-clamp-4">
                                  {entry.action_plan}
                                </p>
                                <button
                                  onClick={() => {
                                    setSelectedEntryForActionPlan(entry)
                                    setShowActionPlanModal(true)
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                                >
                                  View/Edit Full Plan →
                                </button>
                              </div>
                            )}
                            
                            {/* Budget Summary */}
                            {(entry.planned_cost > 0 || entry.actual_cost > 0) && (
                              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-700">Budget</span>
                                  <button
                                    onClick={async () => {
                                      // Fetch existing linked items first
                                      try {
                                        const response = await fetch(`/api/projects/${projectId}/timeline/${entry.id}/budget-items`)
                                        const linkedItems = await response.json()
                                        setSelectedTimelineForBudget({ ...entry, budgetItems: linkedItems })
                                      } catch (error) {
                                        console.error('Error fetching linked items:', error)
                                        setSelectedTimelineForBudget({ ...entry, budgetItems: [] })
                                      }
                                      setShowLinkBudgetModal(true)
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                  >
                                    Manage Items
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Planned:</span>
                                    <span className="ml-2 font-medium text-gray-900">${entry.planned_cost?.toLocaleString() || 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Actual:</span>
                                    <span className="ml-2 font-medium text-gray-900">${entry.actual_cost?.toLocaleString() || 0}</span>
                                  </div>
                                </div>
                                
                                {entry.budgetItems && entry.budgetItems.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-xs text-gray-600 mb-1">{entry.budgetItems.length} item(s) linked</div>
                                    <div className="space-y-1">
                                      {entry.budgetItems.slice(0, 3).map((item: any) => (
                                        <div key={item.id} className="text-xs text-gray-700">
                                          • {item.item_name} (${item.allocated_amount.toLocaleString()})
                                        </div>
                                      ))}
                                      {entry.budgetItems.length > 3 && (
                                        <div className="text-xs text-gray-500">+{entry.budgetItems.length - 3} more...</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Add budget link button if no budget */}
                            {!entry.planned_cost && !entry.actual_cost && (
                              <button
                                onClick={async () => {
                                  // Fetch existing linked items first
                                  try {
                                    const response = await fetch(`/api/projects/${projectId}/timeline/${entry.id}/budget-items`)
                                    const linkedItems = await response.json()
                                    setSelectedTimelineForBudget({ ...entry, budgetItems: linkedItems })
                                  } catch (error) {
                                    console.error('Error fetching linked items:', error)
                                    setSelectedTimelineForBudget({ ...entry, budgetItems: [] })
                                  }
                                  setShowLinkBudgetModal(true)
                                }}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                              >
                                + Link Budget Items
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedEntryForActionPlan(entry)
                              setShowActionPlanModal(true)
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Action Plan
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              if (selectedTimelineEntry?.id === entry.id) {
                                setSelectedTimelineEntry(null)
                              } else {
                                // Fetch notes for this entry
                                try {
                                  const notesRes = await fetch(`/api/projects/${projectId}/timeline/${entry.id}/notes`)
                                  const notes = await notesRes.json()
                                  setSelectedTimelineEntry({ ...entry, notes })
                                } catch (error) {
                                  console.error('Error fetching notes:', error)
                                  setSelectedTimelineEntry({ ...entry, notes: [] })
                                }
                              }
                            }}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              selectedTimelineEntry?.id === entry.id 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <StickyNote className="h-3.5 w-3.5" />
                            {entry.notes_count > 0 ? `${entry.notes_count} Notes` : 'Notes'}
                          </motion.button>
                          <button 
                            onClick={() => {
                              setEditingTimelineEntry(entry)
                              setShowEditTimelineModal(true)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTimelineEntry(entry.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Notes Section */}
                      {selectedTimelineEntry?.id === entry.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <StickyNote className="w-5 h-5 text-yellow-500" />
                              Notes
                            </h5>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedTimelineEntry(null)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-5 h-5" />
                            </motion.button>
                          </div>

                          {/* Existing Notes */}
                          {entry.notes && entry.notes.length > 0 && (
                            <div className="space-y-3 mb-4">
                              {entry.notes.map((note: any, index: number) => (
                                <motion.div
                                  key={note.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <p className="text-gray-700 leading-relaxed">{note.content}</p>
                                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" />
                                      <span>{note.author || 'Anonymous'}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{new Date(note.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}

                          {/* Add New Note */}
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <AddTimelineNote 
                              entryId={entry.id} 
                              onSuccess={async () => {
                                // Refresh notes after adding
                                try {
                                  const notesRes = await fetch(`/api/projects/${projectId}/timeline/${entry.id}/notes`)
                                  const notes = await notesRes.json()
                                  setSelectedTimelineEntry({ ...entry, notes })
                                  fetchProjectData()
                                } catch (error) {
                                  console.error('Error refreshing notes:', error)
                                }
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Distribution</h3>
              <div className="space-y-4">
                {summary?.byCategory?.map((cat: any) => {
                  const percentage = project.total_budget > 0 
                    ? (cat.estimated_total / project.total_budget) * 100 
                    : 0
                  return (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{cat.category || 'Uncategorized'}</span>
                        <span className="font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: cat.color || '#6B7280'
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Comparison</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(project.total_budget)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(budgetAllocated)}</p>
                  </div>
                  <Calculator className="w-8 h-8 text-purple-500" />
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Remaining Budget</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(project.total_budget - budgetAllocated)}
                    </p>
                  </div>
                  <PieChart className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <AddRoomModal
          projectId={parseInt(projectId)}
          onClose={() => setShowAddRoomModal(false)}
          onSuccess={() => {
            setShowAddRoomModal(false)
            fetchProjectData()
          }}
        />
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <AddItemModal
          projectId={parseInt(projectId)}
          rooms={rooms}
          categories={categories}
          vendors={vendors}
          onClose={() => setShowAddItemModal(false)}
          onSuccess={() => {
            setShowAddItemModal(false)
            fetchProjectData()
          }}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <EditItemModal
          projectId={parseInt(projectId)}
          item={editingItem}
          rooms={rooms}
          categories={categories}
          vendors={vendors}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null)
            fetchProjectData()
          }}
        />
      )}

      {notesItem && (
        <BudgetItemNotesModal
          projectId={parseInt(projectId)}
          item={notesItem}
          onClose={() => setNotesItem(null)}
          onSave={(updatedItem) => {
            fetchBudgetItems()
          }}
        />
      )}

      {(showAddVendorModal || editingVendor) && (
        <AddVendorModal
          projectId={parseInt(projectId)}
          vendor={editingVendor}
          onClose={() => {
            setShowAddVendorModal(false)
            setEditingVendor(null)
          }}
          onSuccess={() => {
            setShowAddVendorModal(false)
            setEditingVendor(null)
            fetchProjectData()
          }}
        />
      )}

      {showAddTimelineModal && (
        <AddTimelineModal
          projectId={parseInt(projectId)}
          onClose={() => setShowAddTimelineModal(false)}
          onSuccess={() => {
            setShowAddTimelineModal(false)
            fetchProjectData()
          }}
        />
      )}

      {showLinkBudgetModal && selectedTimelineForBudget && (
        <LinkBudgetModal
          projectId={parseInt(projectId)}
          timelineEntryId={selectedTimelineForBudget.id}
          existingItems={selectedTimelineForBudget.budgetItems || []}
          onClose={() => {
            setShowLinkBudgetModal(false)
            setSelectedTimelineForBudget(null)
          }}
          onSuccess={() => {
            setShowLinkBudgetModal(false)
            setSelectedTimelineForBudget(null)
            fetchProjectData()
          }}
        />
      )}

      {showEditTimelineModal && editingTimelineEntry && (
        <EditTimelineModal
          projectId={parseInt(projectId)}
          entry={editingTimelineEntry}
          onClose={() => {
            setShowEditTimelineModal(false)
            setEditingTimelineEntry(null)
          }}
          onSuccess={() => {
            setShowEditTimelineModal(false)
            setEditingTimelineEntry(null)
            fetchProjectData()
          }}
        />
      )}

      {showActionPlanModal && selectedEntryForActionPlan && (
        <ActionPlanModal
          projectId={parseInt(projectId)}
          entry={selectedEntryForActionPlan}
          onClose={() => {
            setShowActionPlanModal(false)
            setSelectedEntryForActionPlan(null)
          }}
          onSuccess={() => {
            setShowActionPlanModal(false)
            setSelectedEntryForActionPlan(null)
            fetchProjectData()
          }}
        />
      )}
    </div>
  )
}

function AddRoomModal({ projectId, onClose, onSuccess }: any) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    allocated_budget: ''
  })

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/projects/${projectId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          allocated_budget: parseFloat(formData.allocated_budget) || 0
        })
      })
      
      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-md w-full p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Room/Area</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Kitchen, Master Bathroom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allocated Budget
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.allocated_budget}
              onChange={(e) => setFormData({ ...formData, allocated_budget: e.target.value })}
              placeholder="10000"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Room
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}