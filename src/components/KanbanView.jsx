import { STAGES, STAGE_ORDER } from '../config/stages';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  const days = Math.floor((new Date() - d) / 86400000);
  return days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days}d`;
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function ProjectCard({ p, projects, onOpen }) {
  const subs = projects.filter(s => s.parentId === p.id);
  const doneSubs = subs.filter(s => s.stage === 'produccion').length;
  const parentProj = p.parentId ? projects.find(pp => pp.id === p.parentId) : null;

  return (
    <div className={`project-card ${p.stage}`} onClick={() => onOpen(p.id)}>
      {parentProj && (
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>
          ↳ {parentProj.name}
        </div>
      )}
      <div className="card-name">{p.name}</div>
      {p.desc && <div className="card-desc">{p.desc}</div>}

      <div className="card-badges">
        {p.pitch && <span className="badge badge-green">📄 Pitch</span>}
        {subs.length > 0 && (
          <span className="badge badge-blue">
            🔀 {doneSubs}/{subs.length} subs ✓
          </span>
        )}
        {(p.leadTech || p.leadProduct) && (
          <span className="badge badge-gray" title={[p.leadTech, p.leadProduct].filter(Boolean).join(' · ')}>
            {[p.leadTech, p.leadProduct].filter(Boolean).map(initials).join(' ')}
          </span>
        )}
      </div>

      <div className="card-footer">
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmt(p.updated)}</span>
        {p.dueDate && (
          <span className="badge" style={{ fontSize: 11 }}>📅 {p.dueDate}</span>
        )}
      </div>
    </div>
  );
}

export default function KanbanView({ projects, onOpen, onNewInStage }) {
  const roots = projects.filter(p => !p.parentId);
  const counts = {};
  STAGE_ORDER.forEach(k => { counts[k] = roots.filter(p => p.stage === k).length; });

  const LABELS = {
    ideacion:   'Ideación',
    pitchdev:   'Pitch en Dev',
    pitch:      'Pitch Listo',
    desarrollo: 'En Desarrollo',
    produccion: 'En Producción',
  };
  const SUBS = {
    ideacion:   'Ideas activas',
    pitchdev:   'Estructurando pitch',
    pitch:      'Esperando desarrollo',
    desarrollo: 'Con equipo dev',
    produccion: 'Live 🟢',
  };

  return (
    <div>
      {/* Stats row */}
      <div className="stats-row">
        {STAGE_ORDER.map(k => (
          <div key={k} className={`stat ${k}`}>
            <div className="stat-num">{counts[k]}</div>
            <div className="stat-label">{LABELS[k]}</div>
            <div className="stat-sub">{SUBS[k]}</div>
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="kanban-board">
        {STAGE_ORDER.map(k => {
          const col = roots.filter(p => p.stage === k);
          return (
            <div key={k} className="kanban-col">
              <div className={`kanban-header ${k}`}>
                <span>{STAGES[k].icon} {LABELS[k].toUpperCase()}</span>
                <span className="kanban-count">{col.length}</span>
              </div>
              <div className="kanban-cards">
                {col.map(p => (
                  <ProjectCard key={p.id} p={p} projects={projects} onOpen={onOpen} />
                ))}
                <button
                  className="kanban-add"
                  onClick={() => {
                    const name = window.prompt('Nombre del nuevo proyecto:');
                    if (name?.trim()) onNewInStage(name.trim(), k);
                  }}
                >
                  + Nueva idea
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
