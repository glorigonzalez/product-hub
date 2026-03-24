import { STAGES } from '../config/stages';

const CHANNELS = {
  slack:    { icon: '💬' },
  email:    { icon: '📧' },
  whatsapp: { icon: '📱' },
  inapp:    { icon: '🔔' },
  push:     { icon: '📲' },
  notes:    { icon: '📝' },
};

const TIMING_LABELS = {
  pre:           '📢 Antes',
  simultaneous:  '⚡ Simultáneo',
  post:          '⏳ Después',
  staged:        '🪜 Staged',
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr + 'T00:00:00') - new Date()) / 86400000);
}

function LaunchCard({ project, onOpenLaunch }) {
  const launch   = project.launch || {};
  const comms    = launch.comms || [];
  const ready    = comms.filter(c => c.status === 'ready' || c.status === 'sent').length;
  const pct      = comms.length ? Math.round((ready / comms.length) * 100) : 0;
  const days     = daysUntil(launch.targetDate);
  const st       = STAGES[project.stage];
  const isAllReady = comms.length > 0 && ready === comms.length;
  const isLaunched = project.stage === 'produccion' && isAllReady;

  return (
    <div
      className={`launch-card${isAllReady ? ' launch-card-ready' : ''}${isLaunched ? ' launch-card-done' : ''}`}
      onClick={() => onOpenLaunch(project.id)}
    >
      <div className="launch-card-top">
        <div style={{ flex: 1 }}>
          <div className="launch-card-name">{project.name}</div>
          <div className="launch-card-meta">
            <span className={`stage-pill ${project.stage}`} style={{ fontSize: 11, padding: '2px 8px' }}>
              {st.icon} {st.short}
            </span>
            {launch.timing && (
              <span className="launch-timing-pill">{TIMING_LABELS[launch.timing]}</span>
            )}
            {launch.targetDate && (
              <span className="launch-target-date">
                🗓️ {launch.targetDate}
                {days !== null && (
                  <span style={{ marginLeft: 4, color: days < 0 ? '#dc2626' : days <= 7 ? '#d97706' : 'var(--muted)' }}>
                    {days < 0 ? `· vencido hace ${Math.abs(days)}d` : days === 0 ? '· ¡hoy!' : `· en ${days}d`}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
        <button
          className="btn btn-sm"
          style={isAllReady ? { background: '#7e22ce', color: 'white', borderColor: '#7e22ce' } : {}}
          onClick={e => { e.stopPropagation(); onOpenLaunch(project.id); }}
        >
          Ver plan →
        </button>
      </div>

      {/* Channel pills */}
      {comms.length > 0 && (
        <div className="launch-channels">
          {comms.map(c => {
            const icon = (CHANNELS[c.channel] || { icon: '📌' }).icon;
            const cls  = { ready: 'lch-ready', sent: 'lch-sent', draft: 'lch-draft', pending: 'lch-pending' }[c.status] || 'lch-pending';
            const prefix = (c.status === 'ready' || c.status === 'sent') ? '✓ ' : c.status === 'draft' ? '✎ ' : '○ ';
            return (
              <span key={c.id} className={`launch-ch-pill ${cls}`}>
                {prefix}{icon} {c.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Progress bar */}
      {comms.length > 0 && (
        <div className="launch-bar-wrap">
          <span className="launch-bar-label">{ready}/{comms.length} listas</span>
          <div className="launch-bar-track">
            <div className="launch-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="launch-bar-pct">{pct}%</span>
        </div>
      )}

      {comms.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginTop: 8 }}>
          Sin canales definidos — abre el plan para agregar comunicaciones.
        </div>
      )}
    </div>
  );
}

export default function LaunchView({ projects, onOpenLaunch }) {
  // Only show projects that have a launch plan started
  const withLaunch = projects.filter(p => p.launch);

  // Categorize
  const launched     = withLaunch.filter(p => {
    const comms = p.launch?.comms || [];
    return p.stage === 'produccion' && comms.length > 0 && comms.every(c => c.status === 'sent' || c.status === 'ready');
  });
  const allReady     = withLaunch.filter(p => {
    const comms = p.launch?.comms || [];
    const ready = comms.filter(c => c.status === 'ready' || c.status === 'sent').length;
    return !launched.includes(p) && comms.length > 0 && ready === comms.length;
  });
  const inProgress   = withLaunch.filter(p =>
    !launched.includes(p) && !allReady.includes(p)
  );

  // Projects without a launch plan yet (to suggest starting one)
  const withoutLaunch = projects.filter(p => !p.launch && !p.parentId &&
    ['desarrollo', 'qa'].includes(p.stage)
  );

  if (withLaunch.length === 0 && withoutLaunch.length === 0) {
    return (
      <div style={{ padding: 32 }}>
        <div className="empty-state">
          🚀 No hay planes de lanzamiento todavía.<br />
          Abre un proyecto en estado <strong>Desarrollo</strong> o <strong>QA</strong> y ve al tab <strong>🚀 Lanzamiento</strong> para crear uno.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 860, margin: '0 auto' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>🚀 Planes de Lanzamiento</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {withLaunch.length} {withLaunch.length === 1 ? 'proyecto' : 'proyectos'} con plan activo
            {allReady.length > 0 && ` · ${allReady.length} listo${allReady.length > 1 ? 's' : ''} para lanzar`}
          </p>
        </div>
      </div>

      {/* ── Listos para lanzar ── */}
      {allReady.length > 0 && (
        <div className="launch-section">
          <div className="launch-section-title" style={{ color: 'var(--c-produccion)' }}>
            ✅ &nbsp;Listos para lanzar
          </div>
          {allReady.map(p => <LaunchCard key={p.id} project={p} onOpenLaunch={onOpenLaunch} />)}
        </div>
      )}

      {/* ── En preparación ── */}
      {inProgress.length > 0 && (
        <div className="launch-section">
          <div className="launch-section-title" style={{ color: 'var(--c-ideacion)' }}>
            ⚠️ &nbsp;En preparación
          </div>
          {inProgress.map(p => <LaunchCard key={p.id} project={p} onOpenLaunch={onOpenLaunch} />)}
        </div>
      )}

      {/* ── Ya lanzados ── */}
      {launched.length > 0 && (
        <div className="launch-section">
          <div className="launch-section-title" style={{ color: 'var(--muted)' }}>
            📤 &nbsp;Ya lanzados
          </div>
          {launched.map(p => <LaunchCard key={p.id} project={p} onOpenLaunch={onOpenLaunch} />)}
        </div>
      )}

      {/* ── Sugeridos (en desarrollo/QA sin plan) ── */}
      {withoutLaunch.length > 0 && (
        <div className="launch-section">
          <div className="launch-section-title" style={{ color: 'var(--muted)' }}>
            💡 &nbsp;Sin plan de lanzamiento aún
          </div>
          {withoutLaunch.map(p => {
            const st = STAGES[p.stage];
            return (
              <div
                key={p.id}
                className="launch-card launch-card-empty"
                onClick={() => onOpenLaunch(p.id)}
              >
                <div className="launch-card-top">
                  <div style={{ flex: 1 }}>
                    <div className="launch-card-name" style={{ color: 'var(--muted)' }}>{p.name}</div>
                    <div className="launch-card-meta">
                      <span className={`stage-pill ${p.stage}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                        {st.icon} {st.short}
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-sm" style={{ color: '#7e22ce', borderColor: '#e9d5ff' }}>
                    + Crear plan →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
