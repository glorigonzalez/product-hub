import { useState } from 'react';

function ClientInput({ value, onChange, clients, id = 'fb-clients-list' }) {
  return (
    <>
      <input
        type="text"
        list={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Cliente (opcional)..."
        style={{ flex: '0 0 160px', minWidth: 130 }}
      />
      <datalist id={id}>
        {clients.map(c => <option key={c} value={c} />)}
      </datalist>
    </>
  );
}

export default function FeedbackView({ feedbackItems, projects, clients, actions, showToast }) {
  const [newText,    setNewText]    = useState('');
  const [newSource,  setNewSource]  = useState('Slack');
  const [newProjId,  setNewProjId]  = useState('');
  const [newClient,  setNewClient]  = useState('');
  const [filterProj, setFilterProj] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const rootProjects = projects.filter(p => !p.parentId);

  const visible = feedbackItems.filter(f => {
    if (filterProj   && String(f.projectId) !== filterProj)   return false;
    if (filterClient && f.client !== filterClient)             return false;
    return true;
  });

  const handleAdd = () => {
    if (!newText.trim()) return;
    const client = newClient.trim() || null;
    if (client) actions.addClient(client);
    actions.addFeedbackItem(newText.trim(), newProjId ? Number(newProjId) : null, newSource, client);
    setNewText('');
    setNewProjId('');
    setNewClient('');
    showToast('Feedback añadido', '💬');
  };

  return (
    <div style={{ padding: '0 24px 32px' }}>
      {/* Add form */}
      <div className="feedback-add-box">
        <textarea
          placeholder="Pega aquí el mensaje de Slack, email o feedback..."
          value={newText}
          onChange={e => setNewText(e.target.value)}
          rows={3}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
          <select value={newSource} onChange={e => setNewSource(e.target.value)} style={{ flex: '0 0 120px' }}>
            <option>Slack</option>
            <option>Email</option>
            <option>Reunión</option>
            <option>Manual</option>
          </select>
          <ClientInput value={newClient} onChange={setNewClient} clients={clients} id="fb-clients-add" />
          <select
            value={newProjId}
            onChange={e => setNewProjId(e.target.value)}
            style={{ flex: 1, minWidth: 160 }}
          >
            <option value="">Sin asignar a proyecto</option>
            {rootProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleAdd}>Añadir</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ margin: '16px 0 12px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Filtrar:</span>
        <select value={filterProj} onChange={e => setFilterProj(e.target.value)} style={{ fontSize: 13 }}>
          <option value="">Todos los proyectos</option>
          {rootProjects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {clients.length > 0 && (
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={{ fontSize: 13 }}>
            <option value="">Todos los clientes</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* List */}
      {visible.length === 0
        ? <div className="empty-state">No hay feedback todavía. Agrega el primero arriba.</div>
        : visible.map(f => {
            const proj = f.projectId ? projects.find(p => p.id === f.projectId) : null;
            return (
              <div key={f.id} className={`feedback-item${f.done ? ' done' : ''}`}>
                <input
                  type="checkbox"
                  checked={f.done}
                  onChange={() => actions.toggleFeedbackDone(f.id)}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.5 }}>{f.text}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge badge-gray">{f.source}</span>
                    {f.client && (
                      <span className="badge badge-client">👤 {f.client}</span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{f.date}</span>
                    {proj && <span className="feedback-proj">{proj.name}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <select
                    style={{ fontSize: 12, maxWidth: 160 }}
                    value={f.projectId ?? ''}
                    onChange={e => {
                      actions.assignFeedback(f.id, e.target.value ? Number(e.target.value) : null);
                      showToast('Feedback asignado', '📌');
                    }}
                  >
                    <option value="">Sin asignar</option>
                    {rootProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <button
                    className="btn"
                    style={{ color: '#ef4444', padding: '4px 8px', fontSize: 12 }}
                    onClick={() => {
                      actions.deleteFeedbackItem(f.id);
                      showToast('Feedback eliminado', '🗑️');
                    }}
                  >✕</button>
                </div>
              </div>
            );
          })
      }
    </div>
  );
}
