# Nyantra — DBT Portal for Social Justice (Enhanced README)

<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
  <img src="/Logo-Light.png" alt="Nyantra" width="64" height="64" style="border-radius:8px;object-fit:cover;background:#fff;padding:6px"/>
  <div>
    <h1 style="margin:0">Nyantra</h1>
    <p style="margin:4px 0 0;color:#6b7280;max-width:60ch">A demo portal built with Next.js + TypeScript — models applicant flows, disbursements, beneficiaries and a feedback/grievance system. Built to be fully localisable (English + हिन्दी), accessible, and responsive.</p>
  </div>
</div>

---

## Live snapshot

<div style="display:flex;gap:12px;flex-wrap:wrap;margin:12px 0">
  <div style="flex:1;min-width:280px;padding:14px;border-radius:12px;background:linear-gradient(180deg,#ffffff,#f8fafc);box-shadow:0 8px 30px rgba(2,6,23,0.06)">
    <h3 style="margin:0 0 8px 0">Primary features</h3>
    <ul>
      <li>Applicant dashboard: applications, beneficiaries, disbursements, grievance & feedback.</li>
      <li>Officer dashboard: analytics, integrations and reports.</li>
      <li>Lightweight in-repo i18n (JSON) with a global Language Toggle (EN / हिंदी).</li>
      <li>Theme-aware UI, accessible controls, and compact toggle shown above logout when sidebars are collapsed.</li>
    </ul>
  </div>
  <div style="width:320px;padding:12px;border-radius:12px;background:#fff;box-shadow:0 6px 18px rgba(2,6,23,0.04)">
    <h4 style="margin:0 0 8px 0">Run locally</h4>
    <pre style="background:#0f172a;color:#fff;padding:8px;border-radius:8px;margin:0">npm install
npm run dev</pre>
    <small style="color:#6b7280">Open <code>http://localhost:3000</code></small>
  </div>
</div>

---

## Quick start table

<table>
<thead><tr><th>Command</th><th>Action</th></tr></thead>
<tbody>
<tr><td><code>npm install</code></td><td>Install dependencies</td></tr>
<tr><td><code>npm run dev</code></td><td>Start development server (open <code>/</code>)</td></tr>
<tr><td><code>npm run build</code></td><td>Create a production build</td></tr>
<tr><td><code>npm start</code></td><td>Run production server</td></tr>
<tr><td><code>npm run lint</code></td><td>ESLint checks</td></tr>
</tbody>
</table>

---

## Project layout (high level)

<table>
<thead><tr><th>Path</th><th>Description</th></tr></thead>
<tbody>
<tr><td><code>src/app/</code></td><td>Pages and layouts (Next.js App Router)</td></tr>
<tr><td><code>src/components/</code></td><td>UI components (Sidebar, UserSidebar, LanguageToggle, charts)</td></tr>
<tr><td><code>src/context/</code></td><td>Providers (Auth, Theme, Locale)</td></tr>
<tr><td><code>src/locales/</code></td><td>Translation JSONs</td></tr>
<tr><td><code>src/lib/</code></td><td>Utility wrappers (firebase init)</td></tr>
</tbody>
</table>

---

## UX & Accessibility notes

- Language toggle: visible in header and sidebars; in collapsed sidebars a compact vertical toggle sits above the logout button.
- Accessibility: aria-friendly toggles, keyboard navigable controls and visible focus states.
- Design: theme-aware CSS variables, subtle gradients and glassmorphism cards.

---

## Docker (optional)

```powershell
docker build -t nyantara:latest .
docker run -p 3000:3000 nyantara:latest
```

