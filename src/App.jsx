import { useState, useCallback } from 'react';
import { useAppState } from './hooks/useAppState';
import Header from './components/Header';
import Toast from './components/Toast';
import KanbanView from './components/KanbanView';
import TableView from './components/TableView';
import FeedbackView from './components/FeedbackView';
import DevView from './components/DevView';
import LaunchView from './components/LaunchView';
import ProjectModal from './components/ProjectModal';

export default function App() {
  const { projects, feedbackItems, clients, nextAlcanceId, loaded, actions } = useAppState();

  const [mainTab,    setMainTab]    = useState('kanban');
  const [search,     setSearch]     = useState('');
  const [toast,      setToast]      = useState(null);
  const [modalState, setModalState] = useState({ open: false, projectId: null, initialTab: null });

  const showToast = useCallback((msg, icon = '✅') => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const openProject = useCallback((id) => {
    setModalState({ open: true, projectId: id, initialTab: null });
    document.body.style.overflow = 'hidden';
  }, []);

  const openProjectOnLaunch = useCallback((id) => {
    setModalState({ open: true, projectId: id, initialTab: 'launch' });
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ open: false, projectId: null });
    document.body.style.overflow = '';
  }, []);

  const filteredProjects = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!loaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 18, color: 'var(--muted)' }}>
        Cargando…
      </div>
    );
  }

  const activeProject = modalState.projectId
    ? projects.find(p => p.id === modalState.projectId) ?? null
    : null;

  return (
    <>
      <Header
        search={search}
        onSearch={setSearch}
        onNewProject={() => {
          const name = window.prompt('Nombre del proyecto:');
          if (!name?.trim()) return;
          const id = actions.addProject(name.trim());
          showToast(`Proyecto "${name.trim()}" creado`, '🆕');
          openProject(id);
        }}
        onExport={() => exportData(projects, feedbackItems)}
        onReset={actions.resetData}
      />

      {/* Tab bar */}
      <div className="tab-bar">
        {[
          { key: 'kanban',   label: `Kanban ${filteredProjects.filter(p => !p.parentId).length}` },
          { key: 'table',    label: `Tabla de Control ${filteredProjects.filter(p => !p.parentId).length}` },
          { key: 'feedback', label: `Feedback Inbox ${feedbackItems.filter(f => !f.done).length}` },
          { key: 'dev',      label: 'Por Desarrollador' },
          { key: 'launch',   label: `🚀 Lanzamientos${projects.filter(p => p.launch).length > 0 ? ` ${projects.filter(p => p.launch).length}` : ''}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`tab-btn${mainTab === key ? ' active' : ''}`}
            onClick={() => setMainTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="main-content">
        {mainTab === 'kanban'   && (
          <KanbanView
            projects={filteredProjects}
            onOpen={openProject}
            onNewInStage={(name, stage) => {
              const id = actions.addProject(name, stage);
              showToast(`Proyecto "${name}" creado`, '🆕');
              openProject(id);
            }}
          />
        )}
        {mainTab === 'table'    && <TableView    projects={filteredProjects} onOpen={openProject} />}
        {mainTab === 'feedback' && (
          <FeedbackView
            feedbackItems={feedbackItems}
            projects={projects}
            clients={clients}
            actions={actions}
            showToast={showToast}
          />
        )}
        {mainTab === 'dev'    && <DevView projects={projects} onOpen={openProject} />}
        {mainTab === 'launch' && <LaunchView projects={projects} onOpenLaunch={openProjectOnLaunch} />}
      </div>

      {modalState.open && activeProject && (
        <ProjectModal
          project={activeProject}
          projects={projects}
          clients={clients}
          nextAlcanceId={nextAlcanceId}
          actions={actions}
          onClose={closeModal}
          onOpen={openProject}
          showToast={showToast}
          initialTab={modalState.initialTab}
        />
      )}

      {toast && <Toast msg={toast.msg} icon={toast.icon} />}
    </>
  );
}

// ── Export helper ────────────────────────────────────────────────────────────
function exportData(projects, feedbackItems) {
  const roots = projects.filter(p => !p.parentId);
  let text = `# Product Hub Export — ${new Date().toLocaleDateString('es-CR')}\n\n`;
  roots.forEach(p => {
    const subs = projects.filter(s => s.parentId === p.id);
    text += `## ${p.name} [${p.stage}]\n`;
    if (p.desc) text += `${p.desc}\n`;
    if (p.pitch) text += `\n### Pitch\n${p.pitch}\n`;
    if (p.spec)  text += `\n### Spec\n${p.spec}\n`;
    if (subs.length) {
      text += `\nSubproyectos:\n`;
      subs.forEach(s => text += `  - ${s.name} [${s.stage}]\n`);
    }
    text += '\n---\n\n';
  });
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `product-hub-${Date.now()}.txt`;
  a.click();
}
