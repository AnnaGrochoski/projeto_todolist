import { useEffect, useRef, useState } from 'react';

export default function TaskModal({ task, onClose, onSubmit }) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const isEdit = Boolean(task);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError('O nome da tarefa é obrigatório.');
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), dueDate: dueDate || null });
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit} role="dialog" aria-modal="true">
        <header>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">←</button>
          <h2>{isEdit ? 'Edit task' : 'Create new task'}</h2>
        </header>

        <label>
          Name
          <input ref={inputRef} value={title} maxLength={255} placeholder="Name"
            onChange={(e) => { setTitle(e.target.value); setError(''); }} />
        </label>
        <label>
          Due date (optional)
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="primary" disabled={saving}>
          {isEdit ? 'Edit Task' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}
