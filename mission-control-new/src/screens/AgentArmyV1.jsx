import { useState } from 'react'

function emptyAgent() {
  return { name: '', role: '', capacity: 4, status: 'online', skills: [] }
}

export default function AgentArmyV1({ api, theme }) {
  const [draft, setDraft] = useState(emptyAgent())
  const [editingId, setEditingId] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!draft.name.trim()) return
    const payload = { ...draft, capacity: Number(draft.capacity) || 0 }
    if (editingId) api.updateAgent(editingId, payload)
    else api.createAgent(payload)
    setDraft(emptyAgent())
    setEditingId('')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14 }}>
      <form onSubmit={submit} style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12, height: 'fit-content' }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Agent' : 'Create Agent'}</h3>
        <input placeholder='Name' value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={inputStyle(theme)} />
        <input placeholder='Role (Marketing, Ops...)' value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} style={inputStyle(theme)} />
        <input placeholder='Skills comma-separated' value={draft.skills.join(', ')} onChange={(e) => setDraft({ ...draft, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} style={inputStyle(theme)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input type='number' min='0' value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: e.target.value })} style={inputStyle(theme)} />
          <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} style={inputStyle(theme)}>
            <option value='online'>online</option>
            <option value='idle'>idle</option>
            <option value='offline'>offline</option>
          </select>
        </div>
        <button type='submit' style={btn(theme, 'primary')}>{editingId ? 'Save Agent' : 'Add Agent'}</button>
      </form>

      <div style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Org Chart</h3>
        {api.agents.map((a) => {
          const assigned = api.tasks.filter((t) => t.agentId === a.id && t.status !== 'done').length
          const overloaded = assigned > a.capacity
          return (
            <article key={a.id} style={{ border: `1px solid ${overloaded ? theme.red : theme.border}`, borderRadius: 10, padding: 10, marginBottom: 8, background: theme.panel2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <strong>{a.name}</strong>
                  <div style={{ fontSize: 12, color: theme.textMuted }}>{a.role || 'No role'}</div>
                </div>
                <div style={{ fontSize: 12, color: a.status === 'online' ? theme.green : theme.textMuted }}>{a.status}</div>
              </div>
              <div style={{ fontSize: 12, marginTop: 5 }}>Assigned: <b>{assigned}</b> / Capacity: <b>{a.capacity}</b> {overloaded ? '⚠️' : ''}</div>
              <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>Skills: {a.skills?.length ? a.skills.join(', ') : 'None'}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button onClick={() => { setEditingId(a.id); setDraft(a) }} style={btn(theme)}>Edit</button>
                <button onClick={() => api.deleteAgent(a.id)} style={btn(theme, 'danger')}>Delete</button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function inputStyle(theme) {
  return {
    width: '100%', marginBottom: 8, background: '#0f1319', color: theme.text,
    border: `1px solid ${theme.border}`, borderRadius: 8, padding: '8px 9px', boxSizing: 'border-box'
  }
}

function btn(theme, type = 'default') {
  const styles = {
    default: { background: theme.panel2, color: theme.text },
    primary: { background: theme.orange, color: '#111' },
    danger: { background: '#3a1a1a', color: '#ff9f9f', borderColor: '#6d2c2c' }
  }
  return {
    border: `1px solid ${styles[type].borderColor || theme.border}`, borderRadius: 8, padding: '6px 9px',
    background: styles[type].background, color: styles[type].color, cursor: 'pointer', fontSize: 12
  }
}
