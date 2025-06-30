import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, logAnalyticsEvent } from '../../../lib/mongodb';
import mongoose from 'mongoose';

// Chat History Schema
const chatHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['summarize', 'draft'],
    required: true
  },
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  thinking: String,
  model: {
    type: String,
    required: true
  },
  userAddress: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  fees: {
    type: Number, // ETH amount paid
    default: 0
  }
});

const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', chatHistorySchema);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, input, output, thinking, model, userAddress, isPublic } = body;

    // Validate required fields
    if (!type || !input || !output || !model || !userAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    await connectToDatabase();

    // Calculate fee
    const fee = isPublic ? 0.005 : 0.001; // ETH

    // Save chat to database
    const chatDoc = new ChatHistory({
      type,
      input,
      output,
      thinking,
      model,
      userAddress,
      isPublic,
      fees: fee,
      timestamp: new Date()
    });

    await chatDoc.save();

    // Log analytics event
    await logAnalyticsEvent({
      type: 'chat_store',
      userAddress,
      modelUsed: model,
      inputLength: input.length,
      outputLength: output.length,
      success: true,
      metadata: {
        chatId: chatDoc._id,
        isPublic,
        fee
      }
    });

    return NextResponse.json({
      success: true,
      chatId: chatDoc._id,
      message: `Chat ${isPublic ? 'shared publicly' : 'saved privately'} successfully`
    });

  } catch (error) {
    console.error('Save chat error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to save chat'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const publicOnly = searchParams.get('public') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    await connectToDatabase();

    let query: any = {};
    
    if (publicOnly) {
      query.isPublic = true;
    } else if (userAddress) {
      query.userAddress = userAddress;
    }

    const chats = await ChatHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      chats: chats.map(chat => ({
        ...chat,
        _id: chat._id.toString()
      }))
    });

  } catch (error) {
    console.error('Get chats error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch chats'
    }, { status: 500 });
  }
} 