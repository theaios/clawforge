export default function SkillsPage({ api, theme }) {
  const skillMap = {}
  for (const agent of api.agents) {
    for (const skill of agent.skills || []) {
      if (!skillMap[skill]) skillMap[skill] = []
      skillMap[skill].push(agent.name)
    }
  }

  const skills = Object.entries(skillMap).sort((a, b) => a[0].localeCompare(b[0]))

  return (
    <div style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Skills Registry</h3>
      <p style={{ marginTop: 0, color: theme.textMuted, fontSize: 13 }}>Route-level page for browsing capability coverage across your Org Chart.</p>
      {!skills.length && <div style={{ color: theme.textMuted }}>No skills yet. Add skills on Org Chart page.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 10 }}>
        {skills.map(([skill, owners]) => (
          <article key={skill} style={{ background: theme.panel2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 10 }}>
            <strong>{skill}</strong>
            <div style={{ marginTop: 6, fontSize: 12, color: theme.textMuted }}>Agents: {owners.join(', ')}</div>
          </article>
        ))}
      </div>
    </div>
  )
}
