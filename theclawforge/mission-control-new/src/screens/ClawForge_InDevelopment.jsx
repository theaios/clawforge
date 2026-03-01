const links = [
  { path: '#/overview', label: 'Overview' },
  { path: '#/timeline', label: 'Timeline' },
  { path: '#/comms', label: 'Comms Center' },
  { path: '#/approvals', label: 'Approvals & Blockers' },
  { path: '#/crm', label: 'CRM & Sales' },
  { path: '#/marketing', label: 'Marketing Cmd' },
  { path: '#/finance', label: 'Finance' },
  { path: '#/security', label: 'Security' },
  { path: '#/integrations', label: 'Integrations' },
  { path: '#/runs', label: 'Run History' },
  { path: '#/costs', label: 'Cost & Usage' },
  { path: '#/settings', label: 'Settings' },
  { path: '#/web', label: 'Web & Delivery' },
  { path: '#/templates', label: 'Templates' },
  { path: '#/agent-files', label: 'Agent Files' },
  { path: '#/modals', label: 'Key Modals' },
  { path: '#/empty', label: 'Empty States' },
]

export default function InDevelopment() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0c10', color: '#e8eaed', padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Under Development</h2>
      <p style={{ color: '#9ca3af', marginTop: 0 }}>Internal pages moved here so the main menu stays clean.</p>
      <div style={{ display: 'grid', gap: 8, maxWidth: 460 }}>
        {links.map((l) => (
          <a
            key={l.path}
            href={l.path}
            style={{
              textDecoration: 'none',
              background: '#12151b',
              border: '1px solid #2a303d',
              borderRadius: 10,
              padding: '10px 12px',
              color: '#d9dce3',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  )
}
