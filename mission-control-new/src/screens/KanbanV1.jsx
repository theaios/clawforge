import { useMemo, useState } from 'react'

const COLUMNS = [
  { key: 'backlog', name: 'Backlog', wip: 999 },
  { key: 'todo', name: 'Ready', wip: 6 },
  { key: 'inprogress', name: 'In Progress', wip: 5 },
  { key: 'review', name: 'Review', wip: 4 },
  { key: 'done', name: 'Done', wip: 999 }
]

const priorities = ['P0', 'P1', 'P2', 'P3']

function emptyTask() {
  return { title: '', description: '', status: 'backlog', priority: 'P2', agentId: '', dueDate: '' }
}

export default function KanbanV1({ api, theme }) {
  const [draft, setDraft] = useState(emptyTask())
  const [editingId, setEditingId] = useState('')
  const [dragId, setDragId] = useState('')

  const byCol = useMemo(() => COLUMNS.reduce((acc, c) => {
    acc[c.key] = api.tasks.filter((t) => t.status === c.key)
    return acc
  }, {}), [api.tasks])

  const submit = (e) => {
    e.preventDefault()
    if (!draft.title.trim()) return
    if (editingId) api.updateTask(editingId, draft)
    else api.createTask(draft)
    setDraft(emptyTask())
    setEditingId('')
  }

  return (
    <div>
      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 14, marginBottom: 14 }}>
        <form onSubmit={submit} style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 14 }}>{editingId ? 'Edit Task' : 'New Task'}</h3>
          <input placeholder='Title' value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} style={inputStyle(theme)} />
          <textarea placeholder='Description' value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} style={{ ...inputStyle(theme), minHeight: 60 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} style={inputStyle(theme)}>
              {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
            </select>
            <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} style={inputStyle(theme)}>
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <select value={draft.agentId} onChange={(e) => setDraft({ ...draft, agentId: e.target.value })} style={inputStyle(theme)}>
              <option value=''>Unassigned</option>
              {api.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input type='date' value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} style={inputStyle(theme)} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type='submit' style={btn(theme, 'primary')}>{editingId ? 'Save Task' : 'Create Task'}</button>
            {editingId && <button type='button' onClick={() => { setEditingId(''); setDraft(emptyTask()) }} style={btn(theme)}>Cancel</button>}
          </div>
        </form>

        <div style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 14 }}>Status Counters / WIP</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {COLUMNS.map((c) => {
              const count = byCol[c.key]?.length || 0
              const warn = c.wip < 100 && count >= c.wip
              return (
                <div key={c.key} style={{ minWidth: 120, border: `1px solid ${warn ? theme.red : theme.border}`, borderRadius: 10, padding: 10, background: theme.panel2 }}>
                  <div style={{ fontSize: 12 }}>{c.name}</div>
                  <div style={{ fontWeight: 700, fontSize: 20 }}>{count}</div>
                  <div style={{ fontSize: 11, color: warn ? theme.red : theme.textMuted }}>WIP {c.wip > 99 ? '—' : c.wip}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(200px, 1fr))', gap: 10, alignItems: 'start' }}>
        {COLUMNS.map((c) => (
          <div key={c.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dragId && api.updateTask(dragId, { status: c.key })}
            style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 10, minHeight: 380 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{c.name}</div>
            {(byCol[c.key] || []).map((t) => {
              const agent = api.agents.find((a) => a.id === t.agentId)
              return (
                <article key={t.id} draggable onDragStart={() => setDragId(t.id)} style={{ background: theme.panel2, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                    <strong style={{ fontSize: 13 }}>{t.title}</strong>
                    <span style={{ fontSize: 11, color: theme.textMuted }}>{t.priority}</span>
                  </div>
                  <div style={{ fontSize: 12, color: theme.textMuted, margin: '6px 0' }}>{t.description || 'No description'}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>{agent ? `👤 ${agent.name}` : '👤 Unassigned'} {t.dueDate ? `• 📅 ${t.dueDate}` : ''}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={() => { setEditingId(t.id); setDraft({ ...t }) }} style={btn(theme)}>Edit</button>
                    <button onClick={() => api.deleteTask(t.id)} style={btn(theme, 'danger')}>Delete</button>
                  </div>
                </article>
              )
            })}
          </div>
        ))}
      </section>
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
