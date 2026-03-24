import { useState } from 'react';
import { STAGES, STAGE_ORDER, TECH_LEADS, PROD_LEADS } from '../config/stages';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  const days = Math.floor((new Date() - d) / 86400000);
  return days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days}d`;
}

function getDateStatus(p) {
  if (!p.dueDate) return null;
  const due = new Date(p.dueDate + 'T00:00:00');
  const now = new Date();
  const diff = Math.floor((due - now) / 86400000);
  if (diff < 0)  return { label: `Atrasado ${Math.abs(diff)}d`, bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' };
  if (diff === 0) return { label: 'Vence hoy', bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
  if (diff <= 7)  return { label: `Vence en ${diff}d`, bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
  return null;
}

// ── Tab: Contexto ────────────────────────────────────────────────────────────
function TabContexto({ project, projects, onOpen, onUpdate }) {
  const p = project;
  const parentProj = p.parentId ? projects.find(pp => pp.id === p.parentId) : null;
  const subs = projects.filter(s => s.parentId === p.id);
  const [editingDesc, setEditingDesc] = useState(false);
  const [draftDesc,   setDraftDesc]   = useState(p.desc || '');

  const saveDesc = () => {
    onUpdate({ desc: draftDesc.trim() || null });
    setEditingDesc(false);
  };

  return (
    <div>
      {parentProj && (
        <>
          <div className="section-h">Proyecto padre</div>
          <div
            className="parent-proj-link"
            onClick={() => { onOpen(parentProj.id); }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{parentProj.name}</div>
              <div style={{ marginTop: 2 }}>
                <span className={`stage-pill ${parentProj.stage}`} style={{ fontSize: 11, padding: '1px 7px' }}>
                  {STAGES[parentProj.stage].icon} {STAGES[parentProj.stage].short}
                </span>
              </div>
            </div>
            <span style={{ color: 'var(--primary)', fontSize: 14 }}>→</span>
          </div>
        </>
      )}

      <div className="section-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Descripción
        {!editingDesc && (
          <button
            className="btn btn-sm"
            style={{ fontSize: 11, padding: '2px 8px', color: 'var(--primary)' }}
            onClick={() => { setDraftDesc(p.desc || ''); setEditingDesc(true); }}
          >
            ✏️ Editar
          </button>
        )}
      </div>

      {editingDesc ? (
        <div>
          <textarea
            style={{ height: 90, marginBottom: 6 }}
            placeholder="Describe el proyecto..."
            value={draftDesc}
            onChange={e => setDraftDesc(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-primary btn-sm" onClick={saveDesc}>Guardar</button>
            <button className="btn btn-sm" onClick={() => setEditingDesc(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <p
          style={{ fontSize: 14, lineHeight: 1.6, cursor: 'text', minHeight: 24 }}
          onClick={() => { setDraftDesc(p.desc || ''); setEditingDesc(true); }}
          title="Clic para editar"
        >
          {p.desc || <span style={{ color: 'var(--muted)' }}>Sin descripción — clic para agregar</span>}
        </p>
      )}

      {p.phase && p.totalPhases && (
        <>
          <div className="section-h">Progreso</div>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              <span>Fase {p.phase} de {p.totalPhases}</span>
              <span style={{ color: 'var(--c-desarrollo)' }}>{Math.round((p.phase / p.totalPhases) * 100)}%</span>
            </div>
            <div className="phase-track">
              <div className="phase-fill" style={{ width: `${Math.round((p.phase / p.totalPhases) * 100)}%` }} />
            </div>
          </div>
        </>
      )}

      <div className="section-h" style={{ marginTop: 16 }}>Actividad</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Ideas',     value: (p.ideas || []).length,     bg: 'var(--c-ideacion-bg)',   color: 'var(--c-ideacion)',   border: 'var(--c-ideacion-border)'   },
          { label: 'Feedbacks', value: (p.feedback || []).length,  bg: 'var(--c-pitch-bg)',      color: 'var(--c-pitch)',      border: 'var(--c-pitch-border)'      },
          { label: 'Pitch',     value: p.pitch ? '✓' : '—',       bg: 'var(--c-produccion-bg)', color: 'var(--c-produccion)', border: 'var(--c-produccion-border)' },
          { label: 'Subs',      value: subs.length,                bg: 'var(--bg)',              color: 'var(--primary)',      border: 'var(--border)'              },
        ].map(({ label, value, bg, color, border }) => (
          <div key={label} style={{ textAlign: 'center', padding: '12px 8px', background: bg, border: `1px solid ${border}`, borderRadius: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Brainstorm ──────────────────────────────────────────────────────────
function TabBrainstorm({ project, onUpdate, showToast }) {
  const [newIdea, setNewIdea] = useState('');
  const ideas = project.ideas || [];

  const handleAdd = () => {
    if (!newIdea.trim()) return;
    onUpdate({ ideas: [...ideas, newIdea.trim()] });
    setNewIdea('');
    showToast('Idea añadida', '💡');
  };

  return (
    <div>
      <div className="section-h">Ideas del brainstorm</div>
      {ideas.length === 0
        ? <div className="empty-state">No hay ideas registradas todavía.<br />¡Empieza a hacer brainstorm con Claude y añade las ideas aquí!</div>
        : <ul className="idea-list">
            {ideas.map((idea, i) => (
              <li key={i} className="idea-item">
                <span className="idea-dot" />
                <span>{idea}</span>
              </li>
            ))}
          </ul>
      }
      <div className="section-h" style={{ marginTop: 8 }}>Agregar idea</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Nueva idea..."
          value={newIdea}
          onChange={e => setNewIdea(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>Añadir</button>
      </div>
    </div>
  );
}

// ── Tab: Feedback ────────────────────────────────────────────────────────────
function TabFeedback({ project, actions, clients, showToast }) {
  const [newFb,     setNewFb]     = useState('');
  const [newClient, setNewClient] = useState('');
  // Normalize: feedback items may be plain strings (legacy) or { text, client }
  const rawFeedback = project.feedback || [];
  const feedback = rawFeedback.map(f => typeof f === 'string' ? { text: f, client: null } : f);

  const handleAdd = () => {
    if (!newFb.trim()) return;
    const client = newClient.trim() || null;
    if (client) actions.addClient(client);
    const newItem = { text: newFb.trim(), client };
    actions.updateProject(project.id, { feedback: [...rawFeedback, newItem] });
    actions.addFeedbackItem(newFb.trim(), project.id, 'Manual', client);
    setNewFb('');
    setNewClient('');
    showToast('Feedback añadido', '💬');
  };

  return (
    <div>
      <div className="section-h">Feedback de clientes y equipo ({feedback.length})</div>
      {feedback.length === 0
        ? <div className="empty-state">No hay feedback asignado a este proyecto todavía.<br />Ve a <strong>Feedback Inbox</strong> para asignar mensajes de Slack o email.</div>
        : feedback.map((f, i) => (
            <div key={i} className="feedback-quote">
              <span className="q-icon">💬</span>
              <div style={{ flex: 1 }}>
                <div>{f.text}</div>
                {f.client && (
                  <span className="badge badge-client" style={{ marginTop: 4, display: 'inline-block' }}>
                    👤 {f.client}
                  </span>
                )}
              </div>
            </div>
          ))
      }
      <div className="section-h" style={{ marginTop: 8 }}>Agregar feedback manual</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Pega o escribe el feedback..."
          value={newFb}
          onChange={e => setNewFb(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          style={{ flex: 1, minWidth: 200 }}
        />
        <input
          type="text"
          list="modal-clients-list"
          placeholder="Cliente (opcional)..."
          value={newClient}
          onChange={e => setNewClient(e.target.value)}
          style={{ width: 160 }}
        />
        <datalist id="modal-clients-list">
          {(clients || []).map(c => <option key={c} value={c} />)}
        </datalist>
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>Añadir</button>
      </div>
    </div>
  );
}

// ── Tab: Pitch & Spec ────────────────────────────────────────────────────────
function TabPitch({ project, onUpdate, showToast }) {
  const [draftPitch, setDraftPitch] = useState('');
  const [draftSpec,  setDraftSpec]  = useState('');
  const hasPitch = project.pitch || project.spec;

  const saveDraft = () => {
    const changes = {};
    if (draftPitch.trim()) changes.pitch = draftPitch.trim();
    if (draftSpec.trim())  changes.spec  = draftSpec.trim();
    if (Object.keys(changes).length) {
      onUpdate(changes);
      showToast('Borrador guardado', '💾');
    }
  };

  const copyForLinear = () => {
    const p = project;
    let text = `## ${p.name}\n\n`;
    if (p.desc)  text += `${p.desc}\n\n`;
    if (p.pitch) text += `## Pitch\n${p.pitch}\n\n`;
    if (p.spec)  text += `## Spec\n${p.spec}\n\n`;
    navigator.clipboard.writeText(text).then(() => showToast('Copiado para Linear', '📋'));
  };

  if (hasPitch) {
    return (
      <div>
        {project.pitch && (
          <>
            <div className="section-h">Pitch</div>
            <div className="spec-box" style={{ whiteSpace: 'pre-wrap' }}>{project.pitch}</div>
          </>
        )}
        {project.spec && (
          <>
            <div className="section-h">Spec técnica</div>
            <div className="spec-box" style={{ whiteSpace: 'pre-wrap' }}>{project.spec}</div>
          </>
        )}
        <div style={{ marginTop: 16, padding: 12, background: '#eff6ff', border: '1px solid var(--c-desarrollo-border)', borderRadius: 8, fontSize: 13, color: 'var(--c-desarrollo)' }}>
          💡 <strong>Tip:</strong> Usa el botón <strong>"Copiar para Linear"</strong> abajo para copiar esto en formato listo para pegar en una issue de Linear.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="empty-state" style={{ marginBottom: 16 }}>
        No hay pitch ni spec para este proyecto todavía.<br /><br />
        Trabaja con Claude para estructurar la idea y luego añade el pitch aquí.
      </div>
      <div className="section-h">Borrador de pitch</div>
      <textarea
        style={{ height: 120 }}
        placeholder="Escribe el pitch aquí (problema, solución, impacto, timeline)..."
        value={draftPitch}
        onChange={e => setDraftPitch(e.target.value)}
      />
      <div className="section-h">Borrador de spec</div>
      <textarea
        style={{ height: 100 }}
        placeholder="Requerimientos técnicos, fases, out of scope..."
        value={draftSpec}
        onChange={e => setDraftSpec(e.target.value)}
      />
      <div style={{ marginTop: 10, textAlign: 'right' }}>
        <button className="btn btn-primary btn-sm" onClick={saveDraft}>Guardar borrador</button>
      </div>
    </div>
  );
}

// ── Tab: Subproyectos ────────────────────────────────────────────────────────
function TabSubproyectos({ project, projects, actions, onOpen, showToast }) {
  const [newSubName,  setNewSubName]  = useState('');
  const [newSubStage, setNewSubStage] = useState('ideacion');
  const subs = projects.filter(s => s.parentId === project.id);

  const handleAdd = () => {
    if (!newSubName.trim()) { showToast('Escribe el nombre del subproyecto', '⚠️'); return; }
    const id = actions.addProject(newSubName.trim(), newSubStage, project.id);
    setNewSubName('');
    showToast(`Subproyecto "${newSubName.trim()}" creado`, '🔀');
  };

  const stageSummary = STAGE_ORDER.map(k => {
    const n = subs.filter(s => s.stage === k).length;
    return n > 0 ? <span key={k} style={{ fontSize: 12, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px' }}>{STAGES[k].icon} {n}</span> : null;
  });

  return (
    <div>
      {subs.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>{stageSummary}</div>
      )}
      {subs.length === 0 && (
        <div className="empty-state">No hay subproyectos todavía.<br />Crea el primero desde el pitch o usa el botón de abajo.</div>
      )}

      {STAGE_ORDER.flatMap(stKey => {
        const inStage = subs.filter(s => s.stage === stKey);
        if (!inStage.length) return [];
        const st = STAGES[stKey];
        return [
          <div key={`h-${stKey}`} className="sub-group-h">
            <span className={`stage-pill ${stKey}`} style={{ fontSize: 11, padding: '2px 8px' }}>{st.icon} {st.short}</span>
            <span style={{ fontWeight: 400 }}>{inStage.length}</span>
          </div>,
          ...inStage.map(s => (
            <div key={s.id} className="sub-mini-row" onClick={() => onOpen(s.id)}>
              <div className="sub-mini-name">{s.name}</div>
              <div className="sub-mini-meta">
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{fmt(s.updated)}</span>
                <span style={{ fontSize: 12, color: 'var(--primary)' }}>→</span>
              </div>
            </div>
          )),
        ];
      })}

      <div className="sub-add-row">
        <input
          type="text"
          placeholder="Nombre del subproyecto..."
          value={newSubName}
          onChange={e => setNewSubName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          style={{ flex: 1 }}
        />
        <select value={newSubStage} onChange={e => setNewSubStage(e.target.value)} style={{ width: 160 }}>
          {STAGE_ORDER.map(k => (
            <option key={k} value={k}>{STAGES[k].icon} {STAGES[k].short}</option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>+ Subproyecto</button>
      </div>
    </div>
  );
}

// ── Tab: Lanzamiento ─────────────────────────────────────────────────────────
const CHANNELS = {
  slack:    { icon: '💬', label: 'Slack' },
  email:    { icon: '📧', label: 'Email' },
  whatsapp: { icon: '📱', label: 'WhatsApp' },
  inapp:    { icon: '🔔', label: 'In-app' },
  push:     { icon: '📲', label: 'Push' },
  notes:    { icon: '📝', label: 'Docs / Notes' },
};

const TIMING_OPTIONS = [
  { key: 'pre',          icon: '📢', label: 'Antes',       desc: 'Anunciar antes del deploy para generar expectativa' },
  { key: 'simultaneous', icon: '⚡', label: 'Simultáneo',  desc: 'Comunicar en el momento exacto del lanzamiento' },
  { key: 'post',         icon: '⏳', label: 'Después',     desc: 'Esperar estabilidad antes de comunicar' },
  { key: 'staged',       icon: '🪜', label: 'Staged',      desc: 'Por fases: interno → VIP → base general' },
];

const SCHED_LABELS = { before: 'Antes', at: 'Al lanzar', after: 'Después' };

function CommRow({ comm, projectId, actions, showToast }) {
  const ch = CHANNELS[comm.channel] || { icon: '📌', label: comm.channel };
  const statusCls = { pending: 'cs-pending', draft: 'cs-draft', ready: 'cs-ready', sent: 'cs-sent' }[comm.status] || 'cs-pending';
  const statusLabels = { pending: 'Pendiente', draft: 'Borrador', ready: 'Listo ✓', sent: 'Enviado ✓' };
  const schedCls = { before: 'ct-before', at: 'ct-at', after: 'ct-after' }[comm.scheduledFor] || 'ct-at';

  return (
    <div className={`comm-item${comm.status === 'ready' || comm.status === 'sent' ? ' comm-done' : ''}`}>
      <span className="comm-icon">{ch.icon}</span>
      <span className="comm-label">{comm.label || ch.label}</span>
      <span className={`comm-timing ${schedCls}`}>{SCHED_LABELS[comm.scheduledFor] || '—'}</span>
      <select
        className="comm-status-sel"
        value={comm.status}
        onChange={e => actions.updateLaunchComm(projectId, comm.id, { status: e.target.value })}
      >
        <option value="pending">Pendiente</option>
        <option value="draft">Borrador</option>
        <option value="ready">Listo ✓</option>
        <option value="sent">Enviado ✓</option>
      </select>
      <button className="comm-del" onClick={() => actions.deleteLaunchComm(projectId, comm.id)} title="Eliminar">✕</button>
    </div>
  );
}

function AddCommRow({ projectId, audience, actions, showToast }) {
  const [open, setOpen]    = useState(false);
  const [ch,   setCh]      = useState('slack');
  const [lbl,  setLbl]     = useState('');
  const [sched,setSched]   = useState('at');

  const handleAdd = () => {
    const label = lbl.trim() || CHANNELS[ch]?.label || ch;
    actions.addLaunchComm(projectId, { audience, channel: ch, label, scheduledFor: sched, status: 'pending' });
    setLbl(''); setCh('slack'); setSched('at'); setOpen(false);
    showToast('Canal añadido', '🚀');
  };

  if (!open) {
    return (
      <button className="comm-add-btn" onClick={() => setOpen(true)}>
        + Agregar canal {audience === 'internal' ? 'interno' : 'cliente'}
      </button>
    );
  }

  return (
    <div className="comm-add-row">
      <select value={ch} onChange={e => setCh(e.target.value)} style={{ width: 130 }}>
        {Object.entries(CHANNELS).map(([k, v]) => (
          <option key={k} value={k}>{v.icon} {v.label}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder={`Descripción (ej: ${CHANNELS[ch]?.label} al equipo...)`}
        value={lbl}
        onChange={e => setLbl(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        style={{ flex: 1 }}
      />
      <select value={sched} onChange={e => setSched(e.target.value)} style={{ width: 110 }}>
        <option value="before">Antes</option>
        <option value="at">Al lanzar</option>
        <option value="after">Después</option>
      </select>
      <button className="btn btn-primary btn-sm" onClick={handleAdd}>+ Añadir</button>
      <button className="btn btn-sm" onClick={() => setOpen(false)}>✕</button>
    </div>
  );
}

function TabLaunch({ project, actions, showToast }) {
  const launch = project.launch || {};
  const comms  = launch.comms || [];
  const internal = comms.filter(c => c.audience === 'internal');
  const customer = comms.filter(c => c.audience === 'customer');
  const readyCount = comms.filter(c => c.status === 'ready' || c.status === 'sent').length;
  const pct = comms.length ? Math.round((readyCount / comms.length) * 100) : 0;

  const setTiming     = (t) => actions.updateLaunch(project.id, { timing: t });
  const setTargetDate = (d) => actions.updateLaunch(project.id, { targetDate: d });

  const daysUntil = launch.targetDate
    ? Math.ceil((new Date(launch.targetDate + 'T00:00:00') - new Date()) / 86400000)
    : null;

  return (
    <div>
      {/* Timing selector */}
      <div className="section-h" style={{ marginTop: 0 }}>Estrategia de timing</div>
      <div className="timing-grid">
        {TIMING_OPTIONS.map(({ key, icon, label, desc }) => (
          <div
            key={key}
            className={`timing-card${launch.timing === key ? ' active' : ''}`}
            onClick={() => setTiming(key)}
          >
            <div className="timing-icon">{icon}</div>
            <div className="timing-label">{label}</div>
            <div className="timing-desc">{desc}</div>
          </div>
        ))}
      </div>

      {/* Target date */}
      <div className="launch-date-row">
        <span className="launch-date-label">🗓️ Fecha objetivo de lanzamiento</span>
        <input
          type="date"
          value={launch.targetDate || ''}
          onChange={e => setTargetDate(e.target.value || null)}
          style={{ border: 'none', background: 'none', fontSize: 13, fontFamily: 'inherit', color: 'var(--text)', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
        />
        {daysUntil !== null && (
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: daysUntil < 0 ? '#dc2626' : '#7e22ce' }}>
            {daysUntil < 0 ? `Venció hace ${Math.abs(daysUntil)}d` : daysUntil === 0 ? '¡Hoy!' : `En ${daysUntil} días`}
          </span>
        )}
      </div>

      {/* Progress */}
      {comms.length > 0 && (
        <>
          <div className="section-h">Progreso general</div>
          <div className="launch-progress-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: '#7e22ce' }}>{readyCount} de {comms.length} comunicaciones listas</span>
              <span style={{ color: '#7e22ce' }}>{pct}%</span>
            </div>
            <div className="phase-track">
              <div className="launch-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </>
      )}

      {/* Internal comms */}
      <div className="section-h">
        👥 Comunicación Interna
        {internal.length > 0 && (
          <span style={{ float: 'right', fontWeight: 700, color: 'var(--c-produccion)' }}>
            {internal.filter(c => c.status === 'ready' || c.status === 'sent').length}/{internal.length} ✓
          </span>
        )}
      </div>
      {internal.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--muted)', padding: '8px 0', fontStyle: 'italic' }}>
          Sin canales internos todavía.
        </div>
      )}
      {internal.map(c => (
        <CommRow key={c.id} comm={c} projectId={project.id} actions={actions} showToast={showToast} />
      ))}
      <AddCommRow projectId={project.id} audience="internal" actions={actions} showToast={showToast} />

      {/* Customer comms */}
      <div className="section-h" style={{ marginTop: 20 }}>
        🌍 Comunicación a Clientes
        {customer.length > 0 && (
          <span style={{ float: 'right', fontWeight: 700, color: customer.filter(c => c.status === 'ready' || c.status === 'sent').length === customer.length ? 'var(--c-produccion)' : 'var(--c-ideacion)' }}>
            {customer.filter(c => c.status === 'ready' || c.status === 'sent').length}/{customer.length} ✓
          </span>
        )}
      </div>
      {customer.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--muted)', padding: '8px 0', fontStyle: 'italic' }}>
          Sin canales de cliente todavía.
        </div>
      )}
      {customer.map(c => (
        <CommRow key={c.id} comm={c} projectId={project.id} actions={actions} showToast={showToast} />
      ))}
      <AddCommRow projectId={project.id} audience="customer" actions={actions} showToast={showToast} />
    </div>
  );
}

// ── Tab: Alcance ─────────────────────────────────────────────────────────────
function TabAlcance({ project, projects, actions, showToast }) {
  const [newText, setNewText] = useState('');
  const alcance = project.alcance || [];
  const subs = projects.filter(s => s.parentId === project.id);
  const doneCount = alcance.filter(a => a.done).length;

  const handleAdd = () => {
    if (!newText.trim()) return;
    actions.addAlcanceItem(project.id, newText.trim());
    setNewText('');
  };

  return (
    <div>
      {alcance.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            <span style={{ color: 'var(--muted)' }}>{doneCount}/{alcance.length} completados</span>
            <span style={{ color: 'var(--c-desarrollo)' }}>{Math.round((doneCount / alcance.length) * 100)}%</span>
          </div>
          <div className="phase-track">
            <div className="phase-fill" style={{ width: `${Math.round((doneCount / alcance.length) * 100)}%` }} />
          </div>
        </div>
      )}

      {alcance.length === 0 && (
        <div className="empty-state">No hay ítems de alcance todavía.<br />Agrega los puntos clave que este proyecto debe cumplir.</div>
      )}

      {alcance.map(a => (
        <div key={a.id} className="alcance-item">
          <input
            type="checkbox"
            className="alcance-check"
            checked={a.done}
            onChange={() => actions.toggleAlcanceItem(project.id, a.id)}
          />
          <span className={`alcance-text${a.done ? ' done' : ''}`}>{a.text}</span>
          <select
            className="alcance-assign"
            value={a.assignedTo ?? project.id}
            onChange={e => actions.assignAlcanceItem(project.id, a.id, Number(e.target.value))}
            title="Asignar a proyecto/subproyecto"
          >
            <option value={project.id}>📦 {project.name}</option>
            {subs.map(s => <option key={s.id} value={s.id}>↳ {s.name}</option>)}
          </select>
          <button
            className="alcance-del"
            onClick={() => actions.deleteAlcanceItem(project.id, a.id)}
            title="Eliminar"
          >✕</button>
        </div>
      ))}

      <div className="alcance-add-row">
        <input
          type="text"
          placeholder="Agregar punto de alcance..."
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>+ Agregar</button>
      </div>
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────
export default function ProjectModal({ project: initialProject, projects, clients, nextAlcanceId, actions, onClose, onOpen, showToast, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'contexto');

  // Always get the live project from the projects array (so updates reflect immediately)
  const project = projects.find(p => p.id === initialProject.id) ?? initialProject;
  const st = STAGES[project.stage];
  const subs = projects.filter(s => s.parentId === project.id);
  const alcanceCount = (project.alcance || []).length;
  const alcanceDone  = (project.alcance || []).filter(a => a.done).length;
  const dStatus = getDateStatus(project);

  const handleUpdate = (changes) => actions.updateProject(project.id, changes);

  const handleChangeStage = (newStage) => {
    actions.changeStage(project.id, newStage);
    showToast(`Movido a "${STAGES[newStage].short}"`, STAGES[newStage].icon);
  };

  const handleDeleteProject = () => {
    if (!window.confirm(`¿Eliminar "${project.name}" y todos sus subproyectos?`)) return;
    onClose();
    actions.deleteProject(project.id);
    showToast('Proyecto eliminado', '🗑️');
  };

  const handleCopyForLinear = () => {
    let text = `## ${project.name}\n\n`;
    if (project.desc)  text += `${project.desc}\n\n`;
    if (project.pitch) text += `## Pitch\n${project.pitch}\n\n`;
    if (project.spec)  text += `## Spec\n${project.spec}\n\n`;
    navigator.clipboard.writeText(text).then(() => showToast('Copiado para Linear', '📋'));
  };

  const launchComms  = (project.launch?.comms || []);
  const launchReady  = launchComms.filter(c => c.status === 'ready' || c.status === 'sent').length;
  const launchLabel  = launchComms.length > 0
    ? `🚀 Lanzamiento (${launchReady}/${launchComms.length})`
    : '🚀 Lanzamiento';

  const tabs = [
    { key: 'contexto',     label: 'Contexto' },
    { key: 'brainstorm',   label: 'Brainstorm' },
    { key: 'alcance',      label: alcanceCount > 0 ? `Alcance (${alcanceDone}/${alcanceCount})` : 'Alcance' },
    { key: 'pitch',        label: 'Pitch & Spec' },
    { key: 'subproyectos', label: subs.length > 0 ? `Subproyectos (${subs.length})` : 'Subproyectos' },
    { key: 'feedback',     label: 'Feedback' },
    { key: 'launch',       label: launchLabel, highlight: true },
  ];

  return (
    <div id="projectOverlay" className="overlay open" onClick={e => { if (e.target.id === 'projectOverlay') onClose(); }}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2 id="modalName" style={{ flex: 1, fontSize: 18, fontWeight: 700 }}>{project.name}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Meta row */}
        <div id="modalMeta" className="modal-meta">
          <span className={`stage-pill ${project.stage}`}>{st.icon} {st.short}</span>

          <select
            className={`lead-sel tech${project.leadTech ? '' : ' empty'}`}
            value={project.leadTech || ''}
            onChange={e => handleUpdate({ leadTech: e.target.value || null })}
            title="Lead Técnico"
          >
            <option value="">⚙️ Lead Dev</option>
            {TECH_LEADS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <select
            className={`lead-sel product${project.leadProduct ? '' : ' empty'}`}
            value={project.leadProduct || ''}
            onChange={e => handleUpdate({ leadProduct: e.target.value || null })}
            title="Lead Producto"
          >
            <option value="">📋 Lead Producto</option>
            {PROD_LEADS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          {project.phase && project.totalPhases && (
            <span className="badge badge-gray">Fase {project.phase}/{project.totalPhases}</span>
          )}

          <span className="date-field">
            <label>Inicio</label>
            <input
              type="date"
              value={project.startDate || ''}
              onChange={e => handleUpdate({ startDate: e.target.value || null })}
            />
          </span>
          <span className="date-field">
            <label>Entrega</label>
            <input
              type="date"
              value={project.dueDate || ''}
              onChange={e => handleUpdate({ dueDate: e.target.value || null })}
            />
          </span>

          {dStatus && (
            <span className="badge" style={{ background: dStatus.bg, color: dStatus.color, border: `1px solid ${dStatus.border}` }}>
              {dStatus.label}
            </span>
          )}

          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Actualizado {fmt(project.updated)}</span>
        </div>

        {/* Tab bar */}
        <div className="modal-tabs">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              className={`modal-tab${activeTab === key ? ' active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div id="modalBody" className="modal-body">
          {activeTab === 'contexto' && (
            <TabContexto project={project} projects={projects} onOpen={(id) => { onClose(); setTimeout(() => onOpen(id), 50); }} onUpdate={handleUpdate} />
          )}
          {activeTab === 'brainstorm' && (
            <TabBrainstorm project={project} onUpdate={handleUpdate} showToast={showToast} />
          )}
          {activeTab === 'feedback' && (
            <TabFeedback project={project} actions={actions} clients={clients || []} showToast={showToast} />
          )}
          {activeTab === 'pitch' && (
            <TabPitch project={project} onUpdate={handleUpdate} showToast={showToast} />
          )}
          {activeTab === 'subproyectos' && (
            <TabSubproyectos
              project={project} projects={projects}
              actions={actions} onOpen={(id) => { onClose(); setTimeout(() => onOpen(id), 50); }}
              showToast={showToast}
            />
          )}
          {activeTab === 'alcance' && (
            <TabAlcance
              project={project} projects={projects}
              actions={actions} showToast={showToast}
            />
          )}
          {activeTab === 'launch' && (
            <TabLaunch project={project} actions={actions} showToast={showToast} />
          )}
        </div>

        {/* Footer: move + actions */}
        <div className="modal-footer">
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginRight: 4, alignSelf: 'center' }}>Mover a:</span>
          <div className="stage-btns">
            {STAGE_ORDER.filter(k => k !== project.stage).map(k => (
              <button key={k} className={`stage-btn ${k}`} onClick={() => handleChangeStage(k)}>
                {STAGES[k].icon} {STAGES[k].short}
              </button>
            ))}
          </div>
          <button
            className="btn"
            style={{ color: '#ef4444', marginLeft: 'auto' }}
            onClick={handleDeleteProject}
          >
            Eliminar
          </button>
          {(project.pitch || project.spec) && (
            <button className="btn" onClick={handleCopyForLinear}>
              📋 Copiar para Linear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
