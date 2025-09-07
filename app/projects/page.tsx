'use client'

import { useCurrency } from '@/contexts/CurrencyContext'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Home, Calendar, DollarSign, Edit, Trash2, Eye, Hammer, TrendingUp, AlertCircle, Pencil, ArrowRight, Clock, CheckCircle, XCircle, Building2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import EditProjectModal from './EditProjectModal'

interface Project {
  id: number
  name: string
  description: string
  total_budget: number
  start_date: string
  target_end_date: string
  status: string
  created_at: string
  updated_at: string
}

export default function ProjectsPage() {
  const { formatCurrency, getCurrencyCode } = useCurrency()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Failed to fetch projects:', data.error)
        setProjects([])
      } else {
        setProjects(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'planning': 
        return { 
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'from-blue-50 to-cyan-50', 
          textColor: 'text-blue-700',
          icon: Clock,
          label: 'Planning'
        }
      case 'in_progress': 
        return { 
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'from-yellow-50 to-orange-50',
          textColor: 'text-yellow-700',
          icon: TrendingUp,
          label: 'In Progress'
        }
      case 'completed': 
        return { 
          color: 'from-green-500 to-emerald-500',
          bgColor: 'from-green-50 to-emerald-50',
          textColor: 'text-green-700',
          icon: CheckCircle,
          label: 'Completed'
        }
      case 'on_hold': 
        return { 
          color: 'from-gray-500 to-slate-500',
          bgColor: 'from-gray-50 to-slate-50',
          textColor: 'text-gray-700',
          icon: XCircle,
          label: 'On Hold'
        }
      default: 
        return { 
          color: 'from-gray-500 to-slate-500',
          bgColor: 'from-gray-50 to-slate-50',
          textColor: 'text-gray-700',
          icon: AlertCircle,
          label: status
        }
    }
  }


  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
      <Navigation />

      {/* Enhanced 3D Header */}
      <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-purple-400/5" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-indigo-400/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  My Renovation Projects
                </h1>
              </div>
              <p className="text-gray-600 text-lg ml-16">Manage all your renovation projects in one place</p>
            </div>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg">
                <Sparkles className="w-5 h-5" />
                New Project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 mt-6"
          >
            <div className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50">
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-blue-600">
                {projects.filter(p => p.status === 'in_progress').length}
              </p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No projects yet</h2>
            <p className="text-gray-600 mb-8">Start planning your first renovation project</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Project
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const statusConfig = getStatusConfig(project.status)
              const StatusIcon = statusConfig.icon
              const budgetPercentage = project.total_budget > 0 ? 70 : 0 // Mock percentage for demo
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30, rotateY: -10 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -10,
                    scale: 1.02,
                    rotateY: 5,
                    transition: { duration: 0.3 }
                  }}
                  className="relative group"
                  style={{ perspective: '1000px' }}
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig.color} rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                  
                  {/* Card */}
                  <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100/50 overflow-hidden transform-gpu">
                    {/* Status ribbon */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusConfig.color}`} />
                    
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-1">
                            {project.name}
                          </h3>
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center gap-1.5"
                          >
                            <div className={`p-1.5 bg-gradient-to-r ${statusConfig.bgColor} rounded-lg`}>
                              <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.textColor}`} />
                            </div>
                            <span className={`text-xs font-semibold ${statusConfig.textColor}`}>
                              {statusConfig.label}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {project.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Budget Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                              <span className="text-sm font-bold text-blue-600">{getCurrencyCode()}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Budget</span>
                          </div>
                          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {formatCurrency(project.total_budget)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${budgetPercentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-2 mb-6 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600">Timeline:</span>
                        <span className="text-xs font-medium text-gray-800">
                          {formatDate(project.start_date)} - {formatDate(project.target_end_date)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1"
                        >
                          <Link
                            href={`/projects/${project.id}`}
                            className="relative group/btn block"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-50 group-hover/btn:opacity-75 transition-opacity" />
                            <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg">
                              <Eye className="w-4 h-4" />
                              View
                              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        </motion.div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingProject(project)}
                          className="relative group/edit p-2.5"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl blur opacity-0 group-hover/edit:opacity-50 transition-opacity" />
                          <div className="relative p-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all shadow-md">
                            <Pencil className="w-4 h-4" />
                          </div>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(project.id)}
                          className="relative group/delete p-2.5"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl blur opacity-0 group-hover/delete:opacity-50 transition-opacity" />
                          <div className="relative p-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl hover:from-red-100 hover:to-pink-100 transition-all shadow-md">
                            <Trash2 className="w-4 h-4" />
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchProjects()
          }}
        />
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={() => {
            setEditingProject(null)
            fetchProjects()
          }}
        />
      )}
    </div>
  )
}

function CreateProjectModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_budget: '',
    start_date: '',
    target_end_date: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total_budget: parseFloat(formData.total_budget) || 0
        })
      })
      
      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl w-full max-w-3xl p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Kitchen Renovation"
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
              placeholder="Brief description of your renovation project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Budget ({getCurrencyCode()})
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.total_budget}
              onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
              placeholder="50000"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target End Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.target_end_date}
                onChange={(e) => setFormData({ ...formData, target_end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium text-lg rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium text-lg rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}