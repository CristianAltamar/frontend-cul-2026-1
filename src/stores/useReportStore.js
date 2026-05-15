import { create } from 'zustand';
import { getDocentes } from '../services/userService.js';
import { getProgramas } from '../services/programaService.js';
import { getPeriodos } from '../services/periodoService.js';
import { getHorarioDocente } from '../services/horarioService.js';

const DIA_ORDEN = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
};

/**
 * Verifica si dos rangos de fecha se solapan (string "YYYY-MM-DD")
 */
function rangesOverlap(s1, e1, s2, e2) {
    return s1 <= e2 && e1 >= s2;
}

/**
 * Convierte "HH:MM" a minutos totales
 */
const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

/**
 * Store Zustand para AdminReportes
 * Gestiona: filtros, datos maestros, resultados, loading, error, stats
 */
export const useReportStore = create((set, get) => ({
    // ── Estados ────────────────────────────────────────────────────────────
    filtro: {
        id: '',
        programa_id: '',
        fecha_inicio: '',
        fecha_fin: '',
    },
    docentes: [],
    programas: [],
    periodos: [],
    resultados: null,
    loading: false,
    error: '',
    stats: null,

    // ── Setters básicos ────────────────────────────────────────────────────
    setFiltro: (filtro) => set((state) => ({ filtro: { ...state.filtro, ...filtro } })),
    setDocentes: (docentes) => set({ docentes }),
    setProgramas: (programas) => set({ programas }),
    setPeriodos: (periodos) => set({ periodos }),
    setResultados: (resultados) => set({ resultados }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setStats: (stats) => set({ stats }),

    /**
     * Validar si los filtros están listos para buscar
     */
    get filtersReady() {
        const state = get();
        return (
            state.filtro.id &&
            state.filtro.programa_id &&
            state.filtro.fecha_inicio &&
            state.filtro.fecha_fin &&
            state.filtro.fecha_inicio <= state.filtro.fecha_fin
        );
    },

    /**
     * Cargar datos iniciales (docentes, programas, periodos)
     * Se ejecuta una sola vez al montar AdminReportes
     */
    loadInitialData: async () => {
        set({ loading: true, error: '' });
        try {
            const [docentes, programas, periodos] = await Promise.all([
                getDocentes(),
                getProgramas(),
                getPeriodos(),
            ]);

            // Filtrar solo docentes con rol 2
            const docentesFiltrados = Array.isArray(docentes)
                ? docentes.filter((d) => d.id_rol === 2)
                : [];

            set({
                docentes: docentesFiltrados,
                programas: Array.isArray(programas) ? programas : [],
                periodos: Array.isArray(periodos) ? periodos : [],
                loading: false,
            });
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            set({
                error: 'Error al cargar los datos. Intenta nuevamente.',
                loading: false,
            });
        }
    },

    /**
     * Generar reporte
     * Busca horarios del docente y calcula stats
     */
    handleBuscar: async () => {
        const state = get();
        
        if (!state.filtersReady) return;

        set({ loading: true, error: '', stats: null });

        try {
            // Periodos que se solapan con el rango de fechas seleccionado
            const periodosFiltrados = state.periodos.filter((p) =>
                rangesOverlap(
                    state.filtro.fecha_inicio,
                    state.filtro.fecha_fin,
                    p.fecha_inicio,
                    p.fecha_fin
                )
            );

            if (periodosFiltrados.length === 0) {
                set({
                    error: 'No hay períodos que coincidan con las fechas seleccionadas.',
                    loading: false,
                });
                return;
            }

            const periodoIds = periodosFiltrados.map((p) => p.id);

            // Obtener horarios del docente
            const horariosDocente = await getHorarioDocente(
                state.filtro.id,
                periodoIds[0],
                state.filtro.programa_id
            );

            // Estructurar resultados
            const clases = horariosDocente.map((h) => ({
                ...h,
                dia_semana: DIA_ORDEN[h.dia_semana] ?? 'Desconocido',
            }));

            // Calcular stats
            const stats = {
                totalClases: clases.length,
                totalMinutos: clases.reduce(
                    (sum, c) => sum + (toMin(c.hora_fin) - toMin(c.hora_inicio)),
                    0
                ),
                diasActivos: [...new Set(clases.map((c) => c.dia_semana))],
                periodos: periodosFiltrados.length,
            };

            // Obtener nombre de asignatura si existe en la primera clase
            const asignatura =
                clases.length > 0 ? clases[0].nombre_asignatura : 'N/A';

            set({
                resultados: {
                    docente: state.docentes.find(
                        (d) => d.id === parseInt(state.filtro.id)
                    ),
                    programa: state.programas.find(
                        (p) => p.id === parseInt(state.filtro.programa_id)
                    ),
                    periodos: periodosFiltrados,
                    clases,
                    asignatura,
                },
                stats,
                loading: false,
            });
        } catch (error) {
            console.error('Error al generar reporte:', error);
            set({
                error: 'Error al generar el reporte. Intenta nuevamente.',
                loading: false,
            });
        }
    },

    /**
     * Limpiar resultados y filtros
     */
    handleLimpiar: () => {
        set({
            filtro: {
                id: '',
                programa_id: '',
                fecha_inicio: '',
                fecha_fin: '',
            },
            resultados: null,
            error: '',
            stats: null,
        });
    },
}));
