import { STAGES, STAGE_ORDER, TECH_LEADS } from '../config/stages';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  const days = Math.floor((new Date() - d) / 86400000);
  return days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days}d`;
}

export default function DevView({ projects, onOpen }) {
  return (
    <div style={{ padding: '0 24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {TECH_LEADS.map(dev => {
        const devProjects = projects.filter(p => p.leadTech === dev);
        if (!devProjects.length) return null;
        return (
          <div key={dev}>
            <div className="dev-header">
              <div className="dev-avatar">{dev[0]}</div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{dev}</span>
              <span className="badge badge-gray" style={{ marginLeft: 8 }}>{devProjects.length} proyecto{devProjects.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {STAGE_ORDER.flatMap(stKey => {
                const inStage = devProjects.filter(p => p.stage === stKey);
                if (!inStage.length) return [];
                const st = STAGES[stKey];
                return inStage.map(p => (
                  <div key={p.id} className="dev-project-row" onClick={() => onOpen(p.id)}>
                    <span className={`stage-pill ${p.stage}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                      {st.icon} {st.short}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{p.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmt(p.updated)}</span>
                    <span style={{ color: 'var(--primary)', fontSize: 14 }}>→</span>
                  </div>
                ));
              })}
            </div>
          </div>
        );
      })}

      {projects.every(p => !p.leadTech) && (
        <div className="empty-state">
          Ningún proyecto tiene un Lead Dev asignado todavía.<br />
          Abre un proyecto y asígnale un desarrollador.
        </div>
      )}
    </div>
  );
}
