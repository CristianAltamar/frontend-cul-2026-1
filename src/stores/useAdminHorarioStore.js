import { create } from 'zustand';
import {
    getProgramas,
    getProgramaByAsignatura,
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
import {
    getFacultades,
    createFacultad,
    updateFacultad,
    deleteFacultad,
} from '../services/facultadService.js';
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
    facultades: [],
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
    setFacultades: (facultades) => set({ facultades }),
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
        const { getProgramas, getPeriodos, getJornadas, getAsignaturas, getDocentes, getGrupos, getFacultades } = get();
        set({ loading: true, error: null });
        try {
            await Promise.all([
                getProgramas(),
                getPeriodos(),
                getJornadas(),
                getAsignaturas(),
                getDocentes(),
                getGrupos(),
                getFacultades(),
            ]);
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            set({
                error: 'Error al cargar los datos iniciales',
            });
        } finally {
            set({ loading: false });
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
        try {
            const jornadas = await getJornadas();
            const jornadasNormalized = Array.isArray(jornadas)
                ? jornadas.map((jornada) => ({
                        ...jornada,
                        hora_inicio: jornada.hora_inicio ?? '',
                        hora_fin: jornada.hora_fin ?? '',
                    }))
                : [];
            set({ jornadas: jornadasNormalized });
        } catch (error) {
            console.error('Error al cargar jornadas:', error);
            set({ error: 'Error al cargar las jornadas' });
        }
    },

    createJornada: async (jornadaData) => {
        const { getJornadas } = get();
        try {
            await createJornada(jornadaData);
            await getJornadas();
        } catch (error) {
            console.error('Error al crear jornada:', error);
            throw error;
        }
    },

    updateJornada: async (id, jornadaData) => {
        const { getJornadas } = get();
        try {
            await updateJornada(id, jornadaData);
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

    getAsignaturas: async (programaId) => {
        try {
            const asignaturas = await getAsignaturas(programaId);
            const asignaturasNormalized = Array.isArray(asignaturas)
                ? asignaturas.map((asignatura) => ({
                        ...asignatura,
                        nombre: asignatura.nombre ?? '',
                    }))
                : [];
            set({ asignaturas: asignaturasNormalized });
        } catch (error) {
            console.error('Error al cargar asignaturas:', error);
            set({ error: 'Error al cargar las asignaturas' });
        }
    },

    createAsignatura: async (asignaturaData) => {
        const { getAsignaturas } = get();
        try {
            await createAsignatura(asignaturaData);
            await getAsignaturas();
        } catch (error) {
            console.error('Error al crear asignatura:', error);
            throw error;
        }
    },

    updateAsignatura: async (id, asignaturaData) => {
        const { getAsignaturas } = get();
        try {
            const updated = await updateAsignatura(id, asignaturaData);
            await getAsignaturas();
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
     * Acciones CRUD para Facultades
     */

    getFacultades: async () => {
        try {
            const facultades = await getFacultades();
            const facultadesNormalized = Array.isArray(facultades)
                ? facultades.map((facultad) => ({
                        ...facultad,
                        nombre: facultad.nombre ?? '',
                    }))
                : [];
            set({ facultades: facultadesNormalized });
        } catch (error) {
            console.error('Error al cargar facultades:', error);
            set({ error: 'Error al cargar las facultades' });
        }
    },

    createFacultad: async (facultadData) => {
        const { getFacultades } = get();
        try {
            await createFacultad(facultadData);
            await getFacultades();
        } catch (error) {
            console.error('Error al crear facultad:', error);
            throw error;
        }
    },

    updateFacultad: async (id, facultadData) => {
        const { getFacultades } = get();
        try {
            await updateFacultad(id, facultadData);
            await getFacultades();
        } catch (error) {
            console.error('Error al actualizar facultad:', error);
            throw error;
        }
    },

    deleteFacultad: async (id) => {
        try {
            await deleteFacultad(id);
            set((state) => ({
                facultades: state.facultades.filter((f) => f.id !== id),
            }));
        } catch (error) {
            console.error('Error al eliminar facultad:', error);
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
            await createGrupo(grupoData);
            await getGrupos();
        } catch (error) {
            console.error('Error al crear grupo:', error);
            throw error;
        }
    },

    updateGrupo: async (id, grupoData) => {
        const { getGrupos } = get();
        try {
            await updateGrupo(id, grupoData);
            await getGrupos();
            
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

    getProgramas: async () => {
        try {
            const programas = await getProgramas();
            const programasNormalized = Array.isArray(programas)
                ? programas.map((programa) => ({
                        ...programa,
                    }))
                : [];
            set({ programas: programasNormalized });
        } catch (error) {
            console.error('Error al cargar programas:', error);
            set({ error: 'Error al cargar los programas' });
        }
    },

    getProgramaByAsignatura: async (asignatura_id) => {
        try {
            const programa = await getProgramaByAsignatura(asignatura_id);
            set({ filtro: { ...get().filtro, programa } });
            return programa;
        } catch (error) {
            console.error('Error al cargar programa por asignatura:', error);
            set({ error: 'Error al cargar el programa para la asignatura seleccionada' });
        }
    },

    createPrograma: async (programaData) => {
        const { getProgramas } = get();
        try {
            await createPrograma(programaData);
            await getProgramas();
        } catch (error) {
            console.error('Error al crear programa:', error);
            throw error;
        }
    },

    updatePrograma: async (id, programaData) => {
        const { getProgramas } = get();
        try {
            await updatePrograma(id, programaData);
            await getProgramas();
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

    /**     
     * get Docentes
     */

    getDocentes: async () => {
        try {
            const docentes = await getDocentes();
            set({ docentes });
        } catch (error) {
            console.error('Error al cargar docentes:', error);
            set({ error: 'Error al cargar los docentes' });
        }
    },
}));
