import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Anthropic API proxy
app.post('/api/anthropic', async (req, res) => {
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  
  if (!API_KEY) {
    console.error('[Anthropic] API key missing');
    return res.status(500).json({ 
      error: 'Anthropic API key is missing. Please set ANTHROPIC_API_KEY environment variable.',
      provider: 'Anthropic',
      errorType: 'MISSING_API_KEY'
    });
  }
  
  if (!API_KEY.startsWith('sk-ant-')) {
    console.error('[Anthropic] Invalid API key format');
    return res.status(500).json({ 
      error: 'Anthropic API key appears invalid. Keys should start with "sk-ant-".',
      provider: 'Anthropic',
      errorType: 'INVALID_API_KEY'
    });
  }

  try {
    const { model, prompt, max_tokens = 4096, temperature = 1, top_p = 1, stream = false } = req.body;

    const requestBody = {
      model: model || 'claude-3-sonnet-20250101',
      max_tokens,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      top_p,
      stream
    };
    
    console.log(`[Anthropic] Sending request with model: ${requestBody.model}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ 
        error: { message: response.statusText } 
      }));
      
      const statusCode = response.status;
      let errorMessage = errorBody.error?.message || errorBody.message || response.statusText;
      
      // Provide specific error messages based on status code
      if (statusCode === 401) {
        errorMessage = `Anthropic authentication failed (401). Your API key may be invalid or expired. Please check ANTHROPIC_API_KEY.`;
      } else if (statusCode === 403) {
        errorMessage = `Anthropic access forbidden (403). Your API key may not have permission for this model.`;
      } else if (statusCode === 429) {
        errorMessage = `Anthropic rate limit exceeded (429). Please wait before making more requests.`;
      } else if (statusCode >= 500) {
        errorMessage = `Anthropic server error (${statusCode}). The service may be temporarily unavailable.`;
      }
      
      console.error('[Anthropic] API error:', {
        status: statusCode,
        message: errorMessage,
        body: errorBody
      });
      
      return res.status(statusCode).json({ 
        error: errorMessage,
        provider: 'Anthropic',
        statusCode: statusCode,
        originalError: errorBody.error?.message || errorBody.message
      });
    }

    if (stream) {
      // Stream response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      } finally {
        reader.releaseLock();
        res.end();
      }
    } else {
      // Non-streaming response
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error('[Anthropic] Request failed:', error);
    res.status(500).json({ 
      error: `Anthropic request failed: ${error.message}`,
      provider: 'Anthropic',
      errorType: 'REQUEST_FAILED',
      details: error.message
    });
  }
});

// OpenAI API proxy
app.post('/api/openai', async (req, res) => {
  const API_KEY = process.env.OPENAI_API_KEY;
  
  if (!API_KEY) {
    console.error('[OpenAI] API key missing');
    return res.status(500).json({ 
      error: 'OpenAI API key is missing. Please set OPENAI_API_KEY environment variable.',
      provider: 'OpenAI',
      errorType: 'MISSING_API_KEY'
    });
  }
  
  if (!API_KEY.startsWith('sk-')) {
    console.error('[OpenAI] Invalid API key format');
    return res.status(500).json({ 
      error: 'OpenAI API key appears invalid. Keys should start with "sk-".',
      provider: 'OpenAI',
      errorType: 'INVALID_API_KEY'
    });
  }

  try {
    const { model, prompt, max_tokens = 4096, temperature = 1, top_p = 1, stream = false } = req.body;

    const isO1Model = model?.startsWith('o1');
    
    const requestBody = {
      model: model || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens,
      stream
    };

    if (!isO1Model) {
      requestBody.temperature = temperature;
      requestBody.top_p = top_p;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: { message: response.statusText } 
      }));
      return res.status(response.status).json({ 
        error: error.error?.message || response.statusText 
      });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      } finally {
        reader.releaseLock();
        res.end();
      }
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

// Google AI API proxy
app.post('/api/google', async (req, res) => {
  const API_KEY = process.env.GOOGLE_AI_API_KEY;
  
  if (!API_KEY) {
    console.error('[Google AI] API key missing');
    return res.status(500).json({ 
      error: 'Google AI API key is missing. Please set GOOGLE_AI_API_KEY environment variable.',
      provider: 'Google AI',
      errorType: 'MISSING_API_KEY'
    });
  }
  
  if (!API_KEY.startsWith('AIza')) {
    console.error('[Google AI] Invalid API key format');
    return res.status(500).json({ 
      error: 'Google AI API key appears invalid. Keys should start with "AIza".',
      provider: 'Google AI',
      errorType: 'INVALID_API_KEY'
    });
  }

  try {
    const { model, prompt, max_tokens = 4096, temperature = 1, top_p = 1 } = req.body;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        topP: top_p,
        maxOutputTokens: max_tokens
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: { message: response.statusText } 
      }));
      return res.status(response.status).json({ 
        error: error.error?.message || response.statusText 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('[Google AI] Request failed:', error);
    res.status(500).json({ 
      error: `Google AI request failed: ${error.message}`,
      provider: 'Google AI',
      errorType: 'REQUEST_FAILED',
      details: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  const hasGoogleKey = !!process.env.GOOGLE_AI_API_KEY;

  res.json({ 
    status: 'ok',
    keys: {
      anthropic: hasAnthropicKey,
      openai: hasOpenAIKey,
      google: hasGoogleKey
    }
  });
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🔒 Secure API Proxy running on http://localhost:${PORT}`);
  console.log(`\n📝 Configured API keys:`);
  console.log(`   Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✅' : '❌'}`);
  console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`   Google: ${process.env.GOOGLE_AI_API_KEY ? '✅' : '❌'}`);
  console.log();
});
