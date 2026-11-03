/**
 * Centralized API service module for PlantCare AI
 * Connects to the FastAPI backend running on http://localhost:8000
 */

const DEFAULT_BASE_URL = 'http://localhost:8000';

export function getBaseUrl() {
  const customUrl = localStorage.getItem('plantcare_api_url');
  if (customUrl && customUrl.trim()) {
    return customUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_BASE_URL;
}

export function setBaseUrl(url) {
  if (url) {
    localStorage.setItem('plantcare_api_url', url.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('plantcare_api_url');
  }
}

/**
 * Checks backend health and model status
 * Endpoint: GET /health
 */
export async function checkBackendHealth() {
  const baseUrl = getBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    let message = 'Unable to connect to PlantCare AI service.';
    if (error.name === 'AbortError') {
      message = 'Connection timed out. Ensure the server is running.';
    } else if (error.message.includes('Failed to fetch')) {
      message = 'Failed to connect. Make sure service is running on ' + baseUrl;
    } else {
      message = error.message;
    }
    return {
      success: false,
      error: message
    };
  }
}

/**
 * Sends plant leaf image to backend for CNN classification
 * Endpoint: POST /predict
 * Form field: file
 */
export async function predictPlantDisease(file) {
  if (!file) {
    throw new Error('Please select an image file to analyze.');
  }

  const baseUrl = getBaseUrl();
  const formData = new FormData();
  formData.append('file', file);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 seconds for heavy CNN models on CPU

    const response = await fetch(`${baseUrl}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMsg = errorData.detail;
        }
      } catch {
        // use default errorMsg
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    let message = error.message;
    if (error.name === 'AbortError') {
      message = 'Analysis request timed out. Please try again with a smaller image.';
    } else if (error.message.includes('Failed to fetch')) {
      message = `Cannot reach service at ${baseUrl}. Ensure uvicorn main:app is running.`;
    }
    return {
      success: false,
      error: message
    };
  }
}

/**
 * Fetch available Ollama LLM models and health status
 * Endpoint: GET /api/chat/models
 */
export async function fetchChatModels() {
  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/chat/models`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch chat models (${response.status})`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      data: { online: false, models: [], default_model: 'llama3.2' }
    };
  }
}

/**
 * Stream chat responses from Ollama via FastAPI Server-Sent Events (SSE)
 * Endpoint: POST /api/chat
 */
export async function streamChatCompletion({
  messages,
  model,
  context,
  language = 'en',
  onChunk,
  onDone,
  onError,
  signal
}) {
  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        messages,
        model,
        context,
        language,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      let errText = `Server error ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.detail) errText = errJson.detail;
      } catch {
        // fallback
      }
      throw new Error(errText);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const payload = trimmed.replace(/^data:\s*/, '').trim();

        if (payload === '[DONE]') {
          if (onDone) onDone();
          return;
        }

        try {
          const parsed = JSON.parse(payload);
          if (parsed.content && onChunk) {
            onChunk(parsed.content);
          }
        } catch {
          // ignore partial JSON parse error
        }
      }
    }

    if (onDone) onDone();
  } catch (error) {
    if (error.name === 'AbortError') {
      if (onDone) onDone();
      return;
    }
    if (onError) {
      onError(error.message || 'Error communicating with Ollama chatbot.');
    }
  }
}


