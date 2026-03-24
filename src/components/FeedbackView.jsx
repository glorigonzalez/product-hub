import { useState } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { key: 'pendiente', label: '🟡 Pendiente' },
  { key: 'revision',  label: '🔵 En revisión' },
  { key: 'resuelto',  label: '✅ Resuelto' },
  { key: 'ahora-no',  label: '⏸ Ahora no' },
];

// ── Sub-components ────────────────────────────────────────────────────────────
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

function StatusBar({ status, onChange }) {
  return (
    <div className="fb-status-bar">
      {STATUS_OPTIONS.map(opt => (
        <button
          key={opt.key}
          className={`fb-status-btn fb-s-${opt.key}${status === opt.key ? ' active' : ''}`}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ResolutionField({ resolution, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(resolution || '');

  const handleSave = () => {
    onSave(draft.trim() || null);
    setEditing(false);
  };

  if (!editing && !resolution) {
    return (
      <div
        className="resolution-empty"
        onClick={() => { setDraft(''); setEditing(true); }}
      >
        + Explicar cómo se resuelve el dolor del cliente...
      </div>
    );
  }

  if (!editing) {
    return (
      <div className="resolution-filled">
        <span className="resolution-label">💡 Resolución:</span>
        <span className="resolution-text">{resolution}</span>
        <button
          className="btn-icon-sm"
          onClick={() => { setDraft(resolution || ''); setEditing(true); }}
        >✏️</button>
      </div>
    );
  }

  return (
    <div className="resolution-editing">
      <textarea
        className="resolution-textarea"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="¿Cómo se resuelve el dolor del cliente en este proyecto?"
        autoFocus
        rows={3}
      />
      <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>Guardar</button>
        <button className="btn btn-sm" onClick={() => setEditing(false)}>Cancelar</button>
      </div>
    </div>
  );
}

function FeedbackItemRow({ f, projects, projectOptions, actions, showToast }) {
  const [editing,   setEditing]   = useState(false);
  const [draftText, setDraftText] = useState(f.text);

  const status   = f.status || 'pendiente';
  const isDimmed = status === 'resuelto' || status === 'ahora-no';
  const proj     = f.projectId ? projects.find(p => p.id === f.projectId) : null;

  const saveText = () => {
    if (!draftText.trim()) return;
    actions.updateFeedbackItem(f.id, { text: draftText.trim() });
    setEditing(false);
    showToast('Feedback actualizado', '✏️');
  };

  return (
    <div className={`feedback-item${isDimmed ? ' done' : ''}`} style={{ display: 'block', padding: '12px 14px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {editing ? (
            <>
              <textarea
                style={{ width: '100%', fontSize: 14, borderRadius: 6, border: '1.5px solid #a78bfa', padding: '7px 10px', fontFamily: 'inherit', resize: 'vertical' }}
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                autoFocus
                rows={3}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                <button className="btn btn-primary btn-sm" onClick={saveText}>Guardar</button>
                <button className="btn btn-sm" onClick={() => { setDraftText(f.text); setEditing(false); }}>Cancelar</button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{f.text}</div>
          )}

          <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            {f.client && <span className="badge badge-client">👤 {f.client}</span>}
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{f.date}</span>
            {proj && <span className="feedback-proj">{proj.name}</span>}
          </div>

          <StatusBar
            status={status}
            onChange={s => actions.updateFeedbackItem(f.id, { status: s })}
          />

          <ResolutionField
            resolution={f.resolution || null}
            onSave={val => actions.updateFeedbackItem(f.id, { resolution: val })}
          />
        </div>

        {/* Right column: assign + edit + delete */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
          <select
            style={{ fontSize: 12, maxWidth: 160 }}
            value={f.projectId ?? ''}
            onChange={e => {
              actions.assignFeedback(f.id, e.target.value ? Number(e.target.value) : null);
              showToast('Feedback asignado', '📌');
            }}
          >
            <option value="">Sin asignar</option>
            {projectOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 4 }}>
            {!editing && (
              <button
                className="btn btn-sm"
                style={{ padding: '3px 8px' }}
                onClick={() => { setDraftText(f.text); setEditing(true); }}
                title="Editar"
              >✏️</button>
            )}
            <button
              className="btn btn-sm"
              style={{ color: '#ef4444', padding: '3px 8px' }}
              onClick={() => { actions.deleteFeedbackItem(f.id); showToast('Feedback eliminado', '🗑️'); }}
              title="Eliminar"
            >✕</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper: ordered flat list with subprojects indented ───────────────────────
function buildProjectOptions(projects) {
  const roots = projects.filter(p => !p.parentId);
  const result = [];
  roots.forEach(root => {
    result.push({ id: root.id, label: root.name });
    projects
      .filter(p => p.parentId === root.id)
      .forEach(sub => result.push({ id: sub.id, label: `↳ ${sub.name}` }));
  });
  return result;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FeedbackView({ feedbackItems, projects, clients, actions, showToast }) {
  const [newText,      setNewText]      = useState('');
  const [newProjId,    setNewProjId]    = useState('');
  const [newClient,    setNewClient]    = useState('');
  const [filterProj,   setFilterProj]   = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const projectOptions = buildProjectOptions(projects);

  const visible = feedbackItems.filter(f => {
    if (filterProj   && String(f.projectId) !== filterProj)          return false;
    if (filterClient && f.client !== filterClient)                    return false;
    if (filterStatus && (f.status || 'pendiente') !== filterStatus)  return false;
    return true;
  });

  const handleAdd = () => {
    if (!newText.trim()) return;
    const client = newClient.trim() || null;
    if (client) actions.addClient(client);
    actions.addFeedbackItem(newText.trim(), newProjId ? Number(newProjId) : null, null, client);
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
          placeholder="Pega aquí el mensaje o escribe el feedback del cliente..."
          value={newText}
          onChange={e => setNewText(e.target.value)}
          rows={3}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
          <ClientInput value={newClient} onChange={setNewClient} clients={clients} id="fb-clients-add" />
          <select
            value={newProjId}
            onChange={e => setNewProjId(e.target.value)}
            style={{ flex: 1, minWidth: 160 }}
          >
            <option value="">Sin asignar a proyecto</option>
            {projectOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <button className="btn btn-primary" onClick={handleAdd}>Añadir</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ margin: '16px 0 12px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Filtrar:</span>
        <select value={filterProj} onChange={e => setFilterProj(e.target.value)} style={{ fontSize: 13 }}>
          <option value="">Todos los proyectos</option>
          {projectOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        {clients.length > 0 && (
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={{ fontSize: 13 }}>
            <option value="">Todos los clientes</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ fontSize: 13 }}>
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      {/* List */}
      {visible.length === 0
        ? <div className="empty-state">No hay feedback. Agrega el primero arriba.</div>
        : visible.map(f => (
            <FeedbackItemRow
              key={f.id}
              f={f}
              projects={projects}
              projectOptions={projectOptions}
              actions={actions}
              showToast={showToast}
            />
          ))
      }
    </div>
  );
}
