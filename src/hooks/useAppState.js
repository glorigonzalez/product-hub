import { useState, useEffect, useRef, useCallback } from 'react';
import { loadFromFirestore, saveToFirestore, resetFirestore } from '../firebase/db';
import { SEED_PROJECTS, INITIAL_NEXT_ID, INITIAL_NEXT_FB_ID, INITIAL_NEXT_ALCANCE_ID } from '../data/seedProjects';

function today() { return new Date().toISOString().split('T')[0]; }

export function useAppState() {
  const [projects,      setProjects]      = useState(SEED_PROJECTS);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [nextId,        setNextId]        = useState(INITIAL_NEXT_ID);
  const [nextFbId,      setNextFbId]      = useState(INITIAL_NEXT_FB_ID);
  const [nextAlcanceId, setNextAlcanceId] = useState(INITIAL_NEXT_ALCANCE_ID);
  const [loaded,        setLoaded]        = useState(false);

  const saveTimer = useRef(null);

  // Counters in refs so save callback always has fresh values without re-creating
  const refs = useRef({});
  refs.current = { projects, feedbackItems, nextId, nextFbId, nextAlcanceId };

  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const { projects, feedbackItems, nextId, nextFbId, nextAlcanceId } = refs.current;
      saveToFirestore({ projects, feedbackItems, nextId, nextFbId, nextAlcanceId })
        .catch(e => console.warn('Error guardando en Firebase:', e));
    }, 600);
  }, []);

  // Load from Firebase on mount
  useEffect(() => {
    loadFromFirestore(SEED_PROJECTS)
      .then(data => {
        if (data) {
          setProjects(data.projects);
          setFeedbackItems(data.feedbackItems);
          setNextId(data.nextId);
          setNextFbId(data.nextFbId);
          setNextAlcanceId(data.nextAlcanceId);
        }
      })
      .catch(e => console.warn('Error cargando desde Firebase:', e))
      .finally(() => setLoaded(true));
  }, []);

  // ── Project actions ────────────────────────────────────────────────────────

  const addProject = useCallback((name, stage = 'ideacion', parentId = null) => {
    const id = refs.current.nextId;
    const project = {
      id, name, stage, parentId,
      desc: '', leadTech: null, leadProduct: null,
      phase: null, totalPhases: null,
      startDate: null, dueDate: null,
      updated: today(),
      alcance: [], ideas: [], feedback: [],
      pitch: null, spec: null,
    };
    setProjects(prev => {
      const next = [...prev, project];
      refs.current.projects = next;
      return next;
    });
    setNextId(prev => { refs.current.nextId = prev + 1; return prev + 1; });
    scheduleSave();
    return id;
  }, [scheduleSave]);

  const updateProject = useCallback((id, changes) => {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...changes, updated: today() } : p);
      refs.current.projects = next;
      return next;
    });
    scheduleSave();
  }, [scheduleSave]);

  const deleteProject = useCallback((id) => {
    setProjects(prev => {
      const toDelete = new Set();
      const collect = (pid) => {
        toDelete.add(pid);
        prev.filter(p => p.parentId === pid).forEach(p => collect(p.id));
      };
      collect(id);
      const next = prev.filter(p => !toDelete.has(p.id));
      refs.current.projects = next;
      return next;
    });
    scheduleSave();
  }, [scheduleSave]);

  const changeStage = useCallback((id, newStage) => {
    updateProject(id, { stage: newStage });
  }, [updateProject]);

  // ── Feedback actions ───────────────────────────────────────────────────────

  const addFeedbackItem = useCallback((text, projectId = null, source = 'Manual') => {
    const id = refs.current.nextFbId;
    const item = { id, text, projectId, source, date: today(), done: false };
    setFeedbackItems(prev => {
      const next = [item, ...prev];
      refs.current.feedbackItems = next;
      return next;
    });
    setNextFbId(prev => { refs.current.nextFbId = prev + 1; return prev + 1; });
    scheduleSave();
    return id;
  }, [scheduleSave]);

  const toggleFeedbackDone = useCallback((id) => {
    setFeedbackItems(prev => {
      const next = prev.map(f => f.id === id ? { ...f, done: !f.done } : f);
      refs.current.feedbackItems = next;
      return next;
    });
    scheduleSave();
  }, [scheduleSave]);

  const deleteFeedbackItem = useCallback((id) => {
    setFeedbackItems(prev => {
      const next = prev.filter(f => f.id !== id);
      refs.current.feedbackItems = next;
      return next;
    });
    scheduleSave();
  }, [scheduleSave]);

  const assignFeedback = useCallback((id, projectId) => {
    setFeedbackItems(prev => {
      const next = prev.map(f => f.id === id ? { ...f, projectId } : f);
      refs.current.feedbackItems = next;
      return next;
    });
    scheduleSave();
  }, [scheduleSave]);

  // ── Alcance actions (within a project) ────────────────────────────────────

  const addAlcanceItem = useCallback((projectId, text) => {
    const id = refs.current.nextAlcanceId;
    const item = { id, text, done: false, assignedTo: projectId };
    updateProject(projectId, {
      alcance: [...(refs.current.projects.find(p => p.id === projectId)?.alcance || []), item]
    });
    setNextAlcanceId(prev => { refs.current.nextAlcanceId = prev + 1; return prev + 1; });
    scheduleSave();
  }, [updateProject, scheduleSave]);

  const toggleAlcanceItem = useCallback((projectId, itemId) => {
    const proj = refs.current.projects.find(p => p.id === projectId);
    if (!proj) return;
    updateProject(projectId, {
      alcance: proj.alcance.map(a => a.id === itemId ? { ...a, done: !a.done } : a)
    });
  }, [updateProject]);

  const assignAlcanceItem = useCallback((projectId, itemId, assignedTo) => {
    const proj = refs.current.projects.find(p => p.id === projectId);
    if (!proj) return;
    updateProject(projectId, {
      alcance: proj.alcance.map(a => a.id === itemId ? { ...a, assignedTo } : a)
    });
  }, [updateProject]);

  const deleteAlcanceItem = useCallback((projectId, itemId) => {
    const proj = refs.current.projects.find(p => p.id === projectId);
    if (!proj) return;
    updateProject(projectId, {
      alcance: proj.alcance.filter(a => a.id !== itemId)
    });
  }, [updateProject]);

  // ── Launch plan actions ────────────────────────────────────────────────────

  const updateLaunch = useCallback((projectId, changes) => {
    const proj = refs.current.projects.find(p => p.id === projectId);
    if (!proj) return;
    updateProject(projectId, { launch: { ...(proj.launch || { comms: [] }), ...changes } });
  }, [updateProject]);

  const addLaunchComm = useCallback((projectId, comm) => {
    const proj = refs.current.projects.find(p => p.id === projectId);
    if (!proj) return;
    const launch = proj.launch || { comms: [] };
    updateProject(projectId, {
      launch: { ...launch, comms: [...(launch.comms || []), { id: Date.now(), ...comm }] }
    });
  }, [updateProject]);

  const updateLaunchComm = useCallback((projectId, commId, changes) => {
    const proj = refs.current.projects.find(p => p.id === projectId);
    if (!proj) return;
    const launch = proj.launch || { comms: [] };
    updateProject(projectId, {
      launch: { ...launch, comms: (launch.comms || []).map(c => c.id === commId ? { ...c, ...changes } : c) }
    });
  }, [updateProject]);

  const deleteLaunchComm = useCallback((projectId, commId) => {
    const proj = refs.current.projects.find(p => p.id === projectId);
    if (!proj) return;
    const launch = proj.launch || { comms: [] };
    updateProject(projectId, {
      launch: { ...launch, comms: (launch.comms || []).filter(c => c.id !== commId) }
    });
  }, [updateProject]);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const resetData = useCallback(async () => {
    if (!window.confirm('¿Resetear todos los datos? Esta acción no se puede deshacer.')) return;
    await resetFirestore();
    window.location.reload();
  }, []);

  return {
    projects,
    feedbackItems,
    nextAlcanceId,
    loaded,
    actions: {
      addProject, updateProject, deleteProject, changeStage,
      addFeedbackItem, toggleFeedbackDone, deleteFeedbackItem, assignFeedback,
      addAlcanceItem, toggleAlcanceItem, assignAlcanceItem, deleteAlcanceItem,
      updateLaunch, addLaunchComm, updateLaunchComm, deleteLaunchComm,
      resetData,
    },
  };
}
