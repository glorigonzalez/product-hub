import { STAGES, STAGE_ORDER } from '../config/stages';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  const days = Math.floor((new Date() - d) / 86400000);
  return days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days}d`;
}

export default function TableView({ projects, onOpen }) {
  const roots = projects.filter(p => !p.parentId);

  return (
    <div style={{ overflowX: 'auto', padding: '0 24px 32px' }}>
      <table className="ctrl-table">
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Estado</th>
            <th>Lead Dev</th>
            <th>Lead Producto</th>
            <th>Subs</th>
            <th>Pitch</th>
            <th>Actualizado</th>
          </tr>
        </thead>
        <tbody>
          {STAGE_ORDER.flatMap(stKey => {
            const inStage = roots.filter(p => p.stage === stKey);
            if (!inStage.length) return [];
            return inStage.map((p, i) => {
              const subs = projects.filter(s => s.parentId === p.id);
              const doneSubs = subs.filter(s => s.stage === 'produccion').length;
              const st = STAGES[p.stage];
              return (
                <tr key={p.id} className="ctrl-row" onClick={() => onOpen(p.id)}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>
                    <span className={`stage-pill ${p.stage}`}>{st.icon} {st.short}</span>
                  </td>
                  <td>{p.leadTech || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                  <td>{p.leadProduct || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                  <td>
                    {subs.length > 0
                      ? <span className="badge badge-blue">{doneSubs}/{subs.length}</span>
                      : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                  <td>
                    {p.pitch
                      ? <span className="badge badge-green">✓</span>
                      : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{fmt(p.updated)}</td>
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  );
}
