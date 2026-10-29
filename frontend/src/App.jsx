import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import TaskModal from './TaskModal.jsx';

const ACCENTS = ['#f8c3a8', '#bfe3f7', '#e9bdf2'];

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const formatDate = (s) => s.split('-').reverse().join('/');

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function App() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [data, setData] = useState({ tasks: [], total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | task

  const load = useCallback(async () => {
    try {
      setData(await api.list(debouncedSearch.trim()));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const run = async (fn) => {
    try { await fn(); await load(); } catch (e) { setError(e.message); }
  };

  const toggle = (t) => run(() => api.update(t.id, { completed: !Number(t.completed) }));
  const remove = (t) => window.confirm(`Excluir "${t.title}"?`) && run(() => api.remove(t.id));
  const submit = (payload) =>
    modal === 'create'
      ? api.create(payload.title, payload.dueDate).then(load)
      : api.update(modal.id, payload).then(load);

  const { tasks, total, completed } = data;
  const pending = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const today = todayStr();

  return (
    <main className="app">
      <h1>
        {pending > 0
          ? `You have got ${pending} task${pending > 1 ? 's' : ''} left to complete ✏️`
          : 'You have no pending tasks.'}
      </h1>

      <div className="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Task Here" aria-label="Buscar tarefas" />
      </div>

      <section className="card progress">
        <h3>Daily Task</h3>
        <div className="row"><span>{completed}/{total} Task Completed</span><b>{percent}%</b></div>
        <div className="bar"><i style={{ width: `${percent}%` }} /></div>
        <small>{percent === 100 ? 'All done, great job!' : 'You are almost done go ahead'}</small>
      </section>

      <div className="section-title"><h2>Tasks</h2><span>{total} total</span></div>

      {error && <p className="error banner" role="alert">{error}</p>}

      {!loading && tasks.length === 0 && !error && (
        <p className="empty">{debouncedSearch.trim() ? 'No tasks found.' : 'You have no pending tasks.'}</p>
      )}

      <ul className="list">
        {tasks.map((t, i) => {
          const done = Boolean(Number(t.completed));
          const overdue = !done && t.due_date && t.due_date < today;
          return (
            <li key={t.id} className="task" style={{ '--accent': ACCENTS[i % ACCENTS.length] }}>
              <div className="info">
                <span className={`title ${done ? 'done' : ''} ${overdue ? 'overdue' : ''}`}>{t.title}</span>
                <span className="meta">
                  {t.due_date && <span>🗓 {formatDate(t.due_date)}</span>}
                  {overdue && <em className="badge">Em atraso</em>}
                </span>
              </div>
              <div className="actions">
                <button className="icon-btn" onClick={() => setModal(t)} aria-label="Editar">✎</button>
                <button className="icon-btn danger" onClick={() => remove(t)} aria-label="Excluir">🗑</button>
              </div>
              <button className={`check ${done ? 'on' : ''}`} onClick={() => toggle(t)}
                aria-label={done ? 'Marcar como pendente' : 'Marcar como concluída'} aria-pressed={done}>
                {done && '✓'}
              </button>
            </li>
          );
        })}
      </ul>

      <button className="fab" onClick={() => setModal('create')} aria-label="Nova tarefa">+</button>

      {modal && <TaskModal task={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSubmit={submit} />}
    </main>
  );
}
