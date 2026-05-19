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
    getGruposByPeriodoJornada,
    createGrupo,
    updateGrupo,
    deleteGrupo,
} from '../services/grupoService.js';
import { getDocentes } from '../services/userService.js';
import { getDisponibilidadDocente } from '../services/disponibilidadService.js';
import { getHorarioDocente } from '../services/horarioService.js';
import { parseTime } from "../utils/schedule.js";

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
    asignaturasFiltradas: [],
    docentes: [],
    grupos: [],
    gruposFiltrados: [],
    asignaciones: [],
    disponibilidadDocente: [],
    filtro: {
        periodo: '',
        jornada: '',
        docente: '',
        programa: '',
    },
    activeTab: 'horario',
    loading: false,
    loadingDispAsig: false,
    error: null,

    // ── Acciones de actualización individual ────────────────────────────────
    setProgramas: (programas) => set({ programas }),
    setPeriodos: (periodos) => set({ periodos }),
    setJornadas: (jornadas) => set({ jornadas }),
    setAsignaturas: (asignaturas) => set({ asignaturas }),
    setAsignaturasFiltradas: (asignaturasFiltradas) => set({ asignaturasFiltradas }),
    setDocentes: (docentes) => set({ docentes }),
    setGrupos: (grupos) => set({ grupos }),
    setGruposFiltrados: (gruposFiltrados) => set({ gruposFiltrados }),
    setAsignaciones: (asignaciones) => set({ asignaciones }),
    setFiltro: (filtro) => set((state) => ({ filtro: { ...state.filtro, ...filtro } })),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setLoading: (loading) => set({ loading }),
    setLoadingDispAsig: (loadingDispAsig) => set({ loadingDispAsig }),
    setError: (error) => set({ error }),
    setDisponibilidadDocente: (disponibilidad) => set({ disponibilidadDocente: disponibilidad }),

    // ── Acciones útiles ────────────────────────────────────────────────────
    resetFiltro: () =>
        set({
            filtro: {
                periodo: '',
                jornada: '',
                docente: '',
                programa: '',
            },
        }),

    isDisponible: (dia, horaInicio, horaFin) => {
        const { disponibilidadDocente } = get();
        if (!disponibilidadDocente.length) return null;
        const diaNum = dia;
        const aStart = parseTime(horaInicio);
        const aEnd   = parseTime(horaFin);
        return disponibilidadDocente.some(s =>
            s.dia_semana === diaNum &&
            parseTime(s.hora_inicio) < aEnd &&
            parseTime(s.hora_fin)   > aStart
        );
    },

    getAsignacionPropia: (dia, hora) => {
        const { asignaciones, filtro } = get();

        return (asignaciones.find(a => 
            a?.dia_semana  === dia &&
            a?.hora_inicio === hora &&
            a?.id_periodo  === parseInt(filtro.periodo?.id) &&
            a?.id_jornada  === parseInt(filtro.jornada?.id) &&
            a?.id_docente  === parseInt(filtro.docente?.id)
        )) || null;
    },

    isPeriodoActual: (periodo) => {
        const hoy = new Date();
        const inicio = new Date(...((periodo?.fecha_inicio || '').split("-").map((v, i) => i === 1 ? parseInt(v) - 1 : parseInt(v)))); // Ajuste de mes
        const fin = new Date(...((periodo?.fecha_fin || '').split("-").map((v, i) => i === 1 ? parseInt(v) - 1 : parseInt(v)))); // Ajuste de mes
        return hoy >= inicio && hoy <= fin;
    },

    /**
     * Cargar disponibilidad y horarios del docente
     * Se ejecuta cuando se cambian periodo, jornada o docente
     */
    loadDisponibilidadAndHorarios: async (docenteId, periodoId, jornadaId) => {
        const { setLoadingDispAsig } = get();
        if (!docenteId || !periodoId) {
            set({
                disponibilidadDocente: [],
                asignaciones: [],
            });
            return;
        }

        try {
            setLoadingDispAsig(true);
            const [disponibilidad, horarios] = await Promise.all([
                getDisponibilidadDocente(docenteId, periodoId),
                getHorarioDocente(docenteId, periodoId),
            ]);

            set({
                disponibilidadDocente: Array.isArray(disponibilidad) ? disponibilidad : [],
                asignaciones: Array.isArray(horarios) ? horarios : [],
            });
        } catch (error) {
            console.error('Error al cargar disponibilidad y horarios:', error);
            set({
                disponibilidadDocente: [],
                asignaciones: [],
                error: 'Error al cargar disponibilidad y horarios',
            });
        } finally {
            setLoadingDispAsig(false);
        }
    },

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
                gruposFiltrados: [],
                asignaturasFiltradas: [],
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

    loadGruposByPeriodoJornada: async (periodoId, jornadaId) => {
        if (!periodoId || !jornadaId) {
            set({ gruposFiltrados: [] });
            return;
        }

        try {
            const grupos = await getGruposByPeriodoJornada(periodoId, jornadaId);
            const gruposNormalized = Array.isArray(grupos)
                ? grupos.map((grupo) => ({
                        ...grupo,
                        nombre: grupo.codigo_grupo ?? grupo.nombre,
                        programa_id: grupo.id_programa ?? grupo.programa_id ?? null,
                        semestre: grupo.semestre ?? null,
                    }))
                : [];
            set({ gruposFiltrados: gruposNormalized });
        } catch (error) {
            console.error('Error al cargar grupos por periodo y jornada:', error);
            set({ error: 'Error al cargar los grupos para el periodo y jornada seleccionados' });
        }
    },

    loadAsignaturasByPrograma: async (programaId) => {
        if (!programaId) {
            set({ asignaturasFiltradas: [] });
            return;
        }

        try {
            const asignaturas = await getAsignaturas(programaId);
            const asignaturasNormalized = Array.isArray(asignaturas)
                ? asignaturas.map((asignatura) => ({
                        ...asignatura,
                        programa_id: asignatura.id_programa ?? asignatura.programa_id,
                        codigo: asignatura.codigo ?? '',
                        creditos: asignatura.creditos ?? '',
                    }))
                : [];
            set({ asignaturasFiltradas: asignaturasNormalized });
        } catch (error) {
            console.error('Error al cargar asignaturas por programa:', error);
            set({ error: 'Error al cargar las asignaturas para el programa seleccionado' });
        }
    },

    /**
     * Acciones CRUD para Periodos
     */

    getPeriodos: async () => {
        const { isPeriodoActual } = get();
        try {
            const periodos = await getPeriodos();
            const periodosNormalized = Array.isArray(periodos)
                ? periodos.map((periodo) => ({
                        ...periodo,
                        inicio: periodo.fecha_inicio ?? periodo.inicio,
                        fin: periodo.fecha_fin ?? periodo.fin,
                        activo: periodo.activo ?? false,
                        actual: isPeriodoActual(periodo)
                    }))
                : [];
            set({ periodos: periodosNormalized });
        } catch (error) {
            console.error('Error al cargar periodos:', error);
            set({ error: 'Error al cargar los periodos' });
        }
    },

    createPeriodo: async (periodoData) => {
        const { getPeriodos } = get();
        try {
            const newPeriodo = await createPeriodo(periodoData);
            await getPeriodos();
            return newPeriodo;
        } catch (error) {
            console.error('Error al crear período:', error);
            throw error;
        }
    },

    updatePeriodo: async (id, periodoData) => {
        const { getPeriodos } = get();
        try {
            const updated = await updatePeriodo(id, periodoData);
            await getPeriodos();
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

    getJornadas: async () => {
        console.log("Cargando jornadas...");
        try {
            const jornadas = await getJornadas();
            const jornadasNormalized = Array.isArray(jornadas)
                ? jornadas.map((jornada) => ({
                        ...jornada,
                        hora_inicio: jornada.hora_inicio ?? '',
                        hora_fin: jornada.hora_fin ?? '',
                    }))
                : [];
            console.log("Jornadas normalizadas:", jornadasNormalized);
            set({ jornadas: jornadasNormalized });
        } catch (error) {
            console.error('Error al cargar jornadas:', error);
            set({ error: 'Error al cargar las jornadas' });
        }
    },

    createJornada: async (jornadaData) => {
        const { getJornadas } = get();
        try {
            const newJornada = await createJornada(jornadaData);
            await getJornadas();
        } catch (error) {
            console.error('Error al crear jornada:', error);
            throw error;
        }
    },

    updateJornada: async (id, jornadaData) => {
        const { getJornadas } = get();
        try {
            const updated = await updateJornada(id, jornadaData);
            await getJornadas();
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
    getGrupos: async () => {
        try {
            const grupos = await getGrupos();
            const gruposNormalized = Array.isArray(grupos)
                ? grupos.map((grupo) => ({
                        ...grupo,
                        nombre: grupo.codigo_grupo ?? grupo.nombre,
                        programa_id: grupo.id_programa ?? grupo.programa_id ?? null,
                        semestre: grupo.semestre ?? null,
                    }))
                : [];
            set({ grupos: gruposNormalized });
        } catch (error) {
            console.error('Error al cargar grupos:', error);
            set({ error: 'Error al cargar los grupos' });
        }
    },

    createGrupo: async (grupoData) => {
        const { getGrupos } = get();
        try {
            const newGrupo = await createGrupo(grupoData);
            getGrupos();
            return newGrupo;
        } catch (error) {
            console.error('Error al crear grupo:', error);
            throw error;
        }
    },

    updateGrupo: async (id, grupoData) => {
        const { getGrupos } = get();
        try {
            await updateGrupo(id, grupoData);
            getGrupos();
            
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
