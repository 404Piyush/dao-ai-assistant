import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dao-assistant';

// Analytics Event Schema
const analyticsEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['summarize', 'draft', 'chat_store', 'user_connect'],
    required: true
  },
  userAddress: {
    type: String,
    required: true
  },
  modelUsed: String,
  inputLength: Number,
  outputLength: Number,
  processingTime: Number, // in milliseconds
  success: Boolean,
  errorMessage: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Daily Analytics Summary Schema
const dailyAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  totalChats: {
    type: Number,
    default: 0
  },
  uniqueUsers: {
    type: Number,
    default: 0
  },
  totalFees: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number,
    default: 0
  },
  modelUsage: {
    type: Map,
    of: Number,
    default: new Map()
  },
  featureUsage: {
    type: Map,
    of: Number,
    default: new Map()
  }
});

// User Analytics Schema
const userAnalyticsSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true,
    unique: true
  },
  totalChats: {
    type: Number,
    default: 0
  },
  totalFees: {
    type: Number,
    default: 0
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  favoriteModel: String,
  averageInputLength: Number,
  totalProcessingTime: Number
});

// Create models
export const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', analyticsEventSchema);
export const DailyAnalytics = mongoose.models.DailyAnalytics || mongoose.model('DailyAnalytics', dailyAnalyticsSchema);
export const UserAnalytics = mongoose.models.UserAnalytics || mongoose.model('UserAnalytics', userAnalyticsSchema);

// Connection management
let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('📊 Connected to MongoDB for analytics');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Analytics functions
export async function logAnalyticsEvent(eventData: {
  type: 'summarize' | 'draft' | 'chat_store' | 'user_connect';
  userAddress: string;
  modelUsed?: string;
  inputLength?: number;
  outputLength?: number;
  processingTime?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
}) {
  try {
    await connectToDatabase();
    
    const event = new AnalyticsEvent(eventData);
    await event.save();
    
    // Update user analytics
    await updateUserAnalytics(eventData);
    
    // Update daily analytics
    await updateDailyAnalytics(eventData);
    
    console.log(`📊 Analytics logged: ${eventData.type} by ${eventData.userAddress}`);
  } catch (error) {
    console.error('❌ Error logging analytics:', error);
  }
}

async function updateUserAnalytics(eventData: any) {
  const update: any = {
    lastSeen: new Date(),
    $inc: { totalChats: 1 }
  };

  if (eventData.modelUsed) {
    update.favoriteModel = eventData.modelUsed;
  }

  if (eventData.processingTime) {
    update.$inc.totalProcessingTime = eventData.processingTime;
  }

  await UserAnalytics.findOneAndUpdate(
    { userAddress: eventData.userAddress },
    update,
    { upsert: true, new: true }
  );
}

async function updateDailyAnalytics(eventData: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const update: any = {
    $inc: { totalChats: 1 },
    $addToSet: { uniqueUsers: eventData.userAddress }
  };

  if (eventData.modelUsed) {
    update.$inc[`modelUsage.${eventData.modelUsed}`] = 1;
  }

  update.$inc[`featureUsage.${eventData.type}`] = 1;

  if (eventData.processingTime) {
    // Calculate new average (simplified)
    const dailyDoc = await DailyAnalytics.findOne({ date: today });
    if (dailyDoc) {
      const newAvg = (dailyDoc.averageResponseTime * dailyDoc.totalChats + eventData.processingTime) / (dailyDoc.totalChats + 1);
      update.averageResponseTime = newAvg;
    } else {
      update.averageResponseTime = eventData.processingTime;
    }
  }

  await DailyAnalytics.findOneAndUpdate(
    { date: today },
    update,
    { upsert: true, new: true }
  );
}

export async function getAnalytics(period: '24h' | '7d' | '30d' | '90d' = '7d') {
  try {
    await connectToDatabase();
    
    const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get daily analytics
    const dailyData = await DailyAnalytics.find({
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    // Get active users from WebSocket server
    let activeUsers = 0;
    try {
      const response = await fetch('http://localhost:3002/active-users');
      const data = await response.json();
      activeUsers = data.activeUsers || 0;
    } catch (error) {
      console.log('⚠️ Could not fetch active users, WebSocket server may be down');
    }
    
    // Get total metrics
    const totalChats = dailyData.reduce((sum, day) => sum + day.totalChats, 0);
    const totalUsers = await UserAnalytics.countDocuments({
      lastSeen: { $gte: startDate }
    });
    const totalFees = dailyData.reduce((sum, day) => sum + day.totalFees, 0);
    const avgResponseTime = dailyData.reduce((sum, day) => sum + day.averageResponseTime, 0) / dailyData.length || 0;
    
    // Get model usage
    const modelUsage: { [key: string]: number } = {};
    dailyData.forEach(day => {
      if (day.modelUsage) {
        for (const [model, count] of day.modelUsage.entries()) {
          modelUsage[model] = (modelUsage[model] || 0) + count;
        }
      }
    });
    
    // Get feature usage
    const featureUsage: { [key: string]: number } = {};
    dailyData.forEach(day => {
      if (day.featureUsage) {
        for (const [feature, count] of day.featureUsage.entries()) {
          featureUsage[feature] = (featureUsage[feature] || 0) + count;
        }
      }
    });
    
    // Get recent activity
    const recentActivity = await AnalyticsEvent.find({
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 }).limit(10);
    
    return {
      totalChats,
      totalUsers,
      activeUsers, // Real-time active WebSocket connections
      totalFees: totalFees.toFixed(4),
      averageResponseTime: Math.round(avgResponseTime / 1000), // Convert to seconds
      modelUsage,
      dailyUsage: dailyData.map(day => ({
        date: day.date.toISOString().split('T')[0],
        count: day.totalChats
      })),
      topFeatures: Object.entries(featureUsage).map(([feature, usage]) => ({
        feature: feature === 'summarize' ? 'Proposal Summarization' : 
                feature === 'draft' ? 'Proposal Drafting' : 
                feature === 'chat_store' ? 'Chat History' : feature,
        usage: Math.round((usage / totalChats) * 100)
      })).sort((a, b) => b.usage - a.usage),
      recentActivity: recentActivity.map(event => ({
        type: event.type,
        user: event.userAddress,
        timestamp: event.timestamp
      }))
    };
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    throw error;
  }
} 