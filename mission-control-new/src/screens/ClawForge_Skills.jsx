import { useState } from 'react'

const DEFAULT = [
  { id: 's1', name: 'healthcheck', owner: 'Yuki', status: 'ready', notes: 'Host hardening + risk posture checks' },
  { id: 's2', name: 'weather', owner: 'Carlos', status: 'ready', notes: 'Weather + forecast utility' },
  { id: 's3', name: 'session-logs', owner: 'Rachel', status: 'draft', notes: 'Conversation/session analytics' },
]

export default function ClawForgeSkills() {
  const [skills, setSkills] = useState(DEFAULT)
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('Marcus')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c10', color: '#e8eaed', padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Skills Management (v1)</h2>
      <p style={{ color: '#94a3b8' }}>Priority #2 foundation: register skills, assign owners, track readiness.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Skill name' style={inputStyle} />
        <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder='Owner' style={inputStyle} />
        <button
          onClick={() => {
            if (!name.trim()) return
            setSkills((prev) => [{ id: `s-${Date.now()}`, name: name.trim(), owner, status: 'draft', notes: '' }, ...prev])
            setName('')
          }}
          style={btnStyle}
        >Add Skill</button>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {skills.map((s) => (
          <div key={s.id} style={{ background: '#12151b', border: '1px solid #252a34', borderRadius: 10, padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{s.name}</strong>
              <select
                value={s.status}
                onChange={(e) => setSkills((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: e.target.value } : x)))}
                style={inputStyle}
              >
                <option value='draft'>draft</option>
                <option value='ready'>ready</option>
                <option value='blocked'>blocked</option>
              </select>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Owner: {s.owner}</div>
            <textarea
              value={s.notes}
              onChange={(e) => setSkills((prev) => prev.map((x) => (x.id === s.id ? { ...x, notes: e.target.value } : x)))}
              placeholder='Notes / scope / integration details'
              style={{ ...inputStyle, width: '100%', minHeight: 64, marginTop: 8 }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle = {
  background: '#12151b',
  border: '1px solid #252a34',
  color: '#e8eaed',
  borderRadius: 8,
  padding: '8px 10px',
}

const btnStyle = {
  background: '#f97316',
  color: '#111827',
  border: 'none',
  borderRadius: 8,
  padding: '8px 10px',
  fontWeight: 700,
  cursor: 'pointer',
}
