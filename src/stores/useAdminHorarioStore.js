import { create } from 'zustand';
import {
    getProgramas,
    createPrograma,
    updatePrograma,
    deletePrograma,
} from '../services/programaService.js';
import {
    getJornadas,
    createJornada,
    updateJornada,
    deleteJornada,
} from '../services/jornadaService.js';
import {
    getPeriodos,
    createPeriodo,
    updatePeriodo,
    deletePeriodo,
} from '../services/periodoService.js';
import {
    getAsignaturas,
    createAsignatura,
    updateAsignatura,
    deleteAsignatura,
} from '../services/asignaturaService.js';
import {
    getGrupos,
    createGrupo,
    updateGrupo,
    deleteGrupo,
} from '../services/grupoService.js';
import { getDocentes } from '../services/userService.js';

/**
 * Store Zustand para AdminHorario
 * Gestiona: programas, periodos, jornadas, asignaturas, docentes, grupos, asignaciones, filtro, tab activo
 */
export const useAdminHorarioStore = create((set, get) => ({
    // ── Estados ────────────────────────────────────────────────────────────
    programas: [],
    periodos: [],
    jornadas: [],
    asignaturas: [],
    docentes: [],
    grupos: [],
    asignaciones: [],
    filtro: {
        periodo_id: '',
        jornada_id: '',
        docente_id: '',
        programa_id: '',
    },
    activeTab: 'horario',
    loading: false,
    error: null,

    // ── Acciones de actualización individual ────────────────────────────────
    setProgramas: (programas) => set({ programas }),
    setPeriodos: (periodos) => set({ periodos }),
    setJornadas: (jornadas) => set({ jornadas }),
    setAsignaturas: (asignaturas) => set({ asignaturas }),
    setDocentes: (docentes) => set({ docentes }),
    setGrupos: (grupos) => set({ grupos }),
    setAsignaciones: (asignaciones) => set({ asignaciones }),
    setFiltro: (filtro) => set({ filtro }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // ── Acciones útiles ────────────────────────────────────────────────────
    resetFiltro: () =>
        set({
            filtro: {
                periodo_id: '',
                jornada_id: '',
                docente_id: '',
                programa_id: '',
            },
        }),

    /**
     * Cargar todos los datos iniciales
     * Se ejecuta una sola vez al montar AdminHorario
     */
    loadAllData: async () => {
        set({ loading: true, error: null });
        try {
            const [p, per, j, a, d, g] = await Promise.all([
                getProgramas(),
                getPeriodos(),
                getJornadas(),
                getAsignaturas(),
                getDocentes(),
                getGrupos(),
            ]);

            // Normalizar y mapear datos
            const programasNormalized = Array.isArray(p)
                ? p.map((programa) => ({
                        ...programa,
                        facultad_id: programa.id_facultad ?? programa.facultad_id,
                    }))
                : [];

            const periodosNormalized = Array.isArray(per)
                ? per.map((periodo) => ({
                        ...periodo,
                        inicio: periodo.fecha_inicio ?? periodo.inicio,
                        fin: periodo.fecha_fin ?? periodo.fin,
                        activo: periodo.activo ?? false,
                    }))
                : [];

            const jornadasNormalized = Array.isArray(j) ? j : [];

            const asignaturasNormalized = Array.isArray(a)
                ? a.map((asignatura) => ({
                        ...asignatura,
                        programa_id: asignatura.id_programa ?? asignatura.programa_id,
                        codigo: asignatura.codigo ?? '',
                        creditos: asignatura.creditos ?? '',
                    }))
                : [];

            const docentesNormalized = Array.isArray(d) ? d : [];

            const gruposNormalized = Array.isArray(g)
                ? g.map((grupo) => ({
                        ...grupo,
                        nombre: grupo.codigo_grupo ?? grupo.nombre,
                        programa_id: grupo.id_programa ?? grupo.programa_id ?? null,
                        semestre: grupo.semestre ?? null,
                    }))
                : [];

            set({
                programas: programasNormalized,
                periodos: periodosNormalized,
                jornadas: jornadasNormalized,
                asignaturas: asignaturasNormalized,
                docentes: docentesNormalized,
                grupos: gruposNormalized,
                loading: false,
            });
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            set({
                error: 'Error al cargar los datos iniciales',
                loading: false,
            });
        }
    },

    /**
     * Acciones CRUD para Periodos
     */
    createPeriodo: async (periodoData) => {
        try {
            const newPeriodo = await createPeriodo(periodoData);
            set((state) => ({
                periodos: [...state.periodos, newPeriodo],
            }));
            return newPeriodo;
        } catch (error) {
            console.error('Error al crear período:', error);
            throw error;
        }
    },

    updatePeriodo: async (id, periodoData) => {
        try {
            const updated = await updatePeriodo(id, periodoData);
            set((state) => ({
                periodos: state.periodos.map((p) => (p.id === id ? updated : p)),
            }));
            return updated;
        } catch (error) {
            console.error('Error al actualizar período:', error);
            throw error;
        }
    },

    deletePeriodo: async (id) => {
        try {
            await deletePeriodo(id);
            set((state) => ({
                periodos: state.periodos.filter((p) => p.id !== id),
            }));
        } catch (error) {
            console.error('Error al eliminar período:', error);
            throw error;
        }
    },

    /**
     * Acciones CRUD para Jornadas
     */
    createJornada: async (jornadaData) => {
        try {
            const newJornada = await createJornada(jornadaData);
            set((state) => ({
                jornadas: [...state.jornadas, newJornada],
            }));
            return newJornada;
        } catch (error) {
            console.error('Error al crear jornada:', error);
            throw error;
        }
    },

    updateJornada: async (id, jornadaData) => {
        try {
            const updated = await updateJornada(id, jornadaData);
            set((state) => ({
                jornadas: state.jornadas.map((j) => (j.id === id ? updated : j)),
            }));
            return updated;
        } catch (error) {
            console.error('Error al actualizar jornada:', error);
            throw error;
        }
    },

    deleteJornada: async (id) => {
        try {
            await deleteJornada(id);
            set((state) => ({
                jornadas: state.jornadas.filter((j) => j.id !== id),
            }));
        } catch (error) {
            console.error('Error al eliminar jornada:', error);
            throw error;
        }
    },

    /**
     * Acciones CRUD para Asignaturas
     */
    createAsignatura: async (asignaturaData) => {
        try {
            const newAsignatura = await createAsignatura(asignaturaData);
            set((state) => ({
                asignaturas: [...state.asignaturas, newAsignatura],
            }));
            return newAsignatura;
        } catch (error) {
            console.error('Error al crear asignatura:', error);
            throw error;
        }
    },

    updateAsignatura: async (id, asignaturaData) => {
        try {
            const updated = await updateAsignatura(id, asignaturaData);
            set((state) => ({
                asignaturas: state.asignaturas.map((a) =>
                    a.id === id ? updated : a
                ),
            }));
            return updated;
        } catch (error) {
            console.error('Error al actualizar asignatura:', error);
            throw error;
        }
    },

    deleteAsignatura: async (id) => {
        try {
            await deleteAsignatura(id);
            set((state) => ({
                asignaturas: state.asignaturas.filter((a) => a.id !== id),
            }));
        } catch (error) {
            console.error('Error al eliminar asignatura:', error);
            throw error;
        }
    },

    /**
     * Acciones CRUD para Grupos
     */
    createGrupo: async (grupoData) => {
        try {
            const newGrupo = await createGrupo(grupoData);
            set((state) => ({
                grupos: [...state.grupos, newGrupo],
            }));
            return newGrupo;
        } catch (error) {
            console.error('Error al crear grupo:', error);
            throw error;
        }
    },

    updateGrupo: async (id, grupoData) => {
        try {
            const updated = await updateGrupo(id, grupoData);
            set((state) => ({
                grupos: state.grupos.map((g) => (g.id === id ? updated : g)),
            }));
            return updated;
        } catch (error) {
            console.error('Error al actualizar grupo:', error);
            throw error;
        }
    },

    deleteGrupo: async (id) => {
        try {
            await deleteGrupo(id);
            set((state) => ({
                grupos: state.grupos.filter((g) => g.id !== id),
            }));
        } catch (error) {
            console.error('Error al eliminar grupo:', error);
            throw error;
        }
    },

    /**
     * Acciones CRUD para Programas
     */
    createPrograma: async (programaData) => {
        try {
            const newPrograma = await createPrograma(programaData);
            set((state) => ({
                programas: [...state.programas, newPrograma],
            }));
            return newPrograma;
        } catch (error) {
            console.error('Error al crear programa:', error);
            throw error;
        }
    },

    updatePrograma: async (id, programaData) => {
        try {
            const updated = await updatePrograma(id, programaData);
            set((state) => ({
                programas: state.programas.map((p) =>
                    p.id === id ? updated : p
                ),
            }));
            return updated;
        } catch (error) {
            console.error('Error al actualizar programa:', error);
            throw error;
        }
    },

    deletePrograma: async (id) => {
        try {
            await deletePrograma(id);
            set((state) => ({
                programas: state.programas.filter((p) => p.id !== id),
            }));
        } catch (error) {
            console.error('Error al eliminar programa:', error);
            throw error;
        }
    },
}));
