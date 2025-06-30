const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ollama API endpoint
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DAO AI Assistant API is running' });
});

// Proposal summarization endpoint (main)
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, model = 'gemma2:2b' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = `You are a DAO proposal analyst. Write a clear, concise summary of this content in under 200 words:

${text}

Summary:`;

    console.log(`📋 Summarization request for model: ${model}`);
    
    const ollamaResponse = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model: model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.6,
        top_p: 0.8,
        num_predict: 400,
        num_ctx: 2048,
        num_thread: 8,
        repeat_penalty: 1.1
      }
    }, {
      timeout: 20000
    });

    let summary = ollamaResponse.data.response.trim();
    
    res.json({
      success: true,
      summary: summary,
      model: model
    });

  } catch (error) {
    console.error('Error in summarization:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Unable to connect to Ollama. Please ensure Ollama is running on localhost:11434'
      });
    }

    res.status(500).json({
      error: 'Failed to generate summary',
      details: error.message
    });
  }
});

// Proposal summarization endpoint (legacy)
app.post('/api/summarize-proposal', async (req, res) => {
  try {
    const { proposalText, modelName = 'gemma2:2b' } = req.body;

    if (!proposalText) {
      return res.status(400).json({ error: 'Proposal text is required' });
    }

    const prompt = `You are a DAO proposal analyst. Write a clear, concise summary of this proposal in under 200 words. Do not include any thinking process or explanations - just provide the final summary.

Include: Main objective, key points, potential impact, and considerations.

Proposal:
${proposalText}

Summary:`;

    console.log(`Sending request to Ollama using model: ${modelName}`);
    
    const ollamaResponse = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model: modelName,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.6,
        top_p: 0.8,
        num_predict: 400,
        num_ctx: 2048,
        num_thread: 8,
        repeat_penalty: 1.1
      }
    }, {
      timeout: 20000
    });

    let summary = ollamaResponse.data.response;
    
    // Clean up any thinking content that might have leaked through
    if (summary.includes('<think>') || summary.includes('<thinking>')) {
      // Remove everything from <think> to the end of thinking
      summary = summary.replace(/<think>[\s\S]*?<\/think>/gi, '');
      summary = summary.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
      summary = summary.replace(/<think>[\s\S]*/gi, '');
      summary = summary.replace(/<thinking>[\s\S]*/gi, '');
    }
    
    // Trim any extra whitespace
    summary = summary.trim();
    
    res.json({
      success: true,
      summary: summary,
      model: modelName
    });

  } catch (error) {
    console.error('Error in summarization:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Unable to connect to Ollama. Please ensure Ollama is running on localhost:11434'
      });
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({
        error: 'AI response timed out. Try using a smaller model like gemma2:2b or reduce the input length.'
      });
    }

    res.status(500).json({
      error: 'Failed to generate summary',
      details: error.message
    });
  }
});

// Proposal drafting endpoint
app.post('/api/draft-proposal', async (req, res) => {
  try {
    const { ideas, title, modelName = 'gemma2:2b' } = req.body;

    if (!ideas) {
      return res.status(400).json({ error: 'Proposal ideas are required' });
    }

    const prompt = `You are a DAO proposal writer. Create a well-structured DAO proposal with these sections: Summary, Motivation, Specification, Implementation, Benefits, Risks, Voting Options. 

Do not include any thinking process or explanations - just provide the final proposal.

Title: ${title || 'DAO Proposal'}
Ideas: ${ideas}

Proposal:`;

    console.log(`Sending request to Ollama using model: ${modelName}`);
    
    const ollamaResponse = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model: modelName,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.8,
        num_predict: 600,
        num_ctx: 2048,
        num_thread: 8,
        repeat_penalty: 1.1
      }
    }, {
      timeout: 25000
    });

    let draft = ollamaResponse.data.response;
    
    // Clean up any thinking content that might have leaked through
    if (draft.includes('<think>') || draft.includes('<thinking>')) {
      // Remove everything from <think> to the end of thinking
      draft = draft.replace(/<think>[\s\S]*?<\/think>/gi, '');
      draft = draft.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
      draft = draft.replace(/<think>[\s\S]*/gi, '');
      draft = draft.replace(/<thinking>[\s\S]*/gi, '');
    }
    
    // Trim any extra whitespace
    draft = draft.trim();
    
    res.json({
      success: true,
      draft: draft,
      model: modelName
    });

  } catch (error) {
    console.error('Error in proposal drafting:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Unable to connect to Ollama. Please ensure Ollama is running on localhost:11434'
      });
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(408).json({
        error: 'AI response timed out. Try using a smaller model like gemma2:2b or reduce the input length.'
      });
    }

    res.status(500).json({
      error: 'Failed to generate proposal draft',
      details: error.message
    });
  }
});

// Check Ollama connection
app.get('/api/ollama-status', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`);
    res.json({
      connected: true,
      models: response.data.models
    });
  } catch (error) {
    res.json({
      connected: false,
      error: 'Ollama not reachable'
    });
  }
});

// Analytics endpoint (basic mock for now)
app.get('/api/analytics', (req, res) => {
  try {
    const period = req.query.period || '7d';
    
    // Mock analytics data
    const mockData = {
      period: period,
      totalChats: Math.floor(Math.random() * 100) + 20,
      totalProposals: Math.floor(Math.random() * 50) + 5,
      totalUsers: Math.floor(Math.random() * 200) + 50,
      avgResponseTime: Math.floor(Math.random() * 3000) + 1000,
      popularModels: [
        { name: 'gemma2:2b', usage: Math.floor(Math.random() * 50) + 30 },
        { name: 'qwen3:8b', usage: Math.floor(Math.random() * 40) + 15 }
      ],
      dailyActivity: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        chats: Math.floor(Math.random() * 20) + 5,
        proposals: Math.floor(Math.random() * 10) + 1
      })).reverse()
    };
    
    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DAO AI Assistant API running on port ${PORT}`);
  console.log(`🤖 Ollama API endpoint: ${OLLAMA_API_URL}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
}); 