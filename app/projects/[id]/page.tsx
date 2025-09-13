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
  CalendarDays, StickyNote, ChevronRight, ChevronDown, CircleCheck, X,
  Bed, Bath, ChefHat, Tv, TreePine, Wind, Warehouse, FootprintsIcon, Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '@/components/Navigation'
import AddVendorModal from './AddVendorModal'
import AddTimelineModal from './AddTimelineModal'
import AddTimelineNote from './AddTimelineNote'
import EditTimelineModal from './EditTimelineModal'
import EditItemModal from './EditItemModal'
import RoomsList from './RoomsList'
import BudgetMasterDetailRowEditable from '@/components/budget/BudgetMasterDetailRowEditable'
import BudgetInlineAdd from '@/components/budget/BudgetInlineAdd'
import VendorsList from './VendorsList'
import ActionPlanModal from './ActionPlanModal'
import BudgetItemNotesModal from './BudgetItemNotesModal'
import AddDetailModal from './AddDetailModal'
import EditDetailModal from './EditDetailModal'
import AddActualModal from './AddActualModal'
import EditActualModal from './EditActualModal'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'

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

interface BudgetMaster {
  id: number
  name: string
  description: string
  status: string
  room_id: number
  room_name: string
  total_estimated: number
  total_actual: number
  details?: BudgetDetail[]
}

interface BudgetDetail {
  id: number
  master_id: number
  type: string
  name: string
  description: string
  quantity: number
  unit_price: number
  estimated_cost: number
  actual_cost: number
  vendor: string
  status: string
  category_name: string
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
  if (!roomName) return { icon: DoorOpen, color: '#EC4899' } // Default if no name
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
  const [budgetMasters, setBudgetMasters] = useState<BudgetMaster[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [timeline, setTimeline] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddRoomModal, setShowAddRoomModal] = useState(false)
  const [editingMaster, setEditingMaster] = useState<BudgetMaster | null>(null)
  const [notesMaster, setNotesMaster] = useState<BudgetMaster | null>(null)
  const [showAddVendorModal, setShowAddVendorModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [showAddTimelineModal, setShowAddTimelineModal] = useState(false)
  const [selectedTimelineEntry, setSelectedTimelineEntry] = useState<any>(null)
  const [showEditTimelineModal, setShowEditTimelineModal] = useState(false)
  const [editingTimelineEntry, setEditingTimelineEntry] = useState<any>(null)
  const [showActionPlanModal, setShowActionPlanModal] = useState(false)
  const [selectedEntryForActionPlan, setSelectedEntryForActionPlan] = useState<any>(null)
  const [showAddDetailModal, setShowAddDetailModal] = useState(false)
  const [showEditDetailModal, setShowEditDetailModal] = useState(false)
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null)
  const [selectedMasterName, setSelectedMasterName] = useState<string>('')
  const [selectedDetail, setSelectedDetail] = useState<any>(null)
  const [showAddActualModal, setShowAddActualModal] = useState(false)
  const [showEditActualModal, setShowEditActualModal] = useState(false)
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null)
  const [selectedDetailName, setSelectedDetailName] = useState<string>('')
  const [expandedDetailsAfterActual, setExpandedDetailsAfterActual] = useState<Set<number>>(new Set())
  const [selectedActual, setSelectedActual] = useState<any>(null)
  const [defaultTab, setDefaultTab] = useState<string>('overview')
  const [savingDefaultTab, setSavingDefaultTab] = useState(false)
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<number | null>(null)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null)
  const [expandAll, setExpandAll] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    type: 'vendor' | 'master' | 'detail' | 'actual' | null
    id: number | null
    name: string
    onConfirm: () => void
  }>({ isOpen: false, type: null, id: null, name: '', onConfirm: () => {} })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProjectData()
    fetchDefaultTab()
  }, [projectId])

  const fetchDefaultTab = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/settings?key=defaultTab`)
      if (response.ok) {
        const data = await response.json()
        if (data.value) {
          setDefaultTab(data.value)
          setActiveTab(data.value)
        }
      }
    } catch (error) {
      console.error('Error fetching default tab:', error)
    }
  }

  const handleDefaultTabChange = async (newTab: string) => {
    setSavingDefaultTab(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settingKey: 'defaultTab',
          settingValue: newTab
        })
      })

      if (response.ok) {
        setDefaultTab(newTab)
      }
    } catch (error) {
      console.error('Error saving default tab:', error)
    } finally {
      setSavingDefaultTab(false)
    }
  }

  const fetchProjectData = async () => {
    try {
      const [projectRes, roomsRes, mastersRes, summaryRes, categoriesRes, vendorsRes, timelineRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/rooms`),
        fetch(`/api/projects/${projectId}/budget-items`),
        fetch(`/api/projects/${projectId}/summary`),
        fetch('/api/categories'),
        fetch(`/api/projects/${projectId}/vendors`),
        fetch(`/api/projects/${projectId}/timeline`)
      ])

      // Check if responses are ok before parsing JSON
      const responses = [projectRes, roomsRes, mastersRes, summaryRes, categoriesRes, vendorsRes, timelineRes]
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

      const [projectData, roomsData, mastersData, summaryData, categoriesData, vendorsData, timelineData] = results

      setProject(projectData)
      setRooms(Array.isArray(roomsData) ? roomsData : [])
      setBudgetMasters(Array.isArray(mastersData) ? mastersData : [])
      setSummary(summaryData)
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setVendors(Array.isArray(vendorsData) ? vendorsData : [])
      setTimeline(Array.isArray(timelineData) ? timelineData : [])
      
      // Debug budget masters
      console.log('Budget masters fetched:', mastersData?.length, 'masters')
      if (mastersData && mastersData.length > 0) {
        console.log('Sample budget master:', mastersData[0])
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

  const handleDeleteVendor = async (vendorId: number, vendorName?: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'vendor',
      id: vendorId,
      name: vendorName || 'this vendor',
      onConfirm: async () => {
        setIsDeleting(true)
        try {
          const response = await fetch(`/api/projects/${projectId}/vendors/${vendorId}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            fetchProjectData()
            setDeleteModal({ isOpen: false, type: null, id: null, name: '', onConfirm: () => {} })
          }
        } catch (error) {
          console.error('Error deleting vendor:', error)
        } finally {
          setIsDeleting(false)
        }
      }
    })
  }

  const handleDeleteMaster = async (masterId: number, masterName?: string) => {
    const master = budgetMasters.find(m => m.id === masterId)
    setDeleteModal({
      isOpen: true,
      type: 'master',
      id: masterId,
      name: masterName || master?.name || 'this budget item',
      onConfirm: async () => {
        setIsDeleting(true)
        try {
          const response = await fetch(`/api/projects/${projectId}/budget-masters/${masterId}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            fetchProjectData()
            setDeleteModal({ isOpen: false, type: null, id: null, name: '', onConfirm: () => {} })
          }
        } catch (error) {
          console.error('Error deleting master:', error)
        } finally {
          setIsDeleting(false)
        }
      }
    })
  }

  const handleDeleteDetail = async (detailId: number, detailName?: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'detail',
      id: detailId,
      name: detailName || 'this detail item',
      onConfirm: async () => {
        setIsDeleting(true)
        try {
          const response = await fetch(`/api/budget-details/${detailId}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            fetchProjectData()
            setDeleteModal({ isOpen: false, type: null, id: null, name: '', onConfirm: () => {} })
          }
        } catch (error) {
          console.error('Error deleting detail:', error)
        } finally {
          setIsDeleting(false)
        }
      }
    })
  }

  const handleDeleteActual = async (actualId: number, actualName?: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'actual',
      id: actualId,
      name: actualName || 'this actual expense',
      onConfirm: async () => {
        setIsDeleting(true)
        try {
          const response = await fetch(`/api/budget-actuals/${actualId}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            fetchProjectData()
            setDeleteModal({ isOpen: false, type: null, id: null, name: '', onConfirm: () => {} })
          }
        } catch (error) {
          console.error('Error deleting actual:', error)
        } finally {
          setIsDeleting(false)
        }
      }
    })
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
      
      {/* Beautiful Compact Header Bar with 3D Effects */}
      <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 shadow-xl sticky top-0 z-40 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-purple-400/5" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-indigo-400/10 rounded-full blur-3xl" />
        
        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left: Project Info */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link href="/projects" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  {project.name}
                </h1>
                <p className="text-sm text-gray-600">{project.description}</p>
              </div>
            </motion.div>

            {/* Center: Budget Info - Evenly Distributed */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 flex items-center justify-evenly gap-4"
            >
              {/* Total Budget */}
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Budget</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatCurrency(project.total_budget)}
                  </p>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-px bg-gray-200" />

              {/* Planned */}
              <div>
                <p className="text-xs text-gray-500">Planned</p>
                <p className="text-lg font-bold text-indigo-600">
                  {formatCurrency(budgetAllocated)}
                </p>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-px bg-gray-200" />

              {/* Spent */}
              <div>
                <p className="text-xs text-gray-500">Spent</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(budgetUsed)}
                </p>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-px bg-gray-200" />

              {/* Remaining */}
              <div>
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(project.total_budget - budgetAllocated)}
                </p>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-px bg-gray-200" />
              
              {/* Progress */}
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-gray-500">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-sm" />
                      <div className="relative w-24 bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
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
                        </motion.div>
                      </div>
                    </div>
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {budgetPercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-px bg-gray-200" />

              {/* Efficiency */}
              <div>
                <p className="text-xs text-gray-500">Efficiency</p>
                <p className="text-lg font-bold text-green-600">
                  {budgetAllocated > 0 ? ((budgetUsed / budgetAllocated) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </motion.div>
          </div>

          {/* Enhanced 3D Tabs Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="flex gap-2 p-2 bg-gradient-to-br from-gray-100/90 via-white/50 to-gray-100/90 backdrop-blur-xl rounded-t-xl border border-white/50">
              {[
                { id: 'overview', label: 'Overview', icon: Grid3x3, color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50' },
                { id: 'rooms', label: 'Rooms', icon: Home, color: 'from-emerald-500 to-green-500', bgColor: 'from-emerald-50 to-green-50' },
                { id: 'items', label: 'Budget', icon: Package, color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50' },
                { id: 'vendors', label: 'Vendors', icon: Wrench, color: 'from-orange-500 to-red-500', bgColor: 'from-orange-50 to-red-50' },
                { id: 'renovation-plan', label: 'Renovation Plan', icon: CalendarDays, color: 'from-indigo-500 to-purple-500', bgColor: 'from-indigo-50 to-purple-50' },
                { id: 'analytics', label: 'Analytics', icon: PieChart, color: 'from-teal-500 to-cyan-500', bgColor: 'from-teal-50 to-cyan-50' }
              ].map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -2,
                    transition: { type: "spring", stiffness: 400 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group flex-1"
                >
                  <div className={`
                    relative flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300
                    ${
                      activeTab === tab.id
                        ? 'text-white shadow-lg'
                        : 'text-gray-700 hover:text-gray-900'
                    }
                  `}>
                    {/* Active tab background gradient - unique per tab */}
                    {activeTab === tab.id && (
                      <motion.div
                        className={`absolute inset-0 rounded-lg shadow-lg`}
                        style={{
                          background: tab.id === 'overview' ? 'linear-gradient(to right, #3B82F6, #06B6D4)' :
                                     tab.id === 'rooms' ? 'linear-gradient(to right, #10B981, #22C55E)' :
                                     tab.id === 'items' ? 'linear-gradient(to right, #A855F7, #EC4899)' :
                                     tab.id === 'vendors' ? 'linear-gradient(to right, #F97316, #EF4444)' :
                                     tab.id === 'renovation-plan' ? 'linear-gradient(to right, #6366F1, #A855F7)' :
                                     'linear-gradient(to right, #14B8A6, #06B6D4)'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    
                    {/* Hover effect background */}
                    {activeTab !== tab.id && (
                      <div className={`
                        absolute inset-0 rounded-lg 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      `}
                      style={{
                        background: tab.id === 'overview' ? 'linear-gradient(to right, #DBEAFE, #E0F2FE)' :
                                   tab.id === 'rooms' ? 'linear-gradient(to right, #D1FAE5, #DCFCE7)' :
                                   tab.id === 'items' ? 'linear-gradient(to right, #F3E8FF, #FCE7F3)' :
                                   tab.id === 'vendors' ? 'linear-gradient(to right, #FED7AA, #FEE2E2)' :
                                   tab.id === 'renovation-plan' ? 'linear-gradient(to right, #E0E7FF, #F3E8FF)' :
                                   'linear-gradient(to right, #CCFBF1, #E0F2FE)'
                      }} />
                    )}
                    
                    {/* Icon with rotation effect */}
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="relative z-10"
                    >
                      <tab.icon className={`
                        w-4 h-4 transition-all duration-300
                        ${activeTab === tab.id ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'}
                      `} />
                    </motion.div>
                    
                    {/* Label */}
                    <span className={`
                      relative z-10 text-sm transition-all duration-300
                      ${activeTab === tab.id ? 'text-white font-semibold' : 'group-hover:font-medium'}
                    `}>
                      {tab.label}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Compact Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900">{summary?.summary?.total_items || 0}</p>
                    <p className="text-xs text-gray-500">Total Items</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Home className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
                    <p className="text-xs text-gray-500">Active Rooms</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Calculator className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(budgetAllocated)}</p>
                    <p className="text-xs text-gray-500">Estimated</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(budgetUsed)}</p>
                    <p className="text-xs text-gray-500">Actual Spent</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Compact Category Breakdown */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Budget by Category</h3>
                <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                    <PieChart className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {summary?.byCategory?.slice(0, 10).map((cat: any, index: number) => {
                  const Icon = iconMap[cat.icon] || Package
                  const percentage = budgetAllocated > 0 ? (cat.estimated_total / budgetAllocated) * 100 : 0
                  return (
                    <motion.div
                      key={cat.category || `category-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.02 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{cat.category || 'Uncategorized'}</p>
                          <p className="text-xs text-gray-500">{cat.item_count} items</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(cat.estimated_total)}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{percentage.toFixed(0)}%</span>
                          {cat.actual_total > 0 && (
                            <span className="text-xs text-green-600 font-medium">
                              {formatCurrency(cat.actual_total)}
                            </span>
                          )}
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: cat.color + '80'
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Compact Rooms Overview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Rooms Overview</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">
                    <span className="font-semibold text-gray-700">{rooms.length}</span> rooms
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">
                    <span className="font-semibold text-gray-700">{summary?.summary?.total_items || 0}</span> items
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {summary?.byRoom?.slice(0, 10).map((room: any, index: number) => {
                  const roomPercentage = budgetAllocated > 0 ? (room.estimated_total / budgetAllocated) * 100 : 0
                  const { icon: RoomIcon, color: roomColor } = getRoomIcon(room?.room || room?.room_name || 'Unknown')
                  return (
                    <motion.div
                      key={room?.room || room?.room_name || `room-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.02 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-7 h-7 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: `${roomColor}15` }}
                        >
                          <RoomIcon className="w-4 h-4" style={{ color: roomColor }} />
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate flex-1">{room.room}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(room.estimated_total)}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{room.item_count} items</span>
                          {room.actual_total > 0 && (
                            <span className="text-xs text-green-600 font-medium">
                              {((room.actual_total / room.estimated_total) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${roomPercentage}%`,
                              backgroundColor: roomColor + '80'
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Default Tab Setting */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">Default Tab Settings</h3>
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                >
                  <Settings className="w-4 h-4 text-purple-600" />
                </motion.div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Choose which tab to display by default when opening this project:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { value: 'overview', label: 'Overview', icon: Grid3x3, color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50' },
                  { value: 'rooms', label: 'Rooms', icon: Home, color: 'from-emerald-500 to-green-500', bgColor: 'from-emerald-50 to-green-50' },
                  { value: 'items', label: 'Budget', icon: Package, color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50' },
                  { value: 'vendors', label: 'Vendors', icon: Building2, color: 'from-orange-500 to-red-500', bgColor: 'from-orange-50 to-red-50' },
                  { value: 'renovation-plan', label: 'Renovation Plan', icon: Calendar, color: 'from-indigo-500 to-purple-500', bgColor: 'from-indigo-50 to-purple-50' },
                  { value: 'analytics', label: 'Analytics', icon: PieChart, color: 'from-teal-500 to-cyan-500', bgColor: 'from-teal-50 to-cyan-50' }
                ].map((tab) => {
                  const Icon = tab.icon
                  const isSelected = defaultTab === tab.value
                  return (
                    <motion.button
                      key={tab.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDefaultTabChange(tab.value)}
                      disabled={savingDefaultTab}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-300
                        ${isSelected 
                          ? `bg-gradient-to-br ${tab.bgColor} border-purple-300 shadow-lg` 
                          : 'bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                        }
                        ${savingDefaultTab ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${tab.color} rounded-full flex items-center justify-center shadow-md`}
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-500'}`} />
                      <p className={`text-xs font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
                        {tab.label}
                      </p>
                    </motion.button>
                  )
                })}
              </div>
              {savingDefaultTab && (
                <div className="flex items-center justify-center py-3 mt-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"
                  />
                  <span className="ml-2 text-sm text-purple-600">Saving preference...</span>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <RoomsList projectId={parseInt(projectId)} rooms={rooms} onUpdate={fetchProjectData} />
        )}

        {activeTab === 'items' && (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Budget</h2>
                <button
                  onClick={() => setExpandAll(!expandAll)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    expandAll 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {expandAll ? (
                    <><ChevronDown className="w-4 h-4 inline mr-1" /> Collapse All</>
                  ) : (
                    <><ChevronRight className="w-4 h-4 inline mr-1" /> Expand All</>
                  )}
                </button>
              </div>

              {/* Filter Section */}
              <div className="mb-4 space-y-3">
                {/* Room Filters */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Room:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedRoomFilter(null)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedRoomFilter === null
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Rooms
                    </button>
                    {rooms.map(room => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoomFilter(room.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedRoomFilter === room.id
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5 inline mr-1" />
                        {room.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filters */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Category:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategoryFilter(null)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedCategoryFilter === null
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map(category => {
                      const Icon = iconMap[category.icon] || Package
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategoryFilter(category.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            selectedCategoryFilter === category.id
                              ? 'text-white shadow-md'
                              : 'text-gray-700 hover:opacity-80'
                          }`}
                          style={{
                            backgroundColor: selectedCategoryFilter === category.id 
                              ? category.color 
                              : `${category.color}20`,
                            color: selectedCategoryFilter === category.id 
                              ? 'white' 
                              : category.color
                          }}
                        >
                          <Icon className="w-3.5 h-3.5 inline mr-1" />
                          {category.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              {/* Inline Add Component */}
              <BudgetInlineAdd
                projectId={parseInt(projectId)}
                rooms={rooms}
                categories={categories}
                onSuccess={fetchProjectData}
              />
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {budgetMasters.length > 0 ? (
                  (() => {
                    const filtered = budgetMasters.filter(master => {
                      // Apply room filter
                      if (selectedRoomFilter !== null && master.room_id !== selectedRoomFilter) {
                        return false
                      }
                      // Apply category filter
                      if (selectedCategoryFilter !== null && master.category_id !== selectedCategoryFilter) {
                        return false
                      }
                      return true
                    })
                    
                    if (filtered.length === 0) {
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-16 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-dashed border-orange-200"
                        >
                          <Package className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-600 mb-2">No items match your filters</h3>
                          <p className="text-gray-500">Try adjusting your room or category filters</p>
                          <button
                            onClick={() => {
                              setSelectedRoomFilter(null)
                              setSelectedCategoryFilter(null)
                            }}
                            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Clear Filters
                          </button>
                        </motion.div>
                      )
                    }
                    
                    return filtered.map((master, index) => (
                    <BudgetMasterDetailRowEditable
                      key={master.id}
                      projectId={parseInt(projectId)}
                      item={master}
                      rooms={rooms}
                      categories={categories}
                      onAddDetail={(masterId) => {
                        setSelectedMasterId(masterId)
                        setSelectedMasterName(master.name)
                        setShowAddDetailModal(true)
                      }}
                      onEditMaster={setEditingMaster}
                      onDeleteMaster={handleDeleteMaster}
                      onEditDetail={(detail) => {
                        setSelectedDetail(detail)
                        setSelectedMasterName(master.name)
                        setShowEditDetailModal(true)
                      }}
                      onDeleteDetail={handleDeleteDetail}
                      onAddActual={(detailId, detailName) => {
                        setSelectedDetailId(detailId)
                        setSelectedDetailName(detailName)
                        setShowAddActualModal(true)
                      }}
                      expandedDetailsAfterActual={expandedDetailsAfterActual}
                      forceExpandAll={expandAll}
                      onEditActual={(actual, detailName) => {
                        setSelectedActual(actual)
                        setSelectedDetailName(detailName)
                        setShowEditActualModal(true)
                      }}
                      onDeleteActual={handleDeleteActual}
                      onOpenNotesModal={setNotesMaster}
                      onRefresh={fetchProjectData}
                    />
                  ))
                  })()
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300"
                  >
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Budget Items Yet</h3>
                    <p className="text-gray-500">Start by adding your first budget item using the form above</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-700">Budget</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Planned:</span>
                                    <span className="ml-2 font-medium text-gray-900">R{entry.planned_cost?.toLocaleString() || 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Actual:</span>
                                    <span className="ml-2 font-medium text-gray-900">R{entry.actual_cost?.toLocaleString() || 0}</span>
                                  </div>
                                </div>
                              </div>
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


      {/* Edit Master Modal */}
      {editingMaster && (
        <EditItemModal
          projectId={parseInt(projectId)}
          item={editingMaster}
          rooms={rooms}
          categories={categories}
          vendors={vendors}
          onClose={() => setEditingMaster(null)}
          onSuccess={() => {
            setEditingMaster(null)
            fetchProjectData()
          }}
        />
      )}

      {notesMaster && (
        <BudgetItemNotesModal
          projectId={parseInt(projectId)}
          item={notesMaster}
          onClose={() => setNotesMaster(null)}
          onSave={(updatedItem) => {
            fetchProjectData()
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

      {selectedMasterId && (
        <AddDetailModal
          isOpen={showAddDetailModal}
          masterId={selectedMasterId}
          masterName={selectedMasterName}
          onClose={() => {
            setShowAddDetailModal(false)
            setSelectedMasterId(null)
            setSelectedMasterName('')
          }}
          onSuccess={() => {
            setShowAddDetailModal(false)
            setSelectedMasterId(null)
            setSelectedMasterName('')
            fetchProjectData()
          }}
        />
      )}

      <EditDetailModal
        isOpen={showEditDetailModal}
        detail={selectedDetail}
        masterName={selectedMasterName}
        onClose={() => {
          setShowEditDetailModal(false)
          setSelectedDetail(null)
          setSelectedMasterName('')
        }}
        onSuccess={() => {
          setShowEditDetailModal(false)
          setSelectedDetail(null)
          setSelectedMasterName('')
          fetchProjectData()
        }}
      />

      {showAddActualModal && selectedDetailId && (
        <AddActualModal
          isOpen={showAddActualModal}
          detailId={selectedDetailId}
          detailName={selectedDetailName}
          onClose={() => {
            setShowAddActualModal(false)
            setSelectedDetailId(null)
            setSelectedDetailName('')
          }}
          onSuccess={() => {
            setShowAddActualModal(false)
            // Auto-expand the detail to show the new actual
            if (selectedDetailId) {
              setExpandedDetailsAfterActual(prev => new Set(prev).add(selectedDetailId))
            }
            setSelectedDetailId(null)
            setSelectedDetailName('')
            fetchProjectData().then(() => {
              // Clear the expanded details set after refresh
              setTimeout(() => setExpandedDetailsAfterActual(new Set()), 100)
            })
          }}
        />
      )}

      {showEditActualModal && selectedActual && (
        <EditActualModal
          isOpen={showEditActualModal}
          actual={selectedActual}
          detailName={selectedDetailName}
          onClose={() => {
            setShowEditActualModal(false)
            setSelectedActual(null)
            setSelectedDetailName('')
          }}
          onSuccess={() => {
            setShowEditActualModal(false)
            // Keep the detail expanded after editing actual
            if (selectedActual?.detail_id) {
              setExpandedDetailsAfterActual(prev => new Set(prev).add(selectedActual.detail_id))
            }
            setSelectedActual(null)
            setSelectedDetailName('')
            fetchProjectData().then(() => {
              // Clear the expanded details set after refresh
              setTimeout(() => setExpandedDetailsAfterActual(new Set()), 100)
            })
          }}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={
          deleteModal.type === 'vendor' ? 'Delete Vendor' :
          deleteModal.type === 'master' ? 'Delete Budget Item' :
          deleteModal.type === 'detail' ? 'Delete Detail Item' :
          'Delete Actual Expense'
        }
        message={
          deleteModal.type === 'vendor' ? 'This will remove the vendor from your project.' :
          deleteModal.type === 'master' ? 'This will delete the budget item and all its details.' :
          deleteModal.type === 'detail' ? 'This will remove this detail from the budget item.' :
          'This will remove this actual expense record.'
        }
        itemName={deleteModal.name}
        onConfirm={deleteModal.onConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, type: null, id: null, name: '', onConfirm: () => {} })}
        isDeleting={isDeleting}
      />
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