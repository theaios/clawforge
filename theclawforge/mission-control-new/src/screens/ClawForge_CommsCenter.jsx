import { useEffect, useMemo, useState } from 'react'

const COMMS_EVENT = 'mc:comms-push'

const channels = [
  { id: 'telegram', name: 'Telegram' },
  { id: 'slack', name: 'Slack' },
  { id: 'email', name: 'Email' },
]

const seed = {
  telegram: [
    { id: 1, from: 'Joseph', side: 'right', text: 'Ship clickable menu first.' },
    { id: 2, from: 'Ops CEO', side: 'left', text: 'Done. Moving to screen-by-screen wiring.' },
  ],
  slack: [{ id: 1, from: 'System', side: 'left', text: 'No new events.' }],
  email: [{ id: 1, from: 'QA', side: 'left', text: 'QA report uploaded.' }],
}

export default function CommsCenter() {
  const [active, setActive] = useState('telegram')
  const [messages, setMessages] = useState(seed)
  const [unread, setUnread] = useState({ telegram: 2, slack: 0, email: 1 })
  const [draft, setDraft] = useState('')

  useEffect(() => {
    const onPush = (event) => {
      const payload = event.detail || {}
      const channel = payload.channel || 'telegram'
      setMessages((s) => ({
        ...s,
        [channel]: [...(s[channel] || []), { id: Date.now(), from: payload.from || 'System', side: 'left', text: payload.text || 'New event' }],
      }))
      if (channel !== active) {
        setUnread((u) => ({ ...u, [channel]: (u[channel] || 0) + 1 }))
      }
    }
    window.addEventListener(COMMS_EVENT, onPush)
    return () => window.removeEventListener(COMMS_EVENT, onPush)
  }, [active])

  const activeLabel = useMemo(() => channels.find((x) => x.id === active)?.name, [active])

  const send = () => {
    if (!draft.trim()) return
    setMessages((s) => ({
      ...s,
      [active]: [...s[active], { id: Date.now(), from: 'Joseph', side: 'right', text: draft.trim() }],
    }))
    setDraft('')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', background: '#0a0c10', color: '#e8eaed', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ borderRight: '1px solid #252a34', background: '#12151b', padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Comms Center</h3>
        {channels.map((c) => (
          <button key={c.id} onClick={() => { setActive(c.id); setUnread((u) => ({ ...u, [c.id]: 0 })) }} style={{ width: '100%', textAlign: 'left', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid #2a303d', background: active === c.id ? '#ff6a1a' : '#171c25', color: active === c.id ? '#111' : '#d9dce3' }}>
            {c.name} {unread[c.id] ? `(${unread[c.id]})` : ''}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 12, borderBottom: '1px solid #252a34' }}><b>{activeLabel}</b></div>
        <div style={{ flex: 1, padding: 12, display: 'grid', gap: 8 }}>
          {messages[active].map((m) => (
            <div key={m.id} style={{ justifySelf: m.side === 'right' ? 'end' : 'start', maxWidth: '70%', background: m.side === 'right' ? '#2563eb' : '#1a1e26', color: '#fff', padding: '8px 10px', borderRadius: 10, border: '1px solid #2e3440' }}>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{m.from}</div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #252a34', padding: 12, display: 'flex', gap: 8 }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder='Type message...' style={{ flex: 1, background: '#12151b', color: '#e8eaed', border: '1px solid #252a34', borderRadius: 8, padding: '8px 10px' }} />
          <button onClick={send} style={{ background: '#ff6a1a', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 700 }}>Send</button>
        </div>
      </div>
    </div>
  )
}
