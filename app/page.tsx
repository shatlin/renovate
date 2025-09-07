'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Home, Calculator, PaintBucket, Hammer, TrendingUp, CheckCircle, DollarSign, ClipboardList, Users, FileSpreadsheet, BarChart3, PieChart } from 'lucide-react'
import Navigation from '@/components/Navigation'

export default function HomePage() {
  const features = [
    {
      icon: Calculator,
      title: 'Smart Budget Tracking',
      description: 'Track every expense with detailed categorization and real-time updates',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Home,
      title: 'Room-by-Room Planning',
      description: 'Organize your renovation by rooms and areas for better management',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Visual Analytics',
      description: 'See where your money goes with interactive charts and insights',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Contractor Management',
      description: 'Keep track of all your contractors, payments, and schedules',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  const benefits = [
    {
      icon: DollarSign,
      title: 'Save Money',
      description: 'Avoid budget overruns with real-time tracking and alerts'
    },
    {
      icon: ClipboardList,
      title: 'Stay Organized',
      description: 'Keep all your renovation details in one accessible place'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor actual vs estimated costs as your project evolves'
    },
    {
      icon: FileSpreadsheet,
      title: 'Better Than Excel',
      description: 'Purpose-built for renovations with smart features Excel lacks'
    }
  ]

  const comparison = [
    { feature: 'Room-based organization', excel: false, renovate: true },
    { feature: 'Automatic cost calculations', excel: false, renovate: true },
    { feature: 'Contractor tracking', excel: false, renovate: true },
    { feature: 'Visual budget analytics', excel: false, renovate: true },
    { feature: 'Material & labor separation', excel: false, renovate: true },
    { feature: 'Progress tracking', excel: false, renovate: true },
    { feature: 'Mobile friendly', excel: false, renovate: true },
    { feature: 'Real-time collaboration', excel: false, renovate: true }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-6"
            >
              <PaintBucket className="w-4 h-4" />
              <span className="text-sm font-medium">Smart Renovation Planning</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Plan Your Dream
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Renovation Budget
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Stop juggling spreadsheets. Start planning smarter. Track every expense, manage contractors, 
              and stay on budget with the renovation planner built for homeowners.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Start Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Sign In
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Kitchen Renovation</h3>
                <span className="text-sm text-gray-500">Total Budget: $50,000</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Cabinets</p>
                  <p className="text-lg font-bold text-blue-600">$12,000</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Appliances</p>
                  <p className="text-lg font-bold text-green-600">$8,500</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Countertops</p>
                  <p className="text-lg font-bold text-purple-600">$6,000</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Labor</p>
                  <p className="text-lg font-bold text-orange-600">$15,000</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg h-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '83%' }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">83% of budget allocated</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Everything You Need to
              <span className="block text-blue-600">Plan Your Renovation</span>
            </h2>
            <p className="text-xl text-gray-600">Powerful features designed for homeowners</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8 text-gray-900">
                Why Choose RenovateBudget
                <span className="block text-blue-600">Over Spreadsheets?</span>
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <benefit.icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Feature Comparison</h3>
              <div className="space-y-3">
                {comparison.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.feature}</span>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Excel</p>
                        {item.excel ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Us</p>
                        {item.renovate ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Start Planning in
              <span className="block text-blue-600">3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Project',
                description: 'Set up your renovation project with total budget and timeline'
              },
              {
                step: '2',
                title: 'Add Rooms & Items',
                description: 'Break down your renovation by rooms and add specific items with costs'
              },
              {
                step: '3',
                title: 'Track & Manage',
                description: 'Monitor progress, update actual costs, and stay on budget'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-white"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Take Control of Your Renovation?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of homeowners who've successfully managed their renovation budgets
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-xl transition-all"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <p className="text-sm text-blue-100 mt-4">No credit card required • Free forever</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Hammer className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">RenovateBudget</span>
          </div>
          <p className="text-gray-600">© 2024 RenovateBudget. Smart planning for your dream renovation.</p>
        </div>
      </footer>
    </div>
  )
}