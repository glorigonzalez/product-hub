import { STAGES, STAGE_ORDER } from '../config/stages';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  const days = Math.floor((new Date() - d) / 86400000);
  return days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days}d`;
}

export default function TableView({ projects, onOpen }) {
  // Build ordered list: for each stage, show root projects + their subs inline
  const rows = [];
  STAGE_ORDER.forEach(stKey => {
    const rootsInStage = projects.filter(p => p.stage === stKey && !p.parentId);
    // also subprojects in this stage whose parent is NOT in this stage (so they show somewhere)
    const orphanSubs = projects.filter(p => p.stage === stKey && p.parentId);

    rootsInStage.forEach(p => {
      rows.push({ project: p, isSub: false });
      // show subs of this parent regardless of sub's stage
      const subs = projects.filter(s => s.parentId === p.id);
      subs.forEach(s => rows.push({ project: s, isSub: true }));
    });

    // subs whose parent is not in this stage go at end of stage section
    orphanSubs.forEach(s => {
      const alreadyAdded = rows.find(r => r.project.id === s.id);
      if (!alreadyAdded) rows.push({ project: s, isSub: true });
    });
  });

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
          {rows.map(({ project: p, isSub }) => {
            const subs = projects.filter(s => s.parentId === p.id);
            const doneSubs = subs.filter(s => s.stage === 'produccion').length;
            const st = STAGES[p.stage];
            return (
              <tr key={p.id} className="ctrl-row" onClick={() => onOpen(p.id)}>
                <td style={{ fontWeight: isSub ? 400 : 600 }}>
                  {isSub && (
                    <span style={{ color: 'var(--primary)', fontWeight: 700, marginRight: 6, fontSize: 12 }}>↳</span>
                  )}
                  {p.name}
                </td>
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
          })}
        </tbody>
      </table>
    </div>
  );
}
