import { useState } from 'react';

// ── Constants ──────────────────────────────────────────────────────────────────
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

const CONTACT_TYPE_STYLE = {
  cliente: { borderColor: '#0891b2', color: '#0e7490', background: '#ecfeff' },
  lead:    { borderColor: '#d97706', color: '#b45309', background: '#fffbeb' },
};

// ── localStorage helpers ───────────────────────────────────────────────────────
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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

function ContactTypeSelect({ value, onChange }) {
  const s = CONTACT_TYPE_STYLE[value] || CONTACT_TYPE_STYLE.cliente;
  return (
    <select
      className="status-select"
      style={{ borderColor: s.borderColor, color: s.color, background: s.background }}
      value={value || 'cliente'}
      onChange={e => onChange(e.target.value)}
    >
      <option value="cliente">Cliente</option>
      <option value="lead">Lead</option>
    </select>
  );
}

function ProjectInlineSelect({ value, projectOptions, onChange }) {
  const hasValue = projectOptions.some(o => o.id === value);
  return (
    <select
      className={`proj-inline-select${hasValue ? '' : ' unassigned'}`}
      value={value ?? ''}
      onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">📌 Sin proyecto</option>
      {projectOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  );
}

// Client combobox: select from existing OR type new
function ClientCombo({ value, onChange, clients }) {
  const inList = clients.includes(value);
  const [mode, setMode] = useState(!value || inList ? 'pick' : 'new');

  if (clients.length === 0 || mode === 'new') {
    return (
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {clients.length > 0 && (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => { setMode('pick'); onChange(''); }}
            style={{ padding: '2px 8px', fontSize: 12 }}
            title="Ver lista de clientes"
          >↩</button>
        )}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Nombre del cliente..."
          style={{ width: 150, minWidth: 110 }}
        />
      </div>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={e => {
        if (e.target.value === '__new__') { setMode('new'); onChange(''); }
        else onChange(e.target.value);
      }}
      style={{ minWidth: 140 }}
    >
      <option value="">Sin cliente</option>
      {clients.map(c => <option key={c} value={c}>{c}</option>)}
      <option value="__new__">+ Nuevo cliente…</option>
    </select>
  );
}

// Feature combobox: select from existing OR type new
function FeatureCombo({ value, onChange, features }) {
  const inList = features.includes(value);
  const [mode, setMode] = useState(!value || inList ? 'pick' : 'new');

  if (features.length === 0 || mode === 'new') {
    return (
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {features.length > 0 && (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => { setMode('pick'); onChange(''); }}
            style={{ padding: '2px 8px', fontSize: 12 }}
            title="Ver lista de funcionalidades"
          >↩</button>
        )}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Funcionalidad (opcional)..."
          style={{ width: 170, minWidth: 130 }}
        />
      </div>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={e => {
        if (e.target.value === '__new__') { setMode('new'); onChange(''); }
        else onChange(e.target.value);
      }}
      style={{ minWidth: 150 }}
    >
      <option value="">Sin funcionalidad</option>
      {features.map(f => <option key={f} value={f}>{f}</option>)}
      <option value="__new__">+ Nueva funcionalidad…</option>
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
                {(v.client || v.date) && (
                  <div className="voice-client">
                    {v.contactType === 'lead' ? '🎯' : '👤'} {v.client || '—'} · {v.date}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FeedbackItemRow ────────────────────────────────────────────────────────────
function FeedbackItemRow({
  f, projects, projectOptions, allFeedbackItems,
  clients, features, actions, showToast,
  mergeMode, onStartMerge, onCancelMerge,
  isMergeSelected, onToggleMergeSelect,
}) {
  const [editing,      setEditing]      = useState(false);
  const [draftText,    setDraftText]    = useState(f.text);
  const [draftClient,  setDraftClient]  = useState(f.client || '');
  const [draftFeature, setDraftFeature] = useState(f.feature || '');

  const status      = f.status || 'pendiente';
  const contactType = f.contactType || 'cliente';
  const isDimmed    = status === 'resuelto' || status === 'ahora-no';
  const incidence   = 1 + (f.mergedFrom?.length || 0);
  const isPrimary   = mergeMode?.primaryId === f.id;
  const isInMerge   = !!mergeMode;

  const saveText = () => {
    if (!draftText.trim()) return;
    const changes = { text: draftText.trim() };
    const newClient  = draftClient.trim() || null;
    const newFeature = draftFeature.trim() || null;
    if (newClient  !== (f.client  || null)) { changes.client  = newClient;  if (newClient)  actions.addClient(newClient); }
    if (newFeature !== (f.feature || null)) { changes.feature = newFeature; if (newFeature) actions.addFeature(newFeature); }
    actions.updateFeedbackItem(f.id, changes);
    setEditing(false);
    showToast('Feedback actualizado', '✏️');
  };

  const cancelEdit = () => {
    setDraftText(f.text);
    setDraftClient(f.client || '');
    setDraftFeature(f.feature || '');
    setEditing(false);
  };

  const enterEdit = () => {
    setDraftText(f.text);
    setDraftClient(f.client || '');
    setDraftFeature(f.feature || '');
    setEditing(true);
  };

  const cardClass = `feedback-item${isDimmed && !isInMerge ? ' done' : ''}${isPrimary ? ' merge-primary' : ''}${isInMerge && !isPrimary ? ' merge-candidate' : ''}`;

  return (
    <div className={cardClass} style={{ display: 'block', padding: '12px 14px' }}>
      {isPrimary && (
        <div className="merge-primary-label">📌 Feedback principal — selecciona los similares abajo</div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Merge checkbox */}
        {isInMerge && !isPrimary && (
          <input type="checkbox" className="merge-check" checked={isMergeSelected} onChange={onToggleMergeSelect} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Main text */}
          {editing ? (
            <textarea
              style={{ width: '100%', fontSize: 14, borderRadius: 6, border: '1.5px solid #a78bfa', padding: '7px 10px', fontFamily: 'inherit', resize: 'vertical' }}
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              autoFocus
              rows={3}
            />
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{f.text}</div>
          )}

          {/* Meta row */}
          <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Contact type — always interactive */}
            <ContactTypeSelect
              value={contactType}
              onChange={ct => actions.updateFeedbackItem(f.id, { contactType: ct })}
            />

            {/* Client badge (normal mode) */}
            {!editing && f.client && (
              <span className="badge badge-client">
                {contactType === 'lead' ? '🎯' : '👤'} {f.client}
              </span>
            )}

            {/* Feature badge (normal mode) */}
            {!editing && f.feature && (
              <span className="badge" style={{ background: '#f3e8ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>
                ⚙️ {f.feature}
              </span>
            )}

            <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{f.date}</span>

            {/* Project inline select — always interactive */}
            <ProjectInlineSelect
              value={f.projectId}
              projectOptions={projectOptions}
              onChange={projId => {
                actions.assignFeedback(f.id, projId);
                showToast('Feedback asignado', '📌');
              }}
            />

            {/* Incidence badge */}
            {incidence > 1 && (
              <span className={`badge-incidence${incidence >= 4 ? ' hot' : ''}`}>
                👥 {incidence} clientes{incidence >= 4 ? ' 🔥' : ''}
              </span>
            )}

            {/* Status select */}
            <StatusSelect
              status={status}
              onChange={s => actions.updateFeedbackItem(f.id, { status: s })}
            />
          </div>

          {/* Edit mode: client + feature fields */}
          {editing && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <ClientCombo value={draftClient} onChange={setDraftClient} clients={clients} />
              <FeatureCombo value={draftFeature} onChange={setDraftFeature} features={features} />
            </div>
          )}

          {/* Edit save/cancel */}
          {editing && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={saveText}>Guardar</button>
              <button className="btn btn-sm" onClick={cancelEdit}>Cancelar</button>
            </div>
          )}

          {/* Merged voices */}
          {(f.mergedFrom?.length > 0) && (
            <VoicesList mergedFrom={f.mergedFrom} allFeedbackItems={allFeedbackItems} />
          )}

          {/* Resolution */}
          {(!isInMerge || isPrimary) && (
            <ResolutionField
              resolution={f.resolution || null}
              onSave={val => actions.updateFeedbackItem(f.id, { resolution: val })}
            />
          )}

          {/* Action buttons */}
          {!editing && !isInMerge && (
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              <button
                className="btn btn-sm"
                style={{ padding: '3px 8px', color: '#7c3aed', borderColor: '#ddd6fe' }}
                onClick={onStartMerge}
                title="Unificar feedback"
              >🔗</button>
              <button
                className="btn btn-sm"
                style={{ padding: '3px 8px' }}
                onClick={enterEdit}
                title="Editar"
              >✏️</button>
              <button
                className="btn btn-sm"
                style={{ color: '#ef4444', padding: '3px 8px' }}
                onClick={() => { actions.deleteFeedbackItem(f.id); showToast('Feedback eliminado', '🗑️'); }}
                title="Eliminar"
              >✕</button>
            </div>
          )}
          {isPrimary && (
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-sm" style={{ color: '#6b7280', padding: '3px 8px' }} onClick={onCancelMerge}>
                Cancelar merge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function buildProjectOptions(projects) {
  const roots = projects.filter(p => !p.parentId);
  const result = [];
  roots.forEach(root => {
    result.push({ id: root.id, label: root.name });
    projects.filter(p => p.parentId === root.id)
      .forEach(sub => result.push({ id: sub.id, label: `↳ ${sub.name}` }));
  });
  return result;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function FeedbackView({ feedbackItems, projects, clients, features, actions, showToast }) {
  // Add form state
  const [newText,        setNewText]        = useState('');
  const [newProjId,      setNewProjId]      = useState('');
  const [newClient,      setNewClient]      = useState('');
  const [newContactType, setNewContactType] = useState('cliente');
  const [newFeature,     setNewFeature]     = useState('');

  // Filter + sort state (persisted to localStorage)
  const [filterProj,         setFilterProjRaw]         = useState(() => lsGet('fb_filterProj', ''));
  const [filterClient,       setFilterClientRaw]       = useState(() => lsGet('fb_filterClient', ''));
  const [filterStatus,       setFilterStatusRaw]       = useState(() => lsGet('fb_filterStatus', ''));
  const [filterContactType,  setFilterContactTypeRaw]  = useState(() => lsGet('fb_filterContactType', ''));
  const [filterFeature,      setFilterFeatureRaw]      = useState(() => lsGet('fb_filterFeature', ''));
  const [sortBy,             setSortByRaw]             = useState(() => lsGet('fb_sortBy', 'date'));

  const setFilterProj        = v => { setFilterProjRaw(v);        lsSet('fb_filterProj', v); };
  const setFilterClient      = v => { setFilterClientRaw(v);      lsSet('fb_filterClient', v); };
  const setFilterStatus      = v => { setFilterStatusRaw(v);      lsSet('fb_filterStatus', v); };
  const setFilterContactType = v => { setFilterContactTypeRaw(v); lsSet('fb_filterContactType', v); };
  const setFilterFeature     = v => { setFilterFeatureRaw(v);     lsSet('fb_filterFeature', v); };
  const setSortBy            = v => { setSortByRaw(v);            lsSet('fb_sortBy', v); };

  // Merge state
  const [mergeMode,        setMergeMode]        = useState(null); // { primaryId }
  const [mergeSelectedIds, setMergeSelectedIds] = useState(new Set());

  const projectOptions = buildProjectOptions(projects);

  // All features (union of global features array + any on items)
  const allFeatures = [...new Set([...features, ...feedbackItems.map(f => f.feature).filter(Boolean)])].sort();

  // Filtered + sorted list
  const visible = feedbackItems
    .filter(f => {
      if (f.mergedInto) return false;
      if (filterProj        && String(f.projectId) !== filterProj)               return false;
      if (filterClient      && f.client !== filterClient)                         return false;
      if (filterStatus      && (f.status || 'pendiente') !== filterStatus)       return false;
      if (filterContactType && (f.contactType || 'cliente') !== filterContactType) return false;
      if (filterFeature     && f.feature !== filterFeature)                       return false;
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
        return (order[a.status || 'pendiente'] ?? 0) - (order[b.status || 'pendiente'] ?? 0);
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
    const client  = newClient.trim()  || null;
    const feature = newFeature.trim() || null;
    if (client)  actions.addClient(client);
    if (feature) actions.addFeature(feature);
    actions.addFeedbackItem(newText.trim(), newProjId ? Number(newProjId) : null, null, client, newContactType, feature);
    setNewText('');
    setNewProjId('');
    setNewClient('');
    setNewFeature('');
    setNewContactType('cliente');
    showToast('Feedback añadido', '💬');
  };

  const startMerge  = id => { setMergeMode({ primaryId: id }); setMergeSelectedIds(new Set()); };
  const cancelMerge = ()  => { setMergeMode(null); setMergeSelectedIds(new Set()); };

  const confirmMerge = () => {
    if (mergeSelectedIds.size === 0) { cancelMerge(); return; }
    actions.mergeFeedbackItems(mergeMode.primaryId, [...mergeSelectedIds]);
    cancelMerge();
    showToast(`${mergeSelectedIds.size} feedback${mergeSelectedIds.size > 1 ? 's' : ''} unido${mergeSelectedIds.size > 1 ? 's' : ''}`, '🔗');
  };

  const toggleMergeSelect = id => {
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
          <ContactTypeSelect value={newContactType} onChange={setNewContactType} />
          <ClientCombo value={newClient} onChange={setNewClient} clients={clients} />
          <FeatureCombo value={newFeature} onChange={setNewFeature} features={features} />
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
          🔗 Modo merge activo — selecciona los feedbacks similares para agruparlos.
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
        <select value={filterContactType} onChange={e => setFilterContactType(e.target.value)} style={{ fontSize: 13 }}>
          <option value="">Lead y Cliente</option>
          <option value="cliente">Solo Cliente</option>
          <option value="lead">Solo Lead</option>
        </select>
        {allFeatures.length > 0 && (
          <select value={filterFeature} onChange={e => setFilterFeature(e.target.value)} style={{ fontSize: 13 }}>
            <option value="">Todas las funcionalidades</option>
            {allFeatures.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        )}
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
              clients={clients}
              features={features}
              actions={actions}
              showToast={showToast}
              mergeMode={mergeMode}
              onStartMerge={() => startMerge(f.id)}
              onCancelMerge={cancelMerge}
              isMergeSelected={mergeSelectedIds.has(f.id)}
              onToggleMergeSelect={() => toggleMergeSelect(f.id)}
            />
          ))
      }
    </div>
  );
}
