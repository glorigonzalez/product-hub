import { useState } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { key: 'pendiente', label: '🟡 Pendiente' },
  { key: 'revision',  label: '🔵 En revisión' },
  { key: 'resuelto',  label: '✅ Resuelto' },
  { key: 'ahora-no',  label: '⏸ Ahora no' },
];

const STATUS_STYLE = {
  pendiente:  { borderColor: '#f59e0b', color: '#d97706', background: '#fffbeb' },
  revision:   { borderColor: '#3b82f6', color: '#2563eb', background: '#eff6ff' },
  resuelto:   { borderColor: '#10b981', color: '#059669', background: '#ecfdf5' },
  'ahora-no': { borderColor: '#9ca3af', color: '#6b7280', background: '#f9fafb' },
};

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

function StatusSelect({ status, onChange }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pendiente;
  return (
    <select
      className="status-select"
      style={{ borderColor: s.borderColor, color: s.color, background: s.background }}
      value={status}
      onChange={e => onChange(e.target.value)}
    >
      {STATUS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
    </select>
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
      <div className="resolution-empty" onClick={() => { setDraft(''); setEditing(true); }}>
        + Explicar cómo se resuelve el dolor del cliente...
      </div>
    );
  }
  if (!editing) {
    return (
      <div className="resolution-filled">
        <span className="resolution-label">💡 Resolución:</span>
        <span className="resolution-text">{resolution}</span>
        <button className="btn-icon-sm" onClick={() => { setDraft(resolution || ''); setEditing(true); }}>✏️</button>
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

function VoicesList({ mergedFrom, allFeedbackItems }) {
  const [open, setOpen] = useState(false);
  const voices = allFeedbackItems.filter(f => mergedFrom.includes(f.id));
  if (voices.length === 0) return null;
  return (
    <div className="voices-wrap">
      <button className="voices-toggle" onClick={() => setOpen(o => !o)}>
        {open ? '▾' : '▸'} {voices.length} comentario{voices.length > 1 ? 's' : ''} adicional{voices.length > 1 ? 'es' : ''}
      </button>
      {open && (
        <div className="voices-list">
          {voices.map(v => (
            <div key={v.id} className="voice-item">
              <span className="voice-icon">💬</span>
              <div>
                <div className="voice-text">{v.text}</div>
                {v.client && <div className="voice-client">👤 {v.client} · {v.date}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FeedbackItemRow ───────────────────────────────────────────────────────────
function FeedbackItemRow({ f, projects, projectOptions, allFeedbackItems, actions, showToast, mergeMode, onStartMerge, onCancelMerge, onConfirmMerge, isMergeSelected, onToggleMergeSelect }) {
  const [editing,   setEditing]   = useState(false);
  const [draftText, setDraftText] = useState(f.text);

  const status     = f.status || 'pendiente';
  const isDimmed   = status === 'resuelto' || status === 'ahora-no';
  const proj       = f.projectId ? projects.find(p => p.id === f.projectId) : null;
  const incidence  = 1 + (f.mergedFrom?.length || 0);
  const isPrimary  = mergeMode?.primaryId === f.id;
  const isInMerge  = !!mergeMode;

  const saveText = () => {
    if (!draftText.trim()) return;
    actions.updateFeedbackItem(f.id, { text: draftText.trim() });
    setEditing(false);
    showToast('Feedback actualizado', '✏️');
  };

  // During merge mode: primary item shows highlighted header; others show checkbox
  const cardClass = `feedback-item${isDimmed && !isInMerge ? ' done' : ''}${isPrimary ? ' merge-primary' : ''}${isInMerge && !isPrimary ? ' merge-candidate' : ''}`;

  return (
    <div className={cardClass} style={{ display: 'block', padding: '12px 14px' }}>
      {isPrimary && (
        <div className="merge-primary-label">📌 Feedback principal — selecciona los similares abajo</div>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Merge mode checkbox for candidates */}
        {isInMerge && !isPrimary && (
          <input
            type="checkbox"
            className="merge-check"
            checked={isMergeSelected}
            onChange={onToggleMergeSelect}
          />
        )}

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

          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {f.client && <span className="badge badge-client">👤 {f.client}</span>}
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{f.date}</span>
            {proj && <span className="feedback-proj">{proj.name}</span>}
            {incidence > 1 && (
              <span className={`badge-incidence${incidence >= 4 ? ' hot' : ''}`}>
                👥 {incidence} clientes{incidence >= 4 ? ' 🔥' : ''}
              </span>
            )}
            <StatusSelect
              status={status}
              onChange={s => actions.updateFeedbackItem(f.id, { status: s })}
            />
          </div>

          {/* Merged voices */}
          {(f.mergedFrom?.length > 0) && (
            <VoicesList mergedFrom={f.mergedFrom} allFeedbackItems={allFeedbackItems} />
          )}

          {/* Resolution */}
          {!isInMerge && (
            <ResolutionField
              resolution={f.resolution || null}
              onSave={val => actions.updateFeedbackItem(f.id, { resolution: val })}
            />
          )}
        </div>

        {/* Right column — hidden during merge mode for candidates */}
        {(!isInMerge || isPrimary) && (
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
            {!editing && !isInMerge && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-sm" style={{ padding: '3px 8px', color: '#7c3aed', borderColor: '#ddd6fe' }} onClick={onStartMerge} title="Merge">🔗</button>
                <button className="btn btn-sm" style={{ padding: '3px 8px' }} onClick={() => { setDraftText(f.text); setEditing(true); }} title="Editar">✏️</button>
                <button className="btn btn-sm" style={{ color: '#ef4444', padding: '3px 8px' }} onClick={() => { actions.deleteFeedbackItem(f.id); showToast('Feedback eliminado', '🗑️'); }} title="Eliminar">✕</button>
              </div>
            )}
            {isPrimary && (
              <button className="btn btn-sm" style={{ color: '#6b7280', padding: '3px 8px' }} onClick={onCancelMerge}>Cancelar merge</button>
            )}
          </div>
        )}
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
  const [sortBy,       setSortBy]       = useState('date'); // 'date' | 'incidence' | 'status' | 'client'

  // Merge state
  const [mergeMode,        setMergeMode]        = useState(null); // { primaryId }
  const [mergeSelectedIds, setMergeSelectedIds] = useState(new Set());

  const projectOptions = buildProjectOptions(projects);

  // Only show primary items (mergedInto === null) in the list
  const visible = feedbackItems
    .filter(f => {
      if (f.mergedInto) return false;
      if (filterProj   && String(f.projectId) !== filterProj)         return false;
      if (filterClient && f.client !== filterClient)                   return false;
      if (filterStatus && (f.status || 'pendiente') !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'incidence') {
        const ia = 1 + (a.mergedFrom?.length || 0);
        const ib = 1 + (b.mergedFrom?.length || 0);
        return ib - ia || a.date.localeCompare(b.date) * -1;
      }
      if (sortBy === 'status') {
        const order = { pendiente: 0, revision: 1, 'ahora-no': 2, resuelto: 3 };
        const sa = order[a.status || 'pendiente'] ?? 0;
        const sb = order[b.status || 'pendiente'] ?? 0;
        return sa - sb;
      }
      if (sortBy === 'client') {
        const ca = (a.client || '').toLowerCase();
        const cb = (b.client || '').toLowerCase();
        if (!ca && !cb) return 0;
        if (!ca) return 1;
        if (!cb) return -1;
        return ca.localeCompare(cb);
      }
      return 0; // 'date' — keep Firestore insertion order (most recent first)
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

  const startMerge = (primaryId) => {
    setMergeMode({ primaryId });
    setMergeSelectedIds(new Set());
  };

  const cancelMerge = () => {
    setMergeMode(null);
    setMergeSelectedIds(new Set());
  };

  const confirmMerge = () => {
    if (mergeSelectedIds.size === 0) { cancelMerge(); return; }
    actions.mergeFeedbackItems(mergeMode.primaryId, [...mergeSelectedIds]);
    cancelMerge();
    showToast(`${mergeSelectedIds.size} feedback${mergeSelectedIds.size > 1 ? 's' : ''} unido${mergeSelectedIds.size > 1 ? 's' : ''}`, '🔗');
  };

  const toggleMergeSelect = (id) => {
    setMergeSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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

      {/* Merge mode banner */}
      {mergeMode && (
        <div className="merge-banner">
          🔗 Modo merge activo — selecciona los feedbacks que hablan del mismo dolor para agruparlos.
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
            {mergeSelectedIds.size > 0 && (
              <button className="btn btn-primary btn-sm" onClick={confirmMerge}>
                Unir {mergeSelectedIds.size} seleccionado{mergeSelectedIds.size > 1 ? 's' : ''}
              </button>
            )}
            <button className="btn btn-sm" onClick={cancelMerge}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filters + sort */}
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
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ fontSize: 13, marginLeft: 'auto' }}>
          <option value="date">📅 Más reciente</option>
          <option value="incidence">👥 Más solicitado</option>
          <option value="status">🏷 Por estado</option>
          <option value="client">👤 Por cliente</option>
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
              allFeedbackItems={feedbackItems}
              actions={actions}
              showToast={showToast}
              mergeMode={mergeMode}
              onStartMerge={() => startMerge(f.id)}
              onCancelMerge={cancelMerge}
              onConfirmMerge={confirmMerge}
              isMergeSelected={mergeSelectedIds.has(f.id)}
              onToggleMergeSelect={() => toggleMergeSelect(f.id)}
            />
          ))
      }
    </div>
  );
}
