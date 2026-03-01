import { useEffect, useMemo, useState } from 'react';
import './App.css';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'doing', title: 'Doing' },
  { id: 'blocked', title: 'Blocked' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

const COLUMN_COLORS = {
  backlog: '#27c7cf',
  doing: '#13a9e8',
  blocked: '#8f6be8',
  review: '#f5b000',
  done: '#45c43b',
};

const COLUMN_TITLES_KEY = 'my-life-column-titles-v1';
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

const formatDue = (ms) => {
  if (!ms) return 'No update timer';
  const diff = ms - Date.now();
  if (diff <= 0) return 'Status update due now';
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `Next update in ${hrs}h ${mins}m`;
};

const parseSubtasks = (notes = '') =>
  String(notes)
    .split('\n')
    .map((line) => {
      const m = line.match(/^\s*-\s*\[([ xX])\]\s*(.*)$/);
      if (!m) return null;
      return { id: crypto.randomUUID(), done: /x/i.test(m[1]), text: m[2] || '(untitled)' };
    })
    .filter(Boolean);

const getChecklist = (task) => {
  if (Array.isArray(task?.checklist) && task.checklist.length) return task.checklist;
  return parseSubtasks(task?.notes || '');
};

const subtaskStats = (task) => {
  const subtasks = getChecklist(task);
  return { total: subtasks.length, done: subtasks.filter((s) => s.done).length };
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const [columnTitles, setColumnTitles] = useState(() => {
    try {
      const raw = localStorage.getItem(COLUMN_TITLES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [owner, setOwner] = useState('Both');
  const [nextMilestone, setNextMilestone] = useState('');
  const [sensitiveAction, setSensitiveAction] = useState(false);
  const [executionPlan, setExecutionPlan] = useState('');
  const [priority, setPriority] = useState('Medium');

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editOwner, setEditOwner] = useState('Both');
  const [editMilestone, setEditMilestone] = useState('');
  const [editSensitive, setEditSensitive] = useState(false);
  const [editPlan, setEditPlan] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');

  const [updateInputs, setUpdateInputs] = useState({});

  useEffect(() => {
    localStorage.setItem(COLUMN_TITLES_KEY, JSON.stringify(columnTitles));
  }, [columnTitles]);

  const persistTasks = async (nextTasks, rollbackTasks = tasks) => {
    setTasks(nextTasks);
    const res = await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextTasks),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ errors: ['Failed to save board changes.'] }));
      setTasks(rollbackTasks);
      alert((err.errors || ['Failed to save board changes.']).join('\n'));
      return false;
    }

    return true;
  };

  useEffect(() => {
    fetch('/api/tasks')
      .then((r) => r.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch(() => setTasks([]));
  }, []);

  const visibleTasks = useMemo(
    () =>
      tasks.filter((t) => {
        const q = query.trim().toLowerCase();
        const text = `${t.title || ''} ${t.notes || ''} ${t.nextMilestone || ''}`.toLowerCase();
        const byQuery = !q || text.includes(q);
        const byOwner = ownerFilter === 'All' || t.owner === ownerFilter;
        return byQuery && byOwner;
      }),
    [tasks, query, ownerFilter]
  );

  const counts = useMemo(
    () =>
      COLUMNS.reduce((acc, col) => {
        acc[col.id] = visibleTasks.filter((t) => t.status === col.id).length;
        return acc;
      }, {}),
    [visibleTasks]
  );

  const focusedTask = useMemo(
    () => tasks.find((t) => t.id === focusedTaskId) || null,
    [tasks, focusedTaskId]
  );

  const renameColumn = (id, current) => {
    const next = prompt(`Rename column "${current}"`, current);
    if (!next || !next.trim()) return;
    setColumnTitles((prev) => ({ ...prev, [id]: next.trim() }));
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      notes: notes.trim(),
      owner,
      nextMilestone: nextMilestone.trim(),
      sensitiveAction,
      executionPlan: executionPlan.trim(),
      priority,
      status: 'backlog',
      createdAt: Date.now(),
      updates: [],
    };

    const next = [newTask, ...tasks];
    const ok = await persistTasks(next, tasks);
    if (!ok) return;

    setTitle('');
    setNotes('');
    setOwner('Both');
    setNextMilestone('');
    setSensitiveAction(false);
    setExecutionPlan('');
    setPriority('Medium');
  };

  const moveTask = async (taskId, newStatus) => {
    const next = tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task));
    await persistTasks(next, tasks);
  };

  const removeTask = async (taskId) => {
    const next = tasks.filter((task) => task.id !== taskId);
    const ok = await persistTasks(next, tasks);
    if (!ok) return;
    if (editingTaskId === taskId) setEditingTaskId(null);
    if (focusedTaskId === taskId) setFocusedTaskId(null);
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditNotes(task.notes || '');
    setEditOwner(task.owner || 'Both');
    setEditMilestone(task.nextMilestone || '');
    setEditSensitive(Boolean(task.sensitiveAction));
    setEditPlan(task.executionPlan || '');
    setEditPriority(task.priority || 'Medium');
  };

  const saveEdit = async (taskId) => {
    if (!editTitle.trim()) return;
    const next = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            title: editTitle.trim(),
            notes: editNotes.trim(),
            owner: editOwner,
            nextMilestone: editMilestone.trim(),
            sensitiveAction: editSensitive,
            executionPlan: editPlan.trim(),
            priority: editPriority,
          }
        : task
    );
    const ok = await persistTasks(next, tasks);
    if (!ok) return;
    setEditingTaskId(null);
  };

  const addUpdate = async (taskId) => {
    const text = (updateInputs[taskId]?.text || '').trim();
    const author = updateInputs[taskId]?.author || 'TheAIos';
    if (!text) return;

    const next = tasks.map((task) => {
      if (task.id !== taskId) return task;
      const updates = Array.isArray(task.updates) ? task.updates : [];
      const entry = { id: crypto.randomUUID(), text, author, createdAt: Date.now() };
      return {
        ...task,
        updates: [entry, ...updates],
        nextUpdateDueAt: task.status === 'doing' ? Date.now() + FOUR_HOURS_MS : task.nextUpdateDueAt,
      };
    });

    const ok = await persistTasks(next, tasks);
    if (!ok) return;

    setUpdateInputs((prev) => ({ ...prev, [taskId]: { text: '', author } }));
  };

  const toggleChecklistItem = async (taskId, itemId) => {
    const next = tasks.map((task) => {
      if (task.id !== taskId) return task;
      const checklist = getChecklist(task).map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      );
      return { ...task, checklist };
    });
    await persistTasks(next, tasks);
  };

  const addChecklistItem = async (taskId) => {
    const text = newChecklistItem.trim();
    if (!text) return;
    const next = tasks.map((task) => {
      if (task.id !== taskId) return task;
      const checklist = [{ id: crypto.randomUUID(), text, done: false }, ...getChecklist(task)];
      return { ...task, checklist };
    });
    const ok = await persistTasks(next, tasks);
    if (!ok) return;
    setNewChecklistItem('');
  };

  const addAttachment = async (taskId) => {
    const url = attachmentUrl.trim();
    if (!url) return;
    const next = tasks.map((task) => {
      if (task.id !== taskId) return task;
      const attachments = Array.isArray(task.attachments) ? task.attachments : [];
      const entry = {
        id: crypto.randomUUID(),
        name: attachmentName.trim() || 'Attachment',
        url,
        createdAt: Date.now(),
      };
      return { ...task, attachments: [entry, ...attachments] };
    });
    const ok = await persistTasks(next, tasks);
    if (!ok) return;
    setAttachmentName('');
    setAttachmentUrl('');
  };

  return (
    <div className="layout-shell">
      <aside className="left-nav">
        <div className="nav-logo">M</div>
        <div className="nav-item active">Projects</div>
        <div className="nav-item">Tasks</div>
        <div className="nav-item">Reports</div>
      </aside>

      <div className="app-shell">
        <header className="topbar topbar-lite">
          <h1>Task Manager</h1>
          <p>Kanban workspace</p>
        </header>

        <section className="toolbar-card">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks..." />
          <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
            <option>All</option><option>Both</option><option>Joseph</option><option>TheAIos</option>
          </select>
        </section>

        <section className="composer-card">
          <form onSubmit={addTask} className="composer-form">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task..." />
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details / subtasks" />
            <select value={owner} onChange={(e) => setOwner(e.target.value)}><option>Both</option><option>Joseph</option><option>TheAIos</option></select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select>
            <input value={nextMilestone} onChange={(e) => setNextMilestone(e.target.value)} placeholder="Next milestone" />
            <label className="check-row"><input type="checkbox" checked={sensitiveAction} onChange={(e) => setSensitiveAction(e.target.checked)} /> Sensitive</label>
            <input value={executionPlan} onChange={(e) => setExecutionPlan(e.target.value)} placeholder="Plan-before-execute notes" />
            <button type="submit">Add</button>
          </form>
        </section>

        <main className="board">
          {COLUMNS.map((column) => {
            const displayTitle = columnTitles[column.id] || column.title;
            return (
              <section
                key={column.id}
                className="column"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const taskId = e.dataTransfer.getData('text/plain');
                  if (taskId) moveTask(taskId, column.id);
                }}
              >
                <div className="column-head" style={{ background: COLUMN_COLORS[column.id] }}>
                  <h2>{displayTitle}</h2>
                  <div className="head-actions">
                    <button className="rename-btn" onClick={() => renameColumn(column.id, displayTitle)}>✎</button>
                    <span>{counts[column.id] || 0}</span>
                  </div>
                </div>

                <div className="column-body">
                  {visibleTasks
                    .filter((task) => task.status === column.id)
                    .map((task) => {
                      const isEditing = editingTaskId === task.id;
                      const updates = Array.isArray(task.updates) ? task.updates : [];
                      const stats = subtaskStats(task);

                      return (
                        <article
                          key={task.id}
                          className="task"
                          style={{ backgroundColor: `${COLUMN_COLORS[task.status] || '#d1d5db'}33` }}
                          draggable={!isEditing}
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
                        >
                          {isEditing ? (
                            <div className="task-edit">
                              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                              <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                              <select value={editOwner} onChange={(e) => setEditOwner(e.target.value)}><option>Both</option><option>Joseph</option><option>TheAIos</option></select>
                              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select>
                              <input value={editMilestone} onChange={(e) => setEditMilestone(e.target.value)} placeholder="Next milestone" />
                              <label className="check-row"><input type="checkbox" checked={editSensitive} onChange={(e) => setEditSensitive(e.target.checked)} /> Sensitive</label>
                              <input value={editPlan} onChange={(e) => setEditPlan(e.target.value)} placeholder="Plan-before-execute notes" />
                              <div className="task-actions"><button className="action-btn save" onClick={() => saveEdit(task.id)}>Save</button><button className="action-btn" onClick={() => setEditingTaskId(null)}>Cancel</button></div>
                            </div>
                          ) : (
                            <>
                              <div className="task-title">{task.title}</div>
                              <div className="chip-row"><span className="chip">{task.priority || 'Medium'}</span><span className="chip">{task.owner || 'Unassigned'}</span></div>
                              {task.notes ? <p>{task.notes}</p> : null}
                              {stats.total > 0 ? <div className="milestone">Subtasks: {stats.done}/{stats.total}</div> : null}
                              {task.nextMilestone ? <div className="milestone">Next: {task.nextMilestone}</div> : null}
                              {task.sensitiveAction ? <div className="sensitive-pill">Sensitive: plan required</div> : null}
                              {task.status === 'doing' && task.owner === 'TheAIos' ? <div className={`due-pill ${task.nextUpdateDueAt && task.nextUpdateDueAt <= Date.now() ? 'due-now' : ''}`}>{formatDue(task.nextUpdateDueAt)}</div> : null}

                              <details className="updates-panel">
                                <summary>Comments / Status ({updates.length})</summary>
                                <div className="updates-body">
                                  <div className="update-input-row">
                                    <input placeholder="Add status or comment..." value={updateInputs[task.id]?.text || ''} onChange={(e) => setUpdateInputs((prev) => ({ ...prev, [task.id]: { text: e.target.value, author: prev[task.id]?.author || 'TheAIos' } }))} />
                                    <select value={updateInputs[task.id]?.author || 'TheAIos'} onChange={(e) => setUpdateInputs((prev) => ({ ...prev, [task.id]: { text: prev[task.id]?.text || '', author: e.target.value } }))}><option>TheAIos</option><option>Joseph</option><option>Both</option></select>
                                    <button className="action-btn" onClick={() => addUpdate(task.id)}>Post</button>
                                  </div>
                                  {updates.length === 0 ? <div className="empty-updates">No updates yet.</div> : <ul className="updates-list">{updates.map((u) => <li key={u.id}><div className="update-meta"><strong>{u.author}</strong> · {new Date(u.createdAt).toLocaleString()}</div><div>{u.text}</div></li>)}</ul>}
                                </div>
                              </details>

                              <div className="task-footer">
                                <div className="task-actions">
                                  <button className="action-btn" onClick={() => setFocusedTaskId(task.id)}>Open</button>
                                  <button className="action-btn" onClick={() => startEditing(task)}>Edit</button>
                                  <button className="action-btn delete" onClick={() => removeTask(task.id)}>Delete</button>
                                </div>
                              </div>
                            </>
                          )}
                        </article>
                      );
                    })}
                </div>
              </section>
            );
          })}
        </main>
      </div>

      {focusedTask && (
        <div className="task-modal-backdrop" onClick={() => setFocusedTaskId(null)}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{focusedTask.title}</h3>
            <p><strong>Owner:</strong> {focusedTask.owner || 'Unassigned'}</p>
            <p><strong>Status:</strong> {focusedTask.status}</p>
            {focusedTask.nextMilestone ? <p><strong>Next milestone:</strong> {focusedTask.nextMilestone}</p> : null}

            <h4>Checklist</h4>
            {getChecklist(focusedTask).length === 0 ? (
              <p>No checklist items yet.</p>
            ) : (
              <ul className="subtask-list">
                {getChecklist(focusedTask).map((s) => (
                  <li key={s.id} className={s.done ? 'done' : ''}>
                    <label>
                      <input
                        type="checkbox"
                        checked={!!s.done}
                        onChange={() => toggleChecklistItem(focusedTask.id, s.id)}
                      />{' '}
                      {s.text}
                    </label>
                  </li>
                ))}
              </ul>
            )}

            <div className="modal-row">
              <input
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Add checklist item"
              />
              <button className="action-btn" onClick={() => addChecklistItem(focusedTask.id)}>+ Add</button>
            </div>

            <h4>Attachments</h4>
            <div className="modal-row attach-row">
              <input value={attachmentName} onChange={(e) => setAttachmentName(e.target.value)} placeholder="Attachment name (optional)" />
              <input value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} placeholder="https://..." />
              <button className="action-btn" onClick={() => addAttachment(focusedTask.id)}>+ Attach</button>
            </div>
            <ul className="attach-list">
              {(focusedTask.attachments || []).map((a) => (
                <li key={a.id}><a href={a.url} target="_blank" rel="noreferrer">{a.name}</a></li>
              ))}
            </ul>

            <button className="action-btn" onClick={() => setFocusedTaskId(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
