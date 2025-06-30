const { Server } = require('socket.io');
const http = require('http');
const axios = require('axios');
const mongoose = require('mongoose');

// Create HTTP server for WebSocket
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const OLLAMA_API_URL = 'http://localhost:11434';

// MongoDB setup for analytics
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dao-assistant';

// Simple MongoDB logging (without complex schemas for server-side)
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📊 WebSocket server connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  }
}

// Simple analytics logging function
async function logEvent(eventData) {
  try {
    const collection = mongoose.connection.db.collection('analytics_events');
    await collection.insertOne({
      ...eventData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Failed to log analytics:', error);
  }
}

connectDB();

// Track active connections
let activeConnections = new Set();

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  activeConnections.add(socket.id);
  
  // Log user connection
  logEvent({
    type: 'user_connect',
    userAddress: socket.handshake.address || 'unknown',
    success: true
  });

  // Handle proposal summarization with streaming
  socket.on('summarize-proposal', async (data) => {
    const { proposalText, modelName = 'gemma2:2b' } = data;
    socket._startTime = Date.now(); // Track processing time
    
    console.log(`📋 Summarization request for model: ${modelName}`);
    
    try {
      // Emit status updates
      socket.emit('status', { 
        stage: 'connecting', 
        message: 'Connecting to AI model...' 
      });

      const prompt = `You are a DAO proposal analyst. Write a clear, concise summary of this proposal in under 200 words. Do not include any thinking process or explanations - just provide the final summary.

Include: Main objective, key points, potential impact, and considerations.

Proposal:
${proposalText}

Summary:`;

      // Make streaming request to Ollama
      const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
        model: modelName,
        prompt: prompt,
        stream: true,
        options: {
          temperature: 0.6,
          top_p: 0.8,
          num_predict: 400,
          num_ctx: 2048,
          num_thread: 8,
          repeat_penalty: 1.1
        }
      }, {
        responseType: 'stream',
        timeout: 30000
      });

      socket.emit('status', { 
        stage: 'generating', 
        message: 'AI is analyzing proposal...' 
      });

      let fullResponse = '';
      let currentThinking = '';
      let currentDisplay = '';
      let chunkCount = 0;

      // Handle streaming response
      response.data.on('data', async (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            
            if (parsed.response) {
              fullResponse += parsed.response;
              chunkCount++;
              
              // Real-time separation of thinking and display content
              // Extract thinking content if present
              const thinkMatch = fullResponse.match(/<think>([\s\S]*?)<\/think>/i);
              if (thinkMatch) {
                currentThinking = thinkMatch[1].trim();
              }
              
              // Get clean display content (everything outside think tags)
              const beforeThink = fullResponse.split('<think>')[0] || '';
              const afterThink = fullResponse.split('</think>')[1] || '';
              currentDisplay = (beforeThink + afterThink).trim();
              
              // Only emit if we have new display content (not just thinking)
              if (currentDisplay.length > 0 && (chunkCount % 2 === 0 || parsed.response.includes('.') || parsed.response.includes('\n'))) {
                socket.emit('stream-chunk', {
                  chunk: parsed.response.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, ''),
                  fullText: currentDisplay,
                  thinking: currentThinking,
                  progress: parsed.done ? 100 : Math.min(90, chunkCount * 2)
                });
              }
            }
            
            if (parsed.done) {
              socket.emit('stream-complete', {
                success: true,
                summary: currentDisplay,
                thinking: currentThinking,
                model: modelName,
                wordCount: currentDisplay.split(' ').length
              });
              
              // Log analytics
              await logEvent({
                type: 'summarize',
                userAddress: socket.handshake.address || 'unknown',
                modelUsed: modelName,
                inputLength: proposalText.length,
                outputLength: cleanResponse.length,
                success: true,
                processingTime: Date.now() - socket._startTime
              });
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            continue;
          }
        }
      });

      response.data.on('end', () => {
        if (fullResponse.trim()) {
          // Extract thinking content and clean response
          const thinkMatch = fullResponse.match(/<think>([\s\S]*?)<\/think>/i);
          const thinkingContent = thinkMatch ? thinkMatch[1].trim() : '';
          const cleanResponse = fullResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          
          socket.emit('stream-complete', {
            success: true,
            summary: cleanResponse,
            thinking: thinkingContent,
            model: modelName,
            wordCount: cleanResponse.split(' ').length
          });
        }
      });

      response.data.on('error', (error) => {
        console.error('❌ Streaming error:', error);
        socket.emit('stream-error', {
          success: false,
          error: 'Streaming failed: ' + error.message
        });
      });

    } catch (error) {
      console.error('❌ Summarization error:', error);
      
      let errorMessage = 'Failed to connect to AI service';
      
      if (error.response?.status === 404) {
        errorMessage = `Model '${modelName}' not found. Please select a different model.`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Try using a faster model or shorter text.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      socket.emit('stream-error', {
        success: false,
        error: errorMessage
      });
    }
  });

  // Handle proposal drafting with streaming
  socket.on('draft-proposal', async (data) => {
    const { ideas, title = 'DAO Proposal', modelName = 'gemma2:2b' } = data;
    
    console.log(`✍️ Drafting request for model: ${modelName}`);
    
    try {
      socket.emit('status', { 
        stage: 'connecting', 
        message: 'Connecting to AI model...' 
      });

      const prompt = `You are a professional DAO proposal writer. Create a well-structured, comprehensive proposal based on the ideas provided.

Format the proposal with proper markdown structure including:
- Title
- Summary
- Background/Context
- Proposed Solution
- Implementation Plan
- Benefits & Expected Outcomes
- Risks & Considerations
- Timeline
- Voting Options

Title: ${title}
Ideas: ${ideas}

Write a complete, professional proposal:`;

      const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
        model: modelName,
        prompt: prompt,
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 800,
          num_ctx: 3000,
          num_thread: 8,
          repeat_penalty: 1.1
        }
      }, {
        responseType: 'stream',
        timeout: 45000
      });

      socket.emit('status', { 
        stage: 'generating', 
        message: 'AI is crafting your proposal...' 
      });

      let fullResponse = '';
      let currentThinking = '';
      let currentDisplay = '';
      let chunkCount = 0;

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            
            if (parsed.response) {
              fullResponse += parsed.response;
              chunkCount++;
              
              // Real-time separation of thinking and display content
              const thinkMatch = fullResponse.match(/<think>([\s\S]*?)<\/think>/i);
              if (thinkMatch) {
                currentThinking = thinkMatch[1].trim();
              }
              
              // Get clean display content (everything outside think tags)
              const beforeThink = fullResponse.split('<think>')[0] || '';
              const afterThink = fullResponse.split('</think>')[1] || '';
              currentDisplay = (beforeThink + afterThink).trim();
              
              // Emit more frequent updates for drafting
              if (currentDisplay.length > 0 && (chunkCount % 2 === 0 || parsed.response.includes('\n') || parsed.response.includes('#'))) {
                socket.emit('stream-chunk', {
                  chunk: parsed.response.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, ''),
                  fullText: currentDisplay,
                  thinking: currentThinking,
                  progress: parsed.done ? 100 : Math.min(95, chunkCount * 1.5)
                });
              }
            }
            
            if (parsed.done) {
              socket.emit('stream-complete', {
                success: true,
                draft: currentDisplay,
                thinking: currentThinking,
                model: modelName,
                wordCount: currentDisplay.split(' ').length
              });
            }
          } catch (parseError) {
            continue;
          }
        }
      });

      response.data.on('end', () => {
        if (fullResponse.trim()) {
          // Extract thinking content and clean response
          const thinkMatch = fullResponse.match(/<think>([\s\S]*?)<\/think>/i);
          const thinkingContent = thinkMatch ? thinkMatch[1].trim() : '';
          const cleanResponse = fullResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          
          // Ensure we send the complete final response
          console.log(`✅ Drafting complete: ${cleanResponse.length} chars, ${cleanResponse.split(' ').length} words`);
          
          socket.emit('stream-complete', {
            success: true,
            draft: cleanResponse,
            thinking: thinkingContent,
            model: modelName,
            wordCount: cleanResponse.split(' ').length
          });
          
          // Also emit a final chunk to ensure UI updates
          socket.emit('stream-chunk', {
            chunk: '',
            fullText: cleanResponse,
            thinking: thinkingContent,
            progress: 100
          });
        }
      });

      response.data.on('error', (error) => {
        console.error('❌ Streaming error:', error);
        socket.emit('stream-error', {
          success: false,
          error: 'Streaming failed: ' + error.message
        });
      });

    } catch (error) {
      console.error('❌ Drafting error:', error);
      
      let errorMessage = 'Failed to connect to AI service';
      
      if (error.response?.status === 404) {
        errorMessage = `Model '${modelName}' not found. Please select a different model.`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Try using a faster model or shorter input.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      socket.emit('stream-error', {
        success: false,
        error: errorMessage
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
    activeConnections.delete(socket.id);
  });
});

// Create separate HTTP server for API endpoints
const express = require('express');
const http2 = require('http');
const app = express();
const apiServer = http2.createServer(app);

app.use(express.json());

app.get('/active-users', (req, res) => {
  res.json({ activeUsers: activeConnections.size });
});

// Start WebSocket server on main port
const PORT = process.env.WS_PORT || 3002;
server.listen(PORT, () => {
  console.log(`🔌 WebSocket server running on port ${PORT}`);
  console.log(`🌐 Accepting connections from http://localhost:3000`);
});

// Start API server on different port to avoid conflicts
const API_PORT = PORT + 10; // 3012
apiServer.listen(API_PORT, () => {
  console.log(`📊 Active users API available at http://localhost:${API_PORT}/active-users`);
});

module.exports = { io, server, activeConnections }; 