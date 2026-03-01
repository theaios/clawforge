import { useEffect, useMemo, useState } from 'react'
import { readRunHistory } from '../lib/missionData'

const td = { padding: 10, borderBottom: '1px solid #252a34' }

const statusColor = {
  Success: '#22c55e',
  Running: '#3b82f6',
  Approval: '#f59e0b',
  Blocked: '#ef4444',
  Queued: '#9ca3af',
  Review: '#8b5cf6',
}

export default function RunHistory() {
  const [runs, setRuns] = useState(() => readRunHistory([]))

  useEffect(() => {
    const sync = () => setRuns(readRunHistory([]))
    window.addEventListener('mission-run-history-updated', sync)
    window.addEventListener('mission-data-updated', sync)
    return () => {
      window.removeEventListener('mission-run-history-updated', sync)
      window.removeEventListener('mission-data-updated', sync)
    }
  }, [])

  const recent = useMemo(() => runs.slice(0, 100), [runs])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c10', color: '#e8eaed', padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Run History</h2>
      <div style={{ marginBottom: 10, color: '#9ca3af', fontSize: 13 }}>Auto-synced from board execution state + approval decisions.</div>
      <div style={{ border: '1px solid #252a34', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#12151b' }}>
            <tr>
              {['Time', 'Agent', 'Action', 'Status', 'Cost'].map((h) => <th key={h} style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #252a34' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.time}</td>
                <td style={td}>{r.agent}</td>
                <td style={td}>{r.action}</td>
                <td style={td}><span style={{ color: statusColor[r.status] || '#d1d5db', fontWeight: 700 }}>{r.status}</span></td>
                <td style={td}>{r.cost || '$0.00'}</td>
              </tr>
            ))}
            {!recent.length && (
              <tr><td style={{ ...td, color: '#9ca3af' }} colSpan={5}>No run history yet. Start work from the Kanban board to generate events.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
