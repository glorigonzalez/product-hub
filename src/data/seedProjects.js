export const SEED_PROJECTS = [
  {
    id: 3, name: 'Control Administrativo', stage: 'ideacion',
    desc: '', leadTech: null, leadProduct: null, phase: null, totalPhases: null,
    parentId: null, updated: '2026-03-20', startDate: null, dueDate: null,
    alcance: [], ideas: [], feedback: [], pitch: null, spec: null,
  },
  {
    id: 1, name: 'Control de Materiales', stage: 'pitchdev',
    desc: 'Módulo unificado que conecta el ciclo completo: solicitud → compra → recepción en bodega → salida.',
    leadTech: null, leadProduct: null, phase: null, totalPhases: null,
    parentId: null, updated: '2026-03-20', startDate: null, dueDate: null,
    alcance: [], ideas: [], feedback: [],
    pitch: null, spec: null,
  },
  {
    id: 2, name: 'Órdenes de Cambio para Subcontratos', stage: 'pitch',
    desc: 'Gestión de modificaciones de alcance en órdenes de compra con trazabilidad completa, versionado y reflejo automático en presupuesto.',
    leadTech: null, leadProduct: null, phase: null, totalPhases: null,
    parentId: null, updated: '2026-03-20', startDate: null, dueDate: null,
    alcance: [], ideas: [], feedback: [], pitch: null, spec: null,
  },
  {
    id: 4, name: 'UX Solicitudes de Materiales', stage: 'pitchdev',
    desc: 'Actualización UX de la vista de pedidos: migración a tabla, acciones masivas, crear pedido manual y carga por PDF.',
    leadTech: null, leadProduct: null, phase: null, totalPhases: null,
    parentId: 1, updated: '2026-03-20', startDate: null, dueDate: null,
    alcance: [], ideas: [], feedback: [], pitch: null, spec: null,
  },
  {
    id: 5, name: 'Estructura Datos Catálogo de Materiales', stage: 'pitchdev',
    desc: 'Diseño del objeto material con clave única, flujo de aprobación al catálogo e integraciones con Inventario y Listado de Materiales.',
    leadTech: 'Adrian', leadProduct: null, phase: null, totalPhases: null,
    parentId: 1, updated: '2026-03-20', startDate: null, dueDate: null,
    alcance: [], ideas: [], feedback: [], pitch: null, spec: null,
  },
];

export const INITIAL_NEXT_ID        = 6;
export const INITIAL_NEXT_FB_ID     = 4;
export const INITIAL_NEXT_ALCANCE_ID = 1;
