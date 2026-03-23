export default function Header({ search, onSearch, onNewProject, onExport, onReset }) {
  return (
    <header>
      <div className="logo">
        <div className="logo-icon">P</div>
        Product Hub
      </div>

      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="Buscar proyectos..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      <div className="header-right">
        <button className="btn" onClick={onExport} title="Exportar datos">📋 Exportar</button>
        <button className="btn" onClick={onReset}  title="Resetear datos" style={{ color: '#ef4444' }}>↺ Reset</button>
        <button className="btn btn-primary" onClick={onNewProject}>+ Nueva Idea</button>
      </div>
    </header>
  );
}
