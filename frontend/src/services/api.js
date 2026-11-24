const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchProgrammes() {
  const res = await fetch(`${API_BASE}/programmes`);
  if (!res.ok) throw new Error('Failed to fetch programmes');
  return res.json();
}

export async function fetchSampleQuestions(programme = 'BCA') {
  const res = await fetch(`${API_BASE}/sample-queries?programme=${encodeURIComponent(programme)}`);
  if (!res.ok) throw new Error('Failed to fetch sample queries');
  return res.json();
}

export async function sendChatMessage({ message, programme, apiKey, history = [] }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      programme,
      api_key: apiKey || undefined,
      history
    })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Chat request failed');
  }
  return res.json();
}

export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function uploadDocument(file, docType = 'custom') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Upload failed');
  }
  return res.json();
}

export async function updateSettings(apiKey, model = 'llama-3.3-70b-versatile') {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, model })
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}
