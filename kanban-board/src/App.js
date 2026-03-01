import { useEffect, useMemo, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'command-center-kanban-v1';

const initialBoard = {
  columns: [
    {
      id: 'backlog',
      title: 'Backlog',
      cards: [
        { id: 'b1', title: 'Weekly event-driven options prep', description: 'Include catalyst, invalidation, risk/reward, and sizing note.', comments: [] },
        { id: 'b2', title: 'Build rolling Wellness Initiative action plan', description: 'Draft 30-day outreach + partnerships + events.', comments: [] },
        { id: 'b3', title: 'Solar completion tracker + blocker map', description: 'List remaining install steps with dependencies.', comments: [] },
        { id: 'b4', title: 'Prioritized 3D print queue for home + veterinary use', description: 'Rank by impact, include material + duration estimate.', comments: [] },
        { id: 'b5', title: 'Weekly family logistics snapshot', description: 'Create weekly rhythm + conflict alerts.', comments: [] },
        { id: 'b6', title: 'Safe upgrade pipeline (sandbox + rollback required)', description: 'No production change without approval.', comments: [] },
        { id: 'b7', title: 'Daily 6AM idea system validation (7-day reliability test)', description: '3 ideas/day: self-improvement, automation, money.', comments: [] },
      ],
    },
    {
      id: 'review',
      title: 'Review Needed',
      cards: [
        { id: 'r1', title: 'Review topic operating mode update', description: 'Treat every group message as direct (no tag required).', comments: [] },
        { id: 'r2', title: 'Review mobile bootstrap message and final wording', description: 'Confirm short mobile version for reuse.', comments: [] },
        { id: 'r3', title: 'Review Kanban hosting migration to Hostinger', description: 'Confirm URL + expected behavior off home network.', comments: [{ id: 'cm-r3-1', text: 'Kanban deployed to Hostinger under /kanban and accessible via HTTPS.', createdAt: '2/21/2026 4:24 PM' }] },
      ],
    },
    { id: 'todo', title: 'To Do', cards: [] },
    { id: 'inprogress', title: 'In Progress', cards: [] },
    { id: 'blocked', title: 'Blocked', cards: [] },
    {
      id: 'done',
      title: 'Done',
      cards: [
        { id: 'd1', title: 'Created 8 Telegram project topics', description: 'Trading, Wellness, Home/Solar, Builds, Family, Upgrades, Security, Command Center.', comments: [{ id: 'cm-d1-1', text: 'All 8 topics created successfully with IDs 14-21.', createdAt: '2/21/2026 4:19 PM' }] },
        { id: 'd2', title: 'Generated full operating system bootstrap message', description: 'Execution rules + topic mode + daily rhythm + status format.', comments: [{ id: 'cm-d2-1', text: 'Posted full operating rhythm draft for confirmation.', createdAt: '2/21/2026 4:21 PM' }] },
        { id: 'd3', title: 'Generated short mobile bootstrap version', description: 'Compact OS_ACTIVE variant for quick posting.', comments: [{ id: 'cm-d3-1', text: 'Mobile version delivered for quick in-topic reuse.', createdAt: '2/21/2026 4:22 PM' }] },
        { id: 'd4', title: 'Deployed Kanban to Hostinger', description: 'Published at /kanban with production build.', comments: [{ id: 'cm-d4-1', text: 'FTP upload completed; live URL confirmed.', createdAt: '2/21/2026 4:24 PM' }] },
        { id: 'd5', title: 'Fixed React starter page issue', description: 'Replaced default template with functional board UI.', comments: [{ id: 'cm-d5-1', text: 'Rebuilt and redeployed after replacing starter App content.', createdAt: '2/21/2026 4:28 PM' }] },
      ],
    },
  ],
};

const mergeWithBaseline = (currentBoard) => {
  const safeBoard = currentBoard?.columns ? currentBoard : { columns: [] };

  return {
    columns: initialBoard.columns.map((baselineColumn) => {
      const existingColumn = safeBoard.columns.find((c) => c.id === baselineColumn.id);
      const existingCards = existingColumn?.cards || [];

      const mergedCards = baselineColumn.cards.map((baselineCard) => {
        const existingCard = existingCards.find((c) => c.id === baselineCard.id);
        if (!existingCard) return baselineCard;

        return {
          ...existingCard,
          comments:
            existingCard.comments && existingCard.comments.length > 0
              ? existingCard.comments
              : baselineCard.comments || [],
        };
      });

      const customCards = existingCards.filter(
        (existingCard) => !baselineColumn.cards.some((baselineCard) => baselineCard.id === existingCard.id)
      );

      return {
        ...baselineColumn,
        cards: [...mergedCards, ...customCards],
      };
    }),
  };
};

function App() {
  const [board, setBoard] = useState(initialBoard);
  const [activeCard, setActiveCard] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBoard(mergeWithBaseline(JSON.parse(saved)));
      } catch (_) {
        setBoard(initialBoard);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  const columnMap = useMemo(() => {
    const map = {};
    board.columns.forEach((col) => {
      map[col.id] = col;
    });
    return map;
  }, [board]);

  const createCard = (columnId) => {
    const title = window.prompt('Card title');
    if (!title?.trim()) return;

    const description = window.prompt('Description (optional)') || '';

    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: [
                ...col.cards,
                {
                  id: `c${Date.now()}`,
                  title: title.trim(),
                  description: description.trim(),
                  comments: [],
                  subtasks: [],
                },
              ],
            }
          : col
      ),
    }));
  };

  const openCard = (columnId, cardId) => {
    const col = columnMap[columnId];
    const card = col.cards.find((c) => c.id === cardId);
    if (!card) return;
    setActiveCard({
      ...card,
      columnId,
      comments: card.comments || [],
      subtasks: card.subtasks || [],
    });
    setNewComment('');
    setNewSubtask('');
  };

  const saveCard = () => {
    if (!activeCard) return;

    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => {
        const cleanedCards = col.cards.filter((c) => c.id !== activeCard.id);

        if (col.id === activeCard.columnId) {
          return {
            ...col,
            cards: [
              ...cleanedCards,
              {
                id: activeCard.id,
                title: activeCard.title,
                description: activeCard.description,
                comments: activeCard.comments,
                subtasks: activeCard.subtasks || [],
              },
            ],
          };
        }

        return { ...col, cards: cleanedCards };
      }),
    }));

    setActiveCard(null);
  };

  const deleteCard = () => {
    if (!activeCard) return;

    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== activeCard.id),
      })),
    }));

    setActiveCard(null);
  };

  const addComment = () => {
    if (!newComment.trim() || !activeCard) return;
    setActiveCard((prev) => ({
      ...prev,
      comments: [
        ...prev.comments,
        {
          id: `cm${Date.now()}`,
          text: newComment.trim(),
          createdAt: new Date().toLocaleString(),
        },
      ],
    }));
    setNewComment('');
  };

  const addSubtask = () => {
    if (!newSubtask.trim() || !activeCard) return;
    setActiveCard((prev) => ({
      ...prev,
      subtasks: [
        ...(prev.subtasks || []),
        { id: `st${Date.now()}`, text: newSubtask.trim(), done: false },
      ],
    }));
    setNewSubtask('');
  };

  const toggleSubtask = (subtaskId) => {
    setActiveCard((prev) => ({
      ...prev,
      subtasks: (prev.subtasks || []).map((st) =>
        st.id === subtaskId ? { ...st, done: !st.done } : st
      ),
    }));
  };

  const deleteSubtask = (subtaskId) => {
    setActiveCard((prev) => ({
      ...prev,
      subtasks: (prev.subtasks || []).filter((st) => st.id !== subtaskId),
    }));
  };

  const syncMissingItems = () => {
    setBoard((prev) => {
      const merged = mergeWithBaseline(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <div className="App">
      <header className="topbar">
        <div className="topbar-row">
          <h1>Command Center Kanban</h1>
          <button onClick={syncMissingItems}>Sync Missing Items + Comments</button>
        </div>
        <p>Open cards to edit details, move status, and leave comments.</p>
      </header>

      <main className="board">
        {board.columns.map((column) => (
          <section key={column.id} className="column">
            <div className="column-header">
              <h2>{column.title}</h2>
              <button onClick={() => createCard(column.id)}>+ Add</button>
            </div>

            <div className="cards">
              {column.cards.length === 0 ? (
                <div className="empty">No cards</div>
              ) : (
                column.cards.map((card) => {
                  const subtasks = card.subtasks || [];
                  const doneCount = subtasks.filter((st) => st.done).length;
                  return (
                    <article
                      key={card.id}
                      className="card"
                      onClick={() => openCard(column.id, card.id)}
                    >
                      <h3>{card.title}</h3>
                      {card.description ? <p>{card.description}</p> : null}

                      {subtasks.length > 0 ? (
                        <div className="subtask-progress">
                          <div className="subtask-progress-bar">
                            <span style={{ width: `${(doneCount / subtasks.length) * 100}%` }} />
                          </div>
                          <small>{doneCount}/{subtasks.length} subtasks</small>
                        </div>
                      ) : null}

                      {card.comments.length > 0 ? (
                        <div className="comment-preview-list">
                          {card.comments.slice(-2).map((comment) => (
                            <div key={comment.id} className="comment-preview">
                              <strong>Update:</strong> {comment.text}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <small>{card.comments.length} comments</small>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        ))}
      </main>

      {activeCard && (
        <div className="modal-backdrop" onClick={() => setActiveCard(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Card</h2>

            <label>Title</label>
            <input
              value={activeCard.title}
              onChange={(e) => setActiveCard((prev) => ({ ...prev, title: e.target.value }))}
            />

            <label>Description</label>
            <textarea
              rows={3}
              value={activeCard.description}
              onChange={(e) =>
                setActiveCard((prev) => ({ ...prev, description: e.target.value }))
              }
            />

            <label>Column</label>
            <select
              value={activeCard.columnId}
              onChange={(e) =>
                setActiveCard((prev) => ({ ...prev, columnId: e.target.value }))
              }
            >
              {board.columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>

            <label>Subtasks</label>
            <div className="subtasks">
              {(activeCard.subtasks || []).length === 0 ? (
                <div className="empty">No subtasks yet</div>
              ) : (
                (activeCard.subtasks || []).map((subtask) => (
                  <div key={subtask.id} className="subtask-row">
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={subtask.done}
                        onChange={() => toggleSubtask(subtask.id)}
                      />
                      <span className={subtask.done ? 'done' : ''}>{subtask.text}</span>
                    </label>
                    <button onClick={() => deleteSubtask(subtask.id)}>✕</button>
                  </div>
                ))
              )}
            </div>

            <div className="comment-input-row">
              <input
                placeholder="Add subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
              />
              <button onClick={addSubtask}>Add</button>
            </div>

            <label>Comments</label>
            <div className="comments">
              {activeCard.comments.length === 0 ? (
                <div className="empty">No comments yet</div>
              ) : (
                activeCard.comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <p>{comment.text}</p>
                    <small>{comment.createdAt}</small>
                  </div>
                ))
              )}
            </div>

            <div className="comment-input-row">
              <input
                placeholder="Add comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={addComment}>Add</button>
            </div>

            <div className="modal-actions">
              <button className="danger" onClick={deleteCard}>
                Delete
              </button>
              <div className="spacer" />
              <button onClick={() => setActiveCard(null)}>Cancel</button>
              <button className="primary" onClick={saveCard}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
