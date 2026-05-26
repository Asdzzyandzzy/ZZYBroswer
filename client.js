const DEFAULT_BASE_URL = process.env.CHATGPT_LOCAL_API || 'http://127.0.0.1:3123';

function toJson(value) {
  return JSON.stringify(value ?? {});
}

function request(path, options = {}) {
  const baseUrl = options.baseUrl || DEFAULT_BASE_URL;
  const method = options.method || 'GET';
  const body = options.body;

  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const payload = body === undefined ? null : toJson(body);
    const transport = url.protocol === 'https:' ? require('node:https') : require('node:http');

    const req = transport.request(url, {
      method,
      headers: {
        accept: 'application/json',
        ...(payload ? {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload)
        } : {})
      }
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        let parsed;
        try {
          parsed = raw ? JSON.parse(raw) : {};
        } catch (error) {
          reject(new Error(`Invalid JSON response from ${path}: ${error.message}\n${raw}`));
          return;
        }

        if (res.statusCode >= 400 || parsed.error) {
          reject(new Error(parsed.error || `HTTP ${res.statusCode}`));
          return;
        }

        resolve(parsed);
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

module.exports = {
  request,
  status: () => request('/status'),
  ids: () => request('/ids'),
  last: () => request('/last'),
  refresh: () => request('/refresh', { method: 'POST' }),
  newChat: () => request('/new-chat', { method: 'POST' }),
  chat: (prompt) => request('/chat', { method: 'POST', body: { prompt } }),
  openUrl: (url) => request('/open-url', { method: 'POST', body: { url } }),
  openChat: (input) => request('/open-chat', { method: 'POST', body: input }),
  chats: () => request('/chats'),
  projects: () => request('/projects'),
  openProject: (input) => request('/open-project', { method: 'POST', body: input }),
  projectChats: (input) => request('/project-chats', {
    method: input ? 'POST' : 'GET',
    body: input
  }),
  openProjectChat: (input) => request('/open-project-chat', { method: 'POST', body: input }),
  newProjectChat: (input = {}) => request('/new-project-chat', { method: 'POST', body: input })
};
