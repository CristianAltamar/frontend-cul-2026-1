import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";
import { LoadingOverlay } from "../components/LoadingSpinner.jsx";

// ── Clases Tailwind reutilizables (mismo sistema de diseño que AdminHorario) ──
const cx = {
    input:        "w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed",
    label:        "block text-xs font-medium text-neutral-600 mb-1",
    btnPrimary:   "px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-neutral-800 active:bg-neutral-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed",
    btnSecondary: "px-4 py-2 bg-white text-neutral-700 border border-neutral-200 text-sm rounded-lg hover:bg-neutral-50 transition-colors font-medium",
    card:         "bg-white rounded-2xl border border-neutral-100 shadow-sm",
    badge:        "px-2 py-0.5 rounded-full text-xs font-medium",
    th:           "px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider text-left",
    td:           "px-5 py-3.5 text-sm text-neutral-700",
};

// ═════════════════════════════════════════════════════════════════════════════
// MOCK DATA — eliminar y reemplazar con fetch al backend cuando esté disponible
// ═════════════════════════════════════════════════════════════════════════════

// TODO: Cargar desde GET /get_docentes?rol=2
const MOCK_DOCENTES = [
    { id: 1, nombre: "Carlos Pérez"    },
    { id: 2, nombre: "Ana González"    },
    { id: 3, nombre: "Luis Martínez"   },
    { id: 4, nombre: "María Rodríguez" },
];

// TODO: Cargar desde GET /get_programas
const MOCK_PROGRAMAS = [
    { id: 1, nombre: "Ingeniería de Sistemas",     codigo: "ISI" },
    { id: 2, nombre: "Ingeniería Civil",           codigo: "ICI" },
    { id: 3, nombre: "Administración de Empresas", codigo: "ADE" },
    { id: 4, nombre: "Contaduría Pública",         codigo: "COP" },
    { id: 5, nombre: "Enfermería",                 codigo: "ENF" },
];

// TODO: Cargar desde GET /get_periodos
const MOCK_PERIODOS = [
    { id: 1, nombre: "2026-1", inicio: "2026-01-15", fin: "2026-06-20" },
    { id: 2, nombre: "2025-2", inicio: "2025-07-10", fin: "2025-12-05" },
];

// TODO: Cargar desde GET /get_asignaturas
const MOCK_ASIGNATURAS = [
    { id: 1, nombre: "Bases de Datos",         codigo: "BD101",  creditos: 3, programa_id: 1 },
    { id: 2, nombre: "Algoritmos",             codigo: "ALG102", creditos: 4, programa_id: 1 },
    { id: 3, nombre: "Cálculo I",              codigo: "CAL101", creditos: 4, programa_id: 1 },
    { id: 4, nombre: "Contabilidad I",         codigo: "CON101", creditos: 3, programa_id: 3 },
    { id: 5, nombre: "Costos",                 codigo: "COS201", creditos: 3, programa_id: 4 },
    { id: 6, nombre: "Anatomía",               codigo: "ANA101", creditos: 4, programa_id: 5 },
    { id: 7, nombre: "Estructuras de Datos",   codigo: "ED201",  creditos: 3, programa_id: 1 },
    { id: 8, nombre: "Ingeniería de Software", codigo: "IS301",  creditos: 4, programa_id: 1 },
];

// TODO: Cargar desde GET /get_grupos
const MOCK_GRUPOS = [
    { id: 1, nombre: "Grupo 01", semestre: 1, programa_id: 1 },
    { id: 2, nombre: "Grupo 02", semestre: 1, programa_id: 1 },
    { id: 3, nombre: "Grupo 01", semestre: 2, programa_id: 1 },
    { id: 5, nombre: "Grupo 01", semestre: 1, programa_id: 2 },
    { id: 7, nombre: "Grupo 01", semestre: 1, programa_id: 3 },
    { id: 9, nombre: "Grupo 01", semestre: 1, programa_id: 5 },
];

// TODO: Cargar desde GET /get_asignaciones_horario
// Estructura: { id, docente_id, programa_id, asignatura_id, grupo_id,
//               dia, hora_inicio, hora_fin, aula, periodo_id, jornada_id }
const MOCK_ASIGNACIONES = [
    { id: 1,  docente_id: 1, programa_id: 1, asignatura_id: 1, grupo_id: 1, dia: "Lunes",     hora_inicio: "07:00", hora_fin: "09:00", aula: "A-101", periodo_id: 1 },
    { id: 2,  docente_id: 1, programa_id: 1, asignatura_id: 2, grupo_id: 2, dia: "Miércoles", hora_inicio: "07:00", hora_fin: "09:00", aula: "B-202", periodo_id: 1 },
    { id: 3,  docente_id: 1, programa_id: 1, asignatura_id: 3, grupo_id: 3, dia: "Viernes",   hora_inicio: "07:00", hora_fin: "09:00", aula: "C-303", periodo_id: 1 },
    { id: 4,  docente_id: 2, programa_id: 3, asignatura_id: 4, grupo_id: 7, dia: "Lunes",     hora_inicio: "13:00", hora_fin: "15:00", aula: "D-101", periodo_id: 1 },
    { id: 5,  docente_id: 2, programa_id: 3, asignatura_id: 4, grupo_id: 7, dia: "Martes",    hora_inicio: "14:00", hora_fin: "16:00", aula: "D-101", periodo_id: 1 },
    { id: 6,  docente_id: 3, programa_id: 1, asignatura_id: 7, grupo_id: 1, dia: "Lunes",     hora_inicio: "09:00", hora_fin: "11:00", aula: "E-201", periodo_id: 1 },
    { id: 7,  docente_id: 3, programa_id: 1, asignatura_id: 8, grupo_id: 2, dia: "Miércoles", hora_inicio: "09:00", hora_fin: "11:00", aula: "E-202", periodo_id: 1 },
    { id: 8,  docente_id: 3, programa_id: 2, asignatura_id: 3, grupo_id: 5, dia: "Martes",    hora_inicio: "07:00", hora_fin: "09:00", aula: "F-101", periodo_id: 1 },
    { id: 9,  docente_id: 4, programa_id: 5, asignatura_id: 6, grupo_id: 9, dia: "Lunes",     hora_inicio: "18:00", hora_fin: "20:00", aula: "G-101", periodo_id: 1 },
    { id: 10, docente_id: 4, programa_id: 5, asignatura_id: 6, grupo_id: 9, dia: "Jueves",    hora_inicio: "18:00", hora_fin: "20:00", aula: "G-101", periodo_id: 1 },
    { id: 11, docente_id: 1, programa_id: 1, asignatura_id: 1, grupo_id: 1, dia: "Lunes",     hora_inicio: "07:00", hora_fin: "09:00", aula: "A-101", periodo_id: 2 },
    { id: 12, docente_id: 1, programa_id: 1, asignatura_id: 2, grupo_id: 2, dia: "Martes",    hora_inicio: "10:00", hora_fin: "12:00", aula: "B-101", periodo_id: 2 },
];

// ── Utilidades ─────────────────────────────────────────────────────────────────
const DIA_ORDEN = { Lunes: 1, Martes: 2, "Miércoles": 3, Jueves: 4, Viernes: 5, Sábado: 6 };

// Verifica si dos rangos de fecha se solapan (string "YYYY-MM-DD")
function rangesOverlap(s1, e1, s2, e2) {
    return s1 <= e2 && e1 >= s2;
}

// Convierte "HH:MM" a minutos totales
const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
export function AdminReportes() {
    const navigate = useNavigate();

    // ── Filtros del reporte ────────────────────────────────────────────────────
    const [filtro, setFiltro] = useState({
        docente_id:   "",
        programa_id:  "",
        fecha_inicio: "",
        fecha_fin:    "",
    });

    // ── Estado de la búsqueda ─────────────────────────────────────────────────
    const [loading,    setLoading]    = useState(false);
    const [resultados, setResultados] = useState(null); // null = sin buscar aún
    const [error,      setError]      = useState("");

    // ── Auth: solo admins (rol 1) ─────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (!decoded || decoded.rol !== 1) { navigate("/login"); return; }
    }, []);

    // ── Programas disponibles para el docente seleccionado ────────────────────
    // Solo muestra programas en los que el docente tiene clases asignadas.
    // TODO: Reemplazar con GET /get_programas_docente/{docente_id}
    const programasDocente = filtro.docente_id
        ? MOCK_PROGRAMAS.filter(p =>
              MOCK_ASIGNACIONES.some(
                  a => a.docente_id === parseInt(filtro.docente_id) && a.programa_id === p.id
              )
          )
        : [];

    const filtersReady =
        filtro.docente_id &&
        filtro.programa_id &&
        filtro.fecha_inicio &&
        filtro.fecha_fin &&
        filtro.fecha_inicio <= filtro.fecha_fin;

    // ── Generar reporte ───────────────────────────────────────────────────────
    const handleBuscar = async () => {
        if (!filtersReady) return;
        setLoading(true);
        setError("");

        try {
            // TODO: Reemplazar con llamada real al backend
            // Endpoint sugerido: GET /get_reporte_clases
            // Query params: docente_id, programa_id, fecha_inicio, fecha_fin
            // Estructura esperada del response:
            // {
            //   docente:  { id, nombre },
            //   programa: { id, nombre, codigo },
            //   periodos: [{ id, nombre, inicio, fin }],
            //   clases: [{
            //     id, periodo_id, periodo_nombre, dia, hora_inicio, hora_fin,
            //     asignatura_id, asignatura_nombre, asignatura_codigo, asignatura_creditos,
            //     grupo_id, grupo_nombre, grupo_semestre, aula
            //   }]
            // }

            await new Promise(r => setTimeout(r, 700)); // simular latencia de red

            // Periodos que se solapan con el rango de fechas seleccionado
            const periodosFiltrados = MOCK_PERIODOS.filter(p =>
                rangesOverlap(filtro.fecha_inicio, filtro.fecha_fin, p.inicio, p.fin)
            );
            const periodoIds = periodosFiltrados.map(p => p.id);

            // Asignaciones del docente en el programa, dentro de esos periodos
            const asignacionesFiltradas = MOCK_ASIGNACIONES.filter(a =>
                a.docente_id  === parseInt(filtro.docente_id)  &&
                a.programa_id === parseInt(filtro.programa_id) &&
                periodoIds.includes(a.periodo_id)
            );

            // Enriquecer cada asignación con sus datos relacionados
            const clasesEnriquecidas = asignacionesFiltradas.map(a => {
                const asignatura = MOCK_ASIGNATURAS.find(s => s.id === a.asignatura_id);
                const grupo      = MOCK_GRUPOS.find(g => g.id === a.grupo_id);
                const periodo    = MOCK_PERIODOS.find(p => p.id === a.periodo_id);
                return {
                    ...a,
                    asignatura_nombre:   asignatura?.nombre   ?? "—",
                    asignatura_codigo:   asignatura?.codigo   ?? "—",
                    asignatura_creditos: asignatura?.creditos ?? 0,
                    grupo_nombre:        grupo?.nombre        ?? "—",
                    grupo_semestre:      grupo?.semestre      ?? "—",
                    periodo_nombre:      periodo?.nombre      ?? "—",
                };
            }).sort((a, b) => (DIA_ORDEN[a.dia] ?? 9) - (DIA_ORDEN[b.dia] ?? 9));

            setResultados({
                docente:  MOCK_DOCENTES.find(d => d.id === parseInt(filtro.docente_id)),
                programa: MOCK_PROGRAMAS.find(p => p.id === parseInt(filtro.programa_id)),
                periodos: periodosFiltrados,
                clases:   clasesEnriquecidas,
            });
        } catch {
            setError("Error al generar el reporte. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleLimpiar = () => {
        setFiltro({ docente_id: "", programa_id: "", fecha_inicio: "", fecha_fin: "" });
        setResultados(null);
        setError("");
    };

    // ── Stats resumen del reporte ─────────────────────────────────────────────
    const stats = resultados ? {
        totalClases:  resultados.clases.length,
        totalMinutos: resultados.clases.reduce(
            (sum, c) => sum + (toMin(c.hora_fin) - toMin(c.hora_inicio)), 0
        ),
        diasActivos: [...new Set(resultados.clases.map(c => c.dia))],
        periodos:    resultados.periodos.length,
    } : null;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-neutral-50 font-sans">

            {/* Overlay de carga de pantalla completa */}
            {loading && <LoadingOverlay message="Generando reporte..." />}

            {/* ── Encabezado de página (sticky bajo el Navbar) ── */}
            <div className="bg-white border-b border-neutral-100 sticky top-14 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight">
                        Reportes
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Consulta las clases asignadas a un docente por programa y rango de fechas
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* ══ PANEL DE FILTROS ══════════════════════════════════════════ */}
                <div className={cx.card}>
                    <div className="px-5 py-4 border-b border-neutral-100">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Parámetros del reporte
                        </p>
                    </div>

                    <div className="p-5 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                            {/* Filtro 1: Docente */}
                            <div>
                                <label className={cx.label}>Docente</label>
                                {/* TODO: options desde GET /get_docentes?rol=2 */}
                                <select
                                    className={cx.input}
                                    value={filtro.docente_id}
                                    onChange={e =>
                                        setFiltro(f => ({
                                            ...f,
                                            docente_id:  e.target.value,
                                            programa_id: "", // resetear programa al cambiar docente
                                        }))
                                    }
                                >
                                    <option value="">Selecciona docente</option>
                                    {MOCK_DOCENTES.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro 2: Programa — solo programas con clases asignadas al docente */}
                            <div>
                                <label className={cx.label}>Programa académico</label>
                                {/* TODO: options desde GET /get_programas_docente/{docente_id} */}
                                <select
                                    className={cx.input}
                                    value={filtro.programa_id}
                                    onChange={e => setFiltro(f => ({ ...f, programa_id: e.target.value }))}
                                    disabled={!filtro.docente_id}
                                >
                                    <option value="">
                                        {filtro.docente_id
                                            ? programasDocente.length > 0
                                                ? "Selecciona programa"
                                                : "Sin programas asignados"
                                            : "Primero selecciona un docente"}
                                    </option>
                                    {programasDocente.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} ({p.codigo})
                                        </option>
                                    ))}
                                </select>
                                {filtro.docente_id && programasDocente.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        Este docente no tiene clases asignadas en ningún programa.
                                    </p>
                                )}
                            </div>

                            {/* Filtro 3: Fecha inicio */}
                            <div>
                                <label className={cx.label}>Fecha inicio</label>
                                <input
                                    type="date"
                                    className={cx.input}
                                    value={filtro.fecha_inicio}
                                    onChange={e => setFiltro(f => ({ ...f, fecha_inicio: e.target.value }))}
                                />
                            </div>

                            {/* Filtro 4: Fecha fin */}
                            <div>
                                <label className={cx.label}>Fecha fin</label>
                                <input
                                    type="date"
                                    className={cx.input}
                                    value={filtro.fecha_fin}
                                    min={filtro.fecha_inicio || undefined}
                                    onChange={e => setFiltro(f => ({ ...f, fecha_fin: e.target.value }))}
                                />
                                {filtro.fecha_inicio && filtro.fecha_fin && filtro.fecha_inicio > filtro.fecha_fin && (
                                    <p className="text-xs text-red-600 mt-1">
                                        La fecha fin debe ser posterior a la fecha inicio.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            <button
                                onClick={handleBuscar}
                                disabled={!filtersReady || loading}
                                className={cx.btnPrimary}
                            >
                                Generar reporte
                            </button>
                            {(resultados !== null || error) && (
                                <button onClick={handleLimpiar} className={cx.btnSecondary}>
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ══ BANNER DE ERROR ══════════════════════════════════════════ */}
                {error && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                        <span className="w-5 h-5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0 font-bold text-xs">
                            ✕
                        </span>
                        {error}
                    </div>
                )}

                {/* ══ RESULTADOS ═══════════════════════════════════════════════ */}
                {resultados && !loading && (
                    <div className="space-y-5">

                        {/* Encabezado del reporte generado */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-800">
                                    {resultados.docente?.nombre}
                                    <span className="mx-2 text-neutral-300">·</span>
                                    <span className="font-normal text-neutral-500">
                                        {resultados.programa?.nombre}
                                    </span>
                                </h2>
                                <p className="text-sm text-neutral-400 mt-0.5">
                                    {filtro.fecha_inicio} → {filtro.fecha_fin}
                                    {resultados.periodos.length > 0 && (
                                        <span className="ml-2">
                                            · {resultados.periodos.map(p => p.nombre).join(", ")}
                                        </span>
                                    )}
                                </p>
                            </div>
                            {/* TODO: Botón de exportación — conectar con backend o librería PDF */}
                            {/* <button className={cx.btnSecondary}>Exportar PDF</button> */}
                        </div>

                        {/* ── Tarjetas de resumen ── */}
                        {stats && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                                <div className={`${cx.card} p-5`}>
                                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                                        Clases asignadas
                                    </p>
                                    <p className="text-3xl font-bold text-neutral-900 mt-2 tabular-nums">
                                        {stats.totalClases}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1">por semana</p>
                                </div>

                                <div className={`${cx.card} p-5`}>
                                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                                        Horas semanales
                                    </p>
                                    <p className="text-3xl font-bold text-neutral-900 mt-2 tabular-nums">
                                        {Math.floor(stats.totalMinutos / 60)}
                                        <span className="text-lg text-neutral-500">h</span>
                                        {stats.totalMinutos % 60 > 0 && (
                                            <span className="text-lg text-neutral-500">
                                                {stats.totalMinutos % 60}min
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1">tiempo en clase</p>
                                </div>

                                <div className={`${cx.card} p-5`}>
                                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                                        Días activos
                                    </p>
                                    <p className="text-3xl font-bold text-neutral-900 mt-2 tabular-nums">
                                        {stats.diasActivos.length}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1 truncate">
                                        {stats.diasActivos.join(", ")}
                                    </p>
                                </div>

                                <div className={`${cx.card} p-5`}>
                                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                                        Periodos
                                    </p>
                                    <p className="text-3xl font-bold text-neutral-900 mt-2 tabular-nums">
                                        {stats.periodos}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1 truncate">
                                        {resultados.periodos.map(p => p.nombre).join(", ") || "—"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Sin resultados ── */}
                        {resultados.clases.length === 0 ? (
                            <div className={`${cx.card} py-16 flex flex-col items-center justify-center gap-3 px-4 text-center`}>
                                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 text-xl">
                                    ◫
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-600">Sin clases en ese rango</p>
                                    <p className="text-sm text-neutral-400 mt-1 max-w-xs">
                                        No se encontraron clases asignadas para este docente en el programa y
                                        fechas seleccionadas.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* ── Tabla de detalle — visible en sm+ ── */}
                                <div className={`${cx.card} overflow-hidden hidden sm:block`}>
                                    <div className="px-5 py-4 border-b border-neutral-100">
                                        <h3 className="font-semibold text-neutral-800">Detalle de clases</h3>
                                        <p className="text-xs text-neutral-400 mt-0.5">
                                            {resultados.clases.length} clase{resultados.clases.length !== 1 ? "s" : ""} encontrada{resultados.clases.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm" style={{ minWidth: "640px" }}>
                                            <thead className="bg-neutral-50 border-b border-neutral-100">
                                                <tr>
                                                    <th className={cx.th}>Día</th>
                                                    <th className={cx.th}>Horario</th>
                                                    <th className={cx.th}>Asignatura</th>
                                                    <th className={cx.th}>Grupo</th>
                                                    <th className={cx.th}>Aula</th>
                                                    <th className={cx.th}>Período</th>
                                                    <th className={cx.th}>Créditos</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50">
                                                {resultados.clases.map(clase => (
                                                    <tr
                                                        key={clase.id}
                                                        className="hover:bg-neutral-50/50 transition-colors"
                                                    >
                                                        <td className={`${cx.td} font-medium text-neutral-800`}>
                                                            {clase.dia}
                                                        </td>
                                                        <td className={cx.td}>
                                                            <span className="font-mono text-xs text-neutral-600 whitespace-nowrap">
                                                                {clase.hora_inicio}–{clase.hora_fin}
                                                            </span>
                                                        </td>
                                                        <td className={cx.td}>
                                                            <p className="font-medium text-neutral-800">
                                                                {clase.asignatura_nombre}
                                                            </p>
                                                            <p className="text-xs text-neutral-400 font-mono mt-0.5">
                                                                {clase.asignatura_codigo}
                                                            </p>
                                                        </td>
                                                        <td className={cx.td}>
                                                            <p className="text-neutral-700">{clase.grupo_nombre}</p>
                                                            <p className="text-xs text-neutral-400 mt-0.5">
                                                                Sem. {clase.grupo_semestre}
                                                            </p>
                                                        </td>
                                                        <td className={cx.td}>
                                                            {clase.aula ? (
                                                                <span className={`${cx.badge} bg-neutral-100 text-neutral-600`}>
                                                                    {clase.aula}
                                                                </span>
                                                            ) : (
                                                                <span className="text-neutral-300">—</span>
                                                            )}
                                                        </td>
                                                        <td className={cx.td}>
                                                            <span className={`${cx.badge} bg-neutral-900 text-white`}>
                                                                {clase.periodo_nombre}
                                                            </span>
                                                        </td>
                                                        <td className={cx.td}>
                                                            <span className={`${cx.badge} bg-neutral-100 text-neutral-600`}>
                                                                {clase.asignatura_creditos} cr
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* ── Cards de detalle — visibles solo en mobile ── */}
                                <div className="sm:hidden space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-neutral-800">Detalle de clases</h3>
                                        <span className="text-xs text-neutral-400">
                                            {resultados.clases.length} clase{resultados.clases.length !== 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    {resultados.clases.map(clase => (
                                        <div key={clase.id} className={`${cx.card} p-4 space-y-3`}>

                                            {/* Encabezado de card */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-neutral-800 truncate">
                                                        {clase.asignatura_nombre}
                                                    </p>
                                                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                                                        {clase.asignatura_codigo} · {clase.asignatura_creditos} créditos
                                                    </p>
                                                </div>
                                                <span className={`${cx.badge} bg-neutral-900 text-white shrink-0`}>
                                                    {clase.periodo_nombre}
                                                </span>
                                            </div>

                                            {/* Día y horario */}
                                            <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                                                <span className="font-medium">{clase.dia}</span>
                                                <span className="text-neutral-300">·</span>
                                                <span className="font-mono text-xs">{clase.hora_inicio}–{clase.hora_fin}</span>
                                            </div>

                                            {/* Badges: grupo y aula */}
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`${cx.badge} bg-neutral-100 text-neutral-600`}>
                                                    {clase.grupo_nombre} · Sem. {clase.grupo_semestre}
                                                </span>
                                                {clase.aula && (
                                                    <span className={`${cx.badge} bg-neutral-50 text-neutral-500 border border-neutral-100`}>
                                                        Aula {clase.aula}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ══ ESTADO VACÍO INICIAL (sin búsqueda) ══════════════════════ */}
                {!resultados && !loading && !error && (
                    <div className={`${cx.card} py-20 flex flex-col items-center justify-center gap-3 px-4 text-center`}>
                        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3-14.25h.008v.008H15.75V3.75zm0 3h.008v.008H15.75V6.75zm0 3h.008v.008H15.75V9.75zm0 3h.008v.008H15.75v-.008zM9 21H5.25A2.25 2.25 0 013 18.75V5.25A2.25 2.25 0 015.25 3h9.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H7.5M9 21h9.75A2.25 2.25 0 0021 18.75V9.75c0-.621-.504-1.125-1.125-1.125H15.75"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-700">Sin reporte generado</p>
                            <p className="text-sm text-neutral-400 mt-1 max-w-sm">
                                Selecciona un docente, programa y rango de fechas, luego presiona
                                "Generar reporte".
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
