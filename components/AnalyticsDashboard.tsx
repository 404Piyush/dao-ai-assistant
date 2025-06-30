'use client'

import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'

interface AnalyticsData {
  totalChats: number
  totalUsers: number
  activeUsers?: number
  totalFees: string
  averageResponseTime: number
  modelUsage: { [key: string]: number }
  dailyUsage: { date: string; count: number }[]
  topFeatures: { feature: string; usage: number }[]
  recentActivity: any[]
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalChats: 0,
    totalUsers: 0,
    totalFees: '0',
    averageResponseTime: 0,
    modelUsage: {},
    dailyUsage: [],
    topFeatures: [],
    recentActivity: []
  })
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Try to fetch real analytics data
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch(`/api/analytics?period=${selectedPeriod}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
      } else {
        throw new Error(data.error || 'Failed to load analytics')
      }
    } catch (error: any) {
      console.error('Error loading analytics:', error)
      setError(error.name === 'AbortError' ? 'Request timed out' : error.message)
      
      // Fallback to mock data when API fails
      const mockAnalytics = generateMockAnalytics(selectedPeriod)
      setAnalytics(mockAnalytics)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockAnalytics = (period: string): AnalyticsData => {
    const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90
    const dailyUsage = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dailyUsage.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      })
    }
    
    return {
      totalChats: Math.floor(Math.random() * 500) + 150,
      totalUsers: Math.floor(Math.random() * 100) + 25,
      activeUsers: Math.floor(Math.random() * 10) + 2,
      totalFees: (Math.random() * 2 + 0.5).toFixed(4),
      averageResponseTime: Math.floor(Math.random() * 5) + 3,
      modelUsage: {
        'qwen3:8b': Math.floor(Math.random() * 40) + 35,
        'gemma2:2b': Math.floor(Math.random() * 30) + 25,
        'other': Math.floor(Math.random() * 10)
      },
      dailyUsage,
      topFeatures: [
        { feature: 'Proposal Summarization', usage: Math.floor(Math.random() * 20) + 45 },
        { feature: 'Proposal Drafting', usage: Math.floor(Math.random() * 20) + 35 },
        { feature: 'Chat History Storage', usage: Math.floor(Math.random() * 15) + 10 }
      ],
      recentActivity: [
        { type: 'summarize', user: '0x1234...5678', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
        { type: 'draft', user: '0x9abc...def0', timestamp: new Date(Date.now() - 1000 * 60 * 12) },
        { type: 'summarize', user: '0x1111...2222', timestamp: new Date(Date.now() - 1000 * 60 * 20) },
        { type: 'draft', user: '0xaaaa...bbbb', timestamp: new Date(Date.now() - 1000 * 60 * 35) }
      ]
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getMaxUsage = () => Math.max(...analytics.dailyUsage.map(d => d.count), 1)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold gradient-text">📊 Analytics Dashboard</h2>
            {error && (
              <p className="text-sm text-yellow-600 mt-1">
                ⚠️ Using demo data - {error}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadAnalytics}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              disabled={isLoading}
            >
              🔄 Refresh
            </button>
            <div className="flex space-x-2">
              {['24h', '7d', '30d', '90d'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{analytics.totalChats.toLocaleString()}</div>
            <div className="text-sm text-blue-700">Total Chats</div>
            <div className="text-xs text-blue-600 mt-1">+12% from last period</div>
          </div>

          <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{analytics.activeUsers || 0}</div>
            <div className="text-sm text-purple-700">Active Users</div>
            <div className="text-xs text-purple-600 mt-1">🔌 Currently Online</div>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-3xl font-bold text-green-600">{analytics.totalFees} ETH</div>
            <div className="text-sm text-green-700">Total Fees</div>
            <div className="text-xs text-green-600 mt-1">+15% from last period</div>
          </div>

          <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="text-3xl font-bold text-orange-600">{analytics.averageResponseTime}s</div>
            <div className="text-sm text-orange-700">Avg Response</div>
            <div className="text-xs text-orange-600 mt-1">-3% from last period</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">📈 Daily Usage Trend</h3>
          <div className="h-48 flex items-end justify-between space-x-1">
            {analytics.dailyUsage.length > 0 ? analytics.dailyUsage.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                  style={{
                    height: `${(day.count / getMaxUsage()) * 100}%`,
                    minHeight: '8px'
                  }}
                ></div>
                <div className="text-xs text-gray-500 mt-2 rotate-45 origin-left">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            )) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No usage data available
              </div>
            )}
          </div>
        </div>

        {/* Model Usage */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">🤖 Model Usage Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.modelUsage).map(([model, percentage], index) => (
              <div key={model} className="flex items-center justify-between">
                <span className="text-sm font-medium">{model}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        index === 0 ? 'from-blue-400 to-blue-600' :
                        index === 1 ? 'from-purple-400 to-purple-600' :
                        index === 2 ? 'from-green-400 to-green-600' :
                        'from-gray-400 to-gray-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Usage */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">⚡ Feature Popularity</h3>
          <div className="space-y-4">
            {analytics.topFeatures.map((feature, index) => (
              <div key={feature.feature} className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-blue-500' : 
                  index === 1 ? 'bg-purple-500' : 'bg-green-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{feature.feature}</div>
                  <div className="text-sm text-gray-500">{feature.usage}% of total usage</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">🕒 Recent Activity</h3>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.type === 'summarize' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {activity.type === 'summarize' ? '📋' : '✍️'}
                  </span>
                  <span className="text-sm">{formatAddress(activity.user)}</span>
                </div>
                <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export/Share Options */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">📥 Export Data</h3>
            <p className="text-sm text-gray-600">Download analytics data for further analysis</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-green-100 text-green-600 rounded-lg font-medium hover:bg-green-200 transition-colors">
              📊 Export CSV
            </button>
            <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-medium hover:bg-blue-200 transition-colors">
              📈 Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 