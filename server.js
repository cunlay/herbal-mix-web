'use strict';

/**
 * Herbal Mix web server. Uses only Node.js built-ins.
 * Serves the single-page app in public/ and a JSON API under /api.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { AILMENTS } = require('./src/ailments');
const { buildBlend, listHerbs } = require('./src/blender');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_SERVINGS = 365;

// Only these files are served. Nothing else in the project folder is reachable.
const STATIC_FILES = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/index.html': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/styles.css': { file: 'styles.css', type: 'text/css; charset=utf-8' },
  '/app.js': { file: 'app.js', type: 'text/javascript; charset=utf-8' },
};

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; " +
    "connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

function serveStatic(res, pathname) {
  const entry = STATIC_FILES[pathname];
  fs.readFile(path.join(PUBLIC_DIR, entry.file), (err, data) => {
    if (err) {
      res.writeHead(500, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server error');
      return;
    }
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': entry.type,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

/** Condition flags used by the herbs, formatted for the checkbox list. */
function conditionOptions() {
  const flags = new Set(listHerbs().flatMap((h) => h.flags));
  return [...flags]
    .sort()
    .map((id) => ({ id, label: id.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) }));
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  if (STATIC_FILES[pathname]) return serveStatic(res, pathname);

  if (pathname === '/api/ailments') {
    return sendJson(
      res,
      200,
      Object.values(AILMENTS).map(({ id, name, summary, profiles }) => ({
        id,
        name,
        summary,
        profiles: Object.entries(profiles).map(([pid, p]) => ({ id: pid, label: p.label })),
      }))
    );
  }

  if (pathname === '/api/herbs') return sendJson(res, 200, listHerbs());
  if (pathname === '/api/conditions') return sendJson(res, 200, conditionOptions());

  if (pathname === '/api/blend') {
    try {
      const servings = url.searchParams.get('servings');
      if (servings !== null && Number(servings) > MAX_SERVINGS) {
        throw new Error(`Days of supply cannot exceed ${MAX_SERVINGS}`);
      }
      const result = buildBlend(url.searchParams.get('ailment') || '', {
        profile: url.searchParams.get('profile'),
        dose: url.searchParams.get('dose'),
        servings,
        capsuleMg: url.searchParams.get('capsule'),
        conditions: url.searchParams.get('conditions'),
      });
      return sendJson(res, 200, result);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  return sendJson(res, 404, { error: 'Not found' });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Herbal Mix running at http://localhost:${PORT}`);
  });
}

module.exports = { server };
