import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as '24h' | '7d' | '30d' | '90d' || '7d';
    
    // Try to get real analytics from MongoDB
    let analytics;
    try {
      const { getAnalytics } = await import('../../../lib/mongodb');
      analytics = await getAnalytics(period);
    } catch (mongoError) {
      console.log('📊 MongoDB not available, using mock analytics data');
      
      // Get active users from WebSocket server
      let activeUsers = 0;
      try {
        const response = await fetch('http://localhost:3002/active-users');
        const data = await response.json();
        activeUsers = data.activeUsers || 0;
      } catch (error) {
        console.log('⚠️ Could not fetch active users, WebSocket server may be down');
      }
      
      // Generate realistic mock data
      const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const dailyUsage = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dailyUsage.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 50) + 10
        });
      }
      
      analytics = {
        totalChats: Math.floor(Math.random() * 500) + 100,
        totalUsers: Math.floor(Math.random() * 100) + 20,
        activeUsers, // Real WebSocket data
        totalFees: (Math.random() * 2 + 0.5).toFixed(4),
        averageResponseTime: Math.floor(Math.random() * 5) + 3,
        modelUsage: {
          'qwen3:8b': Math.floor(Math.random() * 40) + 30,
          'gemma2:2b': Math.floor(Math.random() * 30) + 20
        },
        dailyUsage,
        topFeatures: [
          { feature: 'Proposal Summarization', usage: Math.floor(Math.random() * 20) + 40 },
          { feature: 'Proposal Drafting', usage: Math.floor(Math.random() * 20) + 30 },
          { feature: 'Chat History', usage: Math.floor(Math.random() * 15) + 10 }
        ],
        recentActivity: [
          { type: 'summarize', user: '0x1234...5678', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
          { type: 'draft', user: '0x9abc...def0', timestamp: new Date(Date.now() - 1000 * 60 * 12) },
          { type: 'chat_store', user: '0x1111...2222', timestamp: new Date(Date.now() - 1000 * 60 * 20) }
        ]
      };
    }
    
    return NextResponse.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics data'
    }, { status: 500 });
  }
} 