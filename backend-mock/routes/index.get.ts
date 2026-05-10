import { defineEventHandler, setHeader } from 'h3'

const endpoints: { method: string; path: string; note?: string }[] = [
  { method: 'POST', path: '/api/auth/login', note: 'body: userName, password' },
  { method: 'GET', path: '/api/user/info' },
  { method: 'GET', path: '/api/user/list', note: 'query: current, size, 筛选字段见 mock' },
  { method: 'GET', path: '/api/role/list', note: 'query: current, size, …' },
  { method: 'GET', path: '/api/system/menus' }
]

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/html; charset=utf-8')

  const rows = endpoints
    .map(
      (e) => `
    <tr>
      <td><code>${e.method}</code></td>
      <td><code>${e.path}</code></td>
      <td>${e.note ?? '—'}</td>
    </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>backend-mock</title>
  <style>
    :root { color-scheme: light dark; --bg: #0f1419; --card: #1a2332; --text: #e7ecf3; --muted: #8b9cb3; --accent: #3b82f6; }
    @media (prefers-color-scheme: light) {
      :root { --bg: #f4f6f9; --card: #fff; --text: #1c2434; --muted: #5c6b82; }
    }
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; min-height: 100vh; background: var(--bg); color: var(--text); line-height: 1.5; }
    main { max-width: 52rem; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
    h1 { font-size: 1.35rem; font-weight: 600; margin: 0 0 0.25rem; }
    p.sub { color: var(--muted); margin: 0 0 1.5rem; font-size: 0.9rem; }
    .card { background: var(--card); border-radius: 10px; padding: 1rem 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(127,127,127,.15); }
    th { color: var(--muted); font-weight: 500; font-size: 0.75rem; text-transform: uppercase; letter-spacing: .04em; }
    tr:last-child td { border-bottom: none; }
    code { font-family: ui-monospace, monospace; font-size: 0.84em; }
    .hint { margin-top: 1.25rem; padding: 0.75rem 1rem; border-radius: 8px; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.25); font-size: 0.85rem; }
    .hint strong { color: var(--accent); }
  </style>
</head>
<body>
  <main>
    <h1>art-design-backend-mock</h1>
    <p class="sub">Nitro 本地模拟接口 · 默认端口 <code>3333</code>（<code>pnpm mock:server</code>）</p>
    <div class="card">
      <table>
        <thead>
          <tr><th>方法</th><th>路径</th><th>说明</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="hint">前端联调：在 <code>.env.development</code> 中设置 <strong>VITE_USE_MOCK=false</strong>，并将 <strong>VITE_API_PROXY_URL</strong> 指向本服务地址（例如 <code>http://127.0.0.1:3333</code>）。</p>
  </main>
</body>
</html>`
})
