import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";
import { getDisponibilidadDocente } from "../services/disponibilidadService.js";

// ── Constantes ────────────────────────────────────────────────────────────────
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const TABS = [
    { id: "horario",     label: "Programación"  },
    { id: "grupos",      label: "Grupos"        },
    { id: "periodos",    label: "Periodos"      },
    { id: "jornadas",    label: "Jornadas"      },
    { id: "asignaturas", label: "Asignaturas"   },
];

// ── Clases Tailwind reutilizables ─────────────────────────────────────────────
const cx = {
    input:        "w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800 disabled:opacity-50",
    label:        "block text-xs font-medium text-neutral-600 mb-1",
    btnPrimary:   "px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-neutral-800 active:bg-neutral-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed",
    btnSecondary: "px-4 py-2 bg-white text-neutral-700 border border-neutral-200 text-sm rounded-lg hover:bg-neutral-50 transition-colors font-medium",
    btnDanger:    "px-3 py-1.5 text-xs text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors",
    btnEdit:      "px-3 py-1.5 text-xs text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors",
    card:         "bg-white rounded-2xl border border-neutral-100 shadow-sm",
    badge:        "px-2 py-0.5 rounded-full text-xs font-medium",
    th:           "px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider text-left",
    td:           "px-5 py-3.5 text-sm text-neutral-700",
};

// ── Mock data — reemplazar con fetch a la API ─────────────────────────────────
// TODO: Cargar cada lista desde la API correspondiente al montar AdminHorario

const INIT_FACULTADES = [
    { id: 1, nombre: "Ingeniería",                 codigo: "ING" },
    { id: 2, nombre: "Ciencias Administrativas",   codigo: "ADM" },
    { id: 3, nombre: "Ciencias de la Salud",       codigo: "SAL" },
];

const INIT_PROGRAMAS = [
    { id: 1, nombre: "Ingeniería de Sistemas",     codigo: "ISI", facultad_id: 1 },
    { id: 2, nombre: "Ingeniería Civil",           codigo: "ICI", facultad_id: 1 },
    { id: 3, nombre: "Administración de Empresas", codigo: "ADE", facultad_id: 2 },
    { id: 4, nombre: "Contaduría Pública",         codigo: "COP", facultad_id: 2 },
    { id: 5, nombre: "Enfermería",                 codigo: "ENF", facultad_id: 3 },
];

const INIT_PERIODOS = [
    { id: 1, nombre: "2026-1", inicio: "2026-01-15", fin: "2026-06-20", activo: true  },
    { id: 2, nombre: "2025-2", inicio: "2025-07-10", fin: "2025-12-05", activo: false },
];

const INIT_JORNADAS = [
    { id: 1, nombre: "Diurna",     hora_inicio: "07:00", hora_fin: "13:00" },
    { id: 2, nombre: "Vespertina", hora_inicio: "13:00", hora_fin: "19:00" },
    { id: 3, nombre: "Nocturna",   hora_inicio: "18:00", hora_fin: "22:00" },
];

const INIT_ASIGNATURAS = [
    { id: 1, nombre: "Bases de Datos",    codigo: "BD101",  creditos: 3, programa_id: 1 },
    { id: 2, nombre: "Algoritmos",        codigo: "ALG102", creditos: 4, programa_id: 1 },
    { id: 3, nombre: "Cálculo I",         codigo: "CAL101", creditos: 4, programa_id: 1 },
    { id: 4, nombre: "Contabilidad I",    codigo: "CON101", creditos: 3, programa_id: 3 },
    { id: 5, nombre: "Costos",            codigo: "COS201", creditos: 3, programa_id: 4 },
    { id: 6, nombre: "Anatomía",          codigo: "ANA101", creditos: 4, programa_id: 5 },
];

// TODO: Cargar desde GET /get_grupos?programa_id={id}
// Estructura esperada: [{ id, nombre, semestre, programa_id, cupo }]
// "Grupo" = conjunto de estudiantes de un semestre específico dentro de un programa
const INIT_GRUPOS = [
    // Ingeniería de Sistemas
    { id: 1, nombre: "Grupo 01", semestre: 1, programa_id: 1, cupo: 35 },
    { id: 2, nombre: "Grupo 02", semestre: 1, programa_id: 1, cupo: 35 },
    { id: 3, nombre: "Grupo 01", semestre: 2, programa_id: 1, cupo: 30 },
    { id: 4, nombre: "Grupo 01", semestre: 3, programa_id: 1, cupo: 28 },
    // Ingeniería Civil
    { id: 5, nombre: "Grupo 01", semestre: 1, programa_id: 2, cupo: 32 },
    { id: 6, nombre: "Grupo 01", semestre: 2, programa_id: 2, cupo: 29 },
    // Administración de Empresas
    { id: 7, nombre: "Grupo 01", semestre: 1, programa_id: 3, cupo: 40 },
    { id: 8, nombre: "Grupo 02", semestre: 1, programa_id: 3, cupo: 38 },
    // Enfermería
    { id: 9, nombre: "Grupo 01", semestre: 1, programa_id: 5, cupo: 25 },
];

// TODO: Cargar desde GET /get_docentes (filtrado por rol=2)
const INIT_DOCENTES = [
    { id: 1, nombre: "Carlos Pérez"    },
    { id: 2, nombre: "Ana González"    },
    { id: 3, nombre: "Luis Martínez"   },
    { id: 4, nombre: "María Rodríguez" },
];

// ── Disponibilidades de prueba ────────────────────────────────────────────────
// TODO: Eliminar este mock cuando el backend esté activo.
//       Reemplazar con GET /get_disponibilidad_docente/{docente_id}?periodo_id={periodo_id}
//       Estructura que debe devolver el backend:
//         [{ id, id_docente, dia_semana (1=Lun…6=Sáb), hora_inicio "HH:MM", hora_fin "HH:MM", id_periodo }]
// Disponibilidad por BLOQUE HORARIO: un docente puede ir todos los días
// pero solo tiene ciertas horas disponibles dentro de cada día.
// La lógica de isDisponible() verifica solapamiento de rangos — no día completo.
// TODO: Eliminar este mock cuando el backend esté activo.
//       Reemplazar con GET /get_disponibilidad_docente/{docente_id}?periodo_id={periodo_id}
const INIT_DISPONIBILIDADES = [
    // ── Carlos Pérez — disponible horas parciales por día (diurna) ──────────
    { id: 1,  id_docente: 1, dia_semana: 1, hora_inicio: "07:00", hora_fin: "09:00", id_periodo: 1 }, // Lunes solo primeras 2h
    { id: 2,  id_docente: 1, dia_semana: 2, hora_inicio: "10:00", hora_fin: "13:00", id_periodo: 1 }, // Martes últimas 3h
    { id: 3,  id_docente: 1, dia_semana: 3, hora_inicio: "07:00", hora_fin: "11:00", id_periodo: 1 }, // Miércoles primeras 4h
    { id: 4,  id_docente: 1, dia_semana: 5, hora_inicio: "07:00", hora_fin: "13:00", id_periodo: 1 }, // Viernes día completo diurno

    // ── Ana González — disponible vespertina, horas parciales ───────────────
    { id: 5,  id_docente: 2, dia_semana: 1, hora_inicio: "13:00", hora_fin: "16:00", id_periodo: 1 }, // Lunes 3h vespertinas
    { id: 6,  id_docente: 2, dia_semana: 2, hora_inicio: "14:00", hora_fin: "19:00", id_periodo: 1 }, // Martes desde las 14h
    { id: 7,  id_docente: 2, dia_semana: 4, hora_inicio: "13:00", hora_fin: "17:00", id_periodo: 1 }, // Jueves 4h
    { id: 8,  id_docente: 2, dia_semana: 6, hora_inicio: "13:00", hora_fin: "15:00", id_periodo: 1 }, // Sábado solo 2h

    // ── Luis Martínez — amplia disponibilidad, pero no todos los días ───────
    { id: 9,  id_docente: 3, dia_semana: 1, hora_inicio: "07:00", hora_fin: "19:00", id_periodo: 1 }, // Lunes diurna+vespertina
    { id: 10, id_docente: 3, dia_semana: 2, hora_inicio: "07:00", hora_fin: "13:00", id_periodo: 1 }, // Martes solo diurna
    { id: 11, id_docente: 3, dia_semana: 3, hora_inicio: "07:00", hora_fin: "19:00", id_periodo: 1 }, // Miércoles diurna+vespertina
    { id: 12, id_docente: 3, dia_semana: 5, hora_inicio: "13:00", hora_fin: "19:00", id_periodo: 1 }, // Viernes solo vespertina

    // ── María Rodríguez — nocturna con horas parciales ───────────────────────
    { id: 13, id_docente: 4, dia_semana: 1, hora_inicio: "18:00", hora_fin: "22:00", id_periodo: 1 }, // Lunes nocturna completa
    { id: 14, id_docente: 4, dia_semana: 3, hora_inicio: "18:00", hora_fin: "20:00", id_periodo: 1 }, // Miércoles solo 2h nocturnas
    { id: 15, id_docente: 4, dia_semana: 4, hora_inicio: "18:00", hora_fin: "22:00", id_periodo: 1 }, // Jueves nocturna completa
    { id: 16, id_docente: 4, dia_semana: 5, hora_inicio: "19:00", hora_fin: "22:00", id_periodo: 1 }, // Viernes desde las 19h
];

// ── Utilidades ────────────────────────────────────────────────────────────────
function generateTimeSlots(horaInicio, horaFin, intervalMin = 60) {
    const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const toStr = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const slots = [];
    let cur = toMin(horaInicio);
    const end = toMin(horaFin);
    while (cur + intervalMin <= end) {
        slots.push({ inicio: toStr(cur), fin: toStr(cur + intervalMin) });
        cur += intervalMin;
    }
    return slots;
}

let _nextId = 200;
const newId = () => ++_nextId;

// ═════════════════════════════════════════════════════════════════════════════
// TAB: PROGRAMACIÓN — grilla semanal de horarios
// ═════════════════════════════════════════════════════════════════════════════
function TabHorario({ filtro, setFiltro, periodos, jornadas, programas, asignaturas, docentes, grupos, asignaciones, setAsignaciones }) {
    const [modal,   setModal]   = useState(null);
    const [form,    setForm]    = useState({ asignatura_id: "", grupo_id: "", aula: "", _id: null });
    const [saving,  setSaving]  = useState(false);
    const [blockMsg,       setBlockMsg]       = useState("");
    const [conflictoGrupo, setConflictoGrupo] = useState(null);

    const [dispDocente, setDispDocente] = useState([]);
    const [loadingDisp, setLoadingDisp] = useState(false);

    const toMin = t => { const p = t.split(":"); return parseInt(p[0]) * 60 + parseInt(p[1] || 0); };
    const DIA_NUM = { Lunes: 1, Martes: 2, "Miércoles": 3, Jueves: 4, Viernes: 5, Sábado: 6 };

    const isDisponible = (dia, horaInicio, horaFin) => {
        if (!dispDocente.length) return null;
        const diaNum = DIA_NUM[dia];
        const aStart = toMin(horaInicio);
        const aEnd   = toMin(horaFin);
        return dispDocente.some(s =>
            s.dia_semana === diaNum &&
            toMin(s.hora_inicio) < aEnd &&
            toMin(s.hora_fin)   > aStart
        );
    };

    // TODO: conectar con GET /get_disponibilidad_docente/{docente_id}?periodo_id={periodo_id}
    useEffect(() => {
        if (!filtro.docente_id || !filtro.periodo_id) {
            setDispDocente([]);
            return;
        }
        setLoadingDisp(true);
        const timer = setTimeout(() => {
            const mock = INIT_DISPONIBILIDADES.filter(
                d => d.id_docente === parseInt(filtro.docente_id) &&
                    d.id_periodo  === parseInt(filtro.periodo_id)
            );
            setDispDocente(mock);
            setLoadingDisp(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [filtro.docente_id, filtro.periodo_id]);

    const jornadaActual = jornadas.find(j => j.id === parseInt(filtro.jornada_id));
    const docenteActual = docentes.find(d => d.id === parseInt(filtro.docente_id));
    const timeSlots     = jornadaActual ? generateTimeSlots(jornadaActual.hora_inicio, jornadaActual.hora_fin) : [];

    const asignaturasFiltradas = filtro.programa_id
        ? asignaturas.filter(a => a.programa_id === parseInt(filtro.programa_id))
        : asignaturas;

    const gruposFiltrados = filtro.programa_id
        ? grupos.filter(g => g.programa_id === parseInt(filtro.programa_id))
        : grupos;

    // Solo asignaciones del docente seleccionado → lo que se muestra como tarjeta en la grilla
    const getAsignacionPropia = (dia, hora) =>
        asignaciones.find(a =>
            a.dia         === dia &&
            a.hora_inicio === hora &&
            a.periodo_id  === parseInt(filtro.periodo_id) &&
            a.jornada_id  === parseInt(filtro.jornada_id) &&
            a.docente_id  === parseInt(filtro.docente_id)
        );

    const filtersReady = filtro.periodo_id && filtro.jornada_id && filtro.docente_id;

    const showBlockMsg = (msg) => {
        setBlockMsg(msg);
        setTimeout(() => setBlockMsg(""), 3000);
    };

    const handleCellClick = (dia, slot) => {
        if (!filtersReady) return;
        const disp = isDisponible(dia, slot.inicio, slot.fin);
        if (disp === false) {
            showBlockMsg("Este docente no tiene disponibilidad en este bloque horario.");
            return;
        }
        const existing = getAsignacionPropia(dia, slot.inicio);
        setConflictoGrupo(null);
        setForm(existing
            ? { asignatura_id: existing.asignatura_id, grupo_id: existing.grupo_id || "", aula: existing.aula, _id: existing.id }
            : { asignatura_id: "", grupo_id: "", aula: "", _id: null }
        );
        setModal({ dia, ...slot });
    };

    const handleGrupoChange = (grupoId) => {
        setForm(f => ({ ...f, grupo_id: grupoId }));
        if (!grupoId || !modal) { setConflictoGrupo(null); return; }
        const conflict = asignaciones.find(a =>
            a.grupo_id    === parseInt(grupoId) &&
            a.dia         === modal.dia &&
            a.hora_inicio === modal.inicio &&
            a.periodo_id  === parseInt(filtro.periodo_id) &&
            a.jornada_id  === parseInt(filtro.jornada_id) &&
            a.docente_id  !== parseInt(filtro.docente_id) &&
            a.id          !== form._id
        );
        setConflictoGrupo(conflict ?? null);
    };

    const hasConflict = !!conflictoGrupo;

    const handleSave = async () => {
        if (!form.asignatura_id || !form.grupo_id || hasConflict) return;
        setSaving(true);
        try {
            // TODO: Enviar al backend
            // const payload = { periodo_id, jornada_id, programa_id, dia, hora_inicio, hora_fin,
            //                   docente_id, asignatura_id, grupo_id, aula };
            // form._id ? await axios.put(`/update_asignacion_horario/${form._id}`, payload)
            //          : await axios.post("/crear_asignacion_horario", payload);

            if (form._id) {
                setAsignaciones(prev => prev.map(a =>
                    a.id === form._id
                        ? { ...a, asignatura_id: parseInt(form.asignatura_id), grupo_id: parseInt(form.grupo_id), aula: form.aula }
                        : a
                ));
            } else {
                setAsignaciones(prev => [...prev, {
                    id:            newId(),
                    periodo_id:    parseInt(filtro.periodo_id),
                    jornada_id:    parseInt(filtro.jornada_id),
                    programa_id:   parseInt(filtro.programa_id) || null,
                    dia:           modal.dia,
                    hora_inicio:   modal.inicio,
                    hora_fin:      modal.fin,
                    docente_id:    parseInt(filtro.docente_id),
                    asignatura_id: parseInt(form.asignatura_id),
                    grupo_id:      parseInt(form.grupo_id),
                    aula:          form.aula,
                }]);
            }
            setModal(null);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id) => {
        // TODO: await axios.delete(`/eliminar_asignacion_horario/${id}`)
        setAsignaciones(prev => prev.filter(a => a.id !== id));
        setModal(null);
    };

    return (
        <div className="space-y-5">

            {/* ── Filtros ── */}
            <div className={`${cx.card} p-5`}>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Filtrar vista</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div>
                        <label className={cx.label}>Periodo / Semestre</label>
                        <select className={cx.input} value={filtro.periodo_id}
                            onChange={e => setFiltro(f => ({ ...f, periodo_id: e.target.value }))}>
                            <option value="">Selecciona periodo</option>
                            {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={cx.label}>Jornada</label>
                        <select className={cx.input} value={filtro.jornada_id}
                            onChange={e => setFiltro(f => ({ ...f, jornada_id: e.target.value }))}>
                            <option value="">Selecciona jornada</option>
                            {jornadas.map(j => (
                                <option key={j.id} value={j.id}>{j.nombre} ({j.hora_inicio}–{j.hora_fin})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={cx.label}>Docente</label>
                        <select className={cx.input} value={filtro.docente_id}
                            onChange={e => setFiltro(f => ({ ...f, docente_id: e.target.value }))}>
                            <option value="">Selecciona docente</option>
                            {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={cx.label}>Programa académico</label>
                        <select className={cx.input} value={filtro.programa_id}
                            onChange={e => setFiltro(f => ({ ...f, programa_id: e.target.value }))}>
                            <option value="">Todos los programas</option>
                            {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>

                </div>
            </div>

            {/* ── Banner: bloque horario no disponible ── */}
            {blockMsg && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium shadow-sm">
                    <span className="w-5 h-5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0 text-red-600 font-bold text-xs">✕</span>
                    {blockMsg}
                </div>
            )}

            {/* ── Grilla ── */}
            {!filtersReady ? (
                <div className={`${cx.card} py-16 flex flex-col items-center justify-center gap-2 px-4 text-center`}>
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 text-lg">◫</div>
                    <p className="text-sm text-neutral-400">Selecciona periodo, jornada y docente para ver su disponibilidad</p>
                </div>
            ) : (
                <div className={`${cx.card} overflow-hidden`}>

                    {/* Encabezado de la grilla */}
                    <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-neutral-800 truncate">
                                {periodos.find(p => p.id === parseInt(filtro.periodo_id))?.nombre}
                                <span className="mx-1.5 text-neutral-300">·</span>
                                {jornadaActual?.nombre}
                                {filtro.programa_id && (
                                    <>
                                        <span className="mx-1.5 text-neutral-300">·</span>
                                        {programas.find(p => p.id === parseInt(filtro.programa_id))?.nombre}
                                    </>
                                )}
                            </h2>
                            {loadingDisp && (
                                <p className="text-xs text-neutral-400 mt-0.5 animate-pulse">Cargando disponibilidad…</p>
                            )}
                            {!loadingDisp && !dispDocente.length && (
                                <p className="text-xs text-amber-600 mt-0.5">
                                    Este docente no tiene disponibilidad registrada para este periodo.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {docenteActual && (
                                <span className="text-xs text-neutral-500">
                                    Disponibilidad de: <strong className="text-neutral-700">{docenteActual.nombre}</strong>
                                </span>
                            )}
                            <div className="flex items-center gap-3 flex-wrap justify-end">
                                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-300 inline-block" />
                                    Disponible
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-neutral-100 border border-neutral-200 inline-block" />
                                    No disponible
                                </div>
                                <span className="text-xs text-neutral-400 hidden sm:inline">· Clic para asignar</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabla responsive con scroll horizontal en móvil */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse" style={{ minWidth: "600px" }}>
                            <thead>
                                <tr className="border-b border-neutral-100">
                                    <th className="px-4 py-3 text-xs font-medium text-neutral-500 text-left border-r border-neutral-100 w-20 sticky left-0 bg-white z-10">
                                        Hora
                                    </th>
                                    {DIAS.map(d => (
                                        <th key={d} className="px-2 py-2.5 text-center border-r border-neutral-100 last:border-r-0 bg-white min-w-[90px]">
                                            <span className="text-xs font-semibold text-neutral-500 tracking-wide">{d}</span>
                                            {timeSlots.length > 0 && (
                                                <div className="flex gap-0.5 mt-1.5 justify-center">
                                                    {timeSlots.map((s, i) => {
                                                        const slotDisp = isDisponible(d, s.inicio, s.fin);
                                                        return (
                                                            <span
                                                                key={i}
                                                                title={`${s.inicio}–${s.fin}`}
                                                                className={`h-1.5 rounded-full flex-1 max-w-[12px] transition-colors ${
                                                                    slotDisp === true
                                                                        ? "bg-emerald-400"
                                                                        : slotDisp === false
                                                                            ? "bg-neutral-200"
                                                                            : "bg-neutral-100"
                                                                }`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((slot, i) => (
                                    <tr key={i} className="border-b border-neutral-50 last:border-b-0">
                                        <td className="px-4 py-2 text-[11px] text-neutral-400 font-mono border-r border-neutral-100 sticky left-0 bg-white z-10 whitespace-nowrap align-middle">
                                            {slot.inicio}
                                            <span className="block text-neutral-300">{slot.fin}</span>
                                        </td>
                                        {DIAS.map(dia => {
                                            const asig  = getAsignacionPropia(dia, slot.inicio);
                                            const asig_ = asignaturas.find(a => a.id === asig?.asignatura_id);
                                            const disp  = isDisponible(dia, slot.inicio, slot.fin);
                                            return (
                                                <td key={dia}
                                                    onClick={() => handleCellClick(dia, slot)}
                                                    className={`px-1.5 py-1.5 border-r border-neutral-50 last:border-r-0 align-top ${
                                                        disp === false ? "cursor-not-allowed" : "cursor-pointer"
                                                    }`}
                                                >
                                                    {asig ? (
                                                        <div className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-2.5 py-2.5 min-h-[60px] flex flex-col justify-between transition-all duration-150 shadow-sm hover:shadow-md">
                                                            <p className="text-[11px] font-semibold leading-tight line-clamp-2">{asig_?.nombre ?? "—"}</p>
                                                            <div className="mt-1.5 space-y-0.5">
                                                                <p className="text-[10px] text-neutral-400 truncate">{docenteActual?.nombre ?? "—"}</p>
                                                                {asig.aula && (
                                                                    <span className="inline-block text-[9px] bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded-full">
                                                                        Aula {asig.aula}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : disp === true ? (
                                                        <div className="min-h-[60px] rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200 flex items-center justify-center hover:from-emerald-100 hover:to-emerald-200/80 hover:border-emerald-300 hover:shadow-sm transition-all duration-150 group">
                                                            <span className="w-7 h-7 rounded-full bg-emerald-200/70 group-hover:bg-emerald-300 flex items-center justify-center text-emerald-700 text-base font-bold transition-all duration-150 group-hover:scale-110">
                                                                +
                                                            </span>
                                                        </div>
                                                    ) : disp === false ? (
                                                        <div className="min-h-[60px] rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center opacity-40 cursor-not-allowed">
                                                            <span className="text-neutral-400 text-lg select-none font-light">—</span>
                                                        </div>
                                                    ) : (
                                                        <div className="min-h-[60px] rounded-xl border border-dashed border-neutral-200 flex items-center justify-center hover:border-neutral-300 hover:bg-neutral-50/60 transition-all duration-150">
                                                            <span className="text-neutral-300 text-sm">+</span>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Modal: asignar / editar clase ── */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/25 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 space-y-4">

                        {/* Encabezado del modal */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Asignar clase</p>
                                <h3 className="font-semibold text-neutral-800 mt-0.5 truncate">
                                    {modal.dia} · {modal.inicio}–{modal.fin}
                                </h3>
                                <p className="text-xs text-neutral-500 mt-0.5 truncate">{docenteActual?.nombre}</p>
                            </div>
                            <button
                                onClick={() => setModal(null)}
                                className="text-neutral-400 hover:text-neutral-700 text-xl leading-none mt-0.5 shrink-0"
                            >✕</button>
                        </div>

                        {/* Asignatura + Grupo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <div>
                                <label className={cx.label}>Asignatura</label>
                                <select className={cx.input} value={form.asignatura_id}
                                    onChange={e => setForm(f => ({ ...f, asignatura_id: e.target.value }))}>
                                    <option value="">Selecciona asignatura</option>
                                    {asignaturasFiltradas.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre} ({a.codigo})</option>
                                    ))}
                                </select>
                                {!filtro.programa_id && (
                                    <p className="text-xs text-neutral-400 mt-1">Selecciona un programa en los filtros para acotar.</p>
                                )}
                            </div>

                            {/* Grupo — con validación de conflicto */}
                            <div>
                                <label className={cx.label}>Grupo</label>
                                <select
                                    className={`${cx.input} ${conflictoGrupo ? "border-red-400 ring-2 ring-red-200" : ""}`}
                                    value={form.grupo_id}
                                    onChange={e => handleGrupoChange(e.target.value)}
                                >
                                    <option value="">Selecciona grupo</option>
                                    {gruposFiltrados.map(g => {
                                        const prog = programas.find(p => p.id === g.programa_id);
                                        return (
                                            <option key={g.id} value={g.id}>
                                                {g.nombre} · Sem. {g.semestre}{prog ? ` (${prog.codigo})` : ""}
                                            </option>
                                        );
                                    })}
                                </select>
                                {conflictoGrupo ? (
                                    <p className="text-xs text-red-600 mt-1 font-medium">
                                        Ya asignado a <strong>{docentes.find(d => d.id === conflictoGrupo.docente_id)?.nombre ?? "otro docente"}</strong> en este horario.
                                    </p>
                                ) : !filtro.programa_id ? (
                                    <p className="text-xs text-neutral-400 mt-1">Selecciona un programa para filtrar grupos.</p>
                                ) : null}
                            </div>

                        </div>

                        {/* Aula */}
                        <div>
                            <label className={cx.label}>Aula / Salón</label>
                            <input className={cx.input} placeholder="Ej: A-201"
                                value={form.aula}
                                onChange={e => setForm(f => ({ ...f, aula: e.target.value }))} />
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.asignatura_id || !form.grupo_id || hasConflict}
                                className={`${cx.btnPrimary} flex-1`}
                            >
                                {saving ? "Guardando…" : "Guardar"}
                            </button>
                            {form._id && (
                                <button onClick={() => handleDelete(form._id)} className={cx.btnDanger}>Eliminar</button>
                            )}
                            <button onClick={() => setModal(null)} className={cx.btnSecondary}>Cancelar</button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB: GRUPOS — Facultades, Programas y Grupos de clase
// ═════════════════════════════════════════════════════════════════════════════
function TabGrupos({ facultades, setFacultades, programas, setProgramas, grupos, setGrupos }) {
    // ── Estado Facultades ────────────────────────────────────────────────────
    const [showFacForm, setShowFacForm] = useState(false);
    const [facForm,     setFacForm]     = useState({ nombre: "", codigo: "" });
    const [editFacId,   setEditFacId]   = useState(null);
    const [selectedFac, setSelectedFac] = useState(null);

    // ── Estado Programas ─────────────────────────────────────────────────────
    const [showProgForm, setShowProgForm] = useState(false);
    const [progForm,     setProgForm]     = useState({ nombre: "", codigo: "", facultad_id: "" });
    const [editProgId,   setEditProgId]   = useState(null);
    const [selectedProg, setSelectedProg] = useState(null); // clic en programa filtra grupos

    // ── Estado Grupos ────────────────────────────────────────────────────────
    const [showGrupoForm, setShowGrupoForm] = useState(false);
    const [grupoForm,     setGrupoForm]     = useState({ nombre: "", semestre: "", programa_id: "", cupo: "" });
    const [editGrupoId,   setEditGrupoId]   = useState(null);

    // Filtros en cascada: Facultad → Programa → Grupo
    const progsFiltrados = selectedFac
        ? programas.filter(p => p.facultad_id === selectedFac)
        : programas;

    const gruposFiltrados = selectedProg
        ? grupos.filter(g => g.programa_id === selectedProg)
        : selectedFac
            ? grupos.filter(g => progsFiltrados.some(p => p.id === g.programa_id))
            : grupos;

    // ── Handlers Facultades ──────────────────────────────────────────────────
    const saveFacultad = (e) => {
        e.preventDefault();
        if (editFacId) {
            // TODO: await axios.put(`/update_facultad/${editFacId}`, facForm)
            setFacultades(prev => prev.map(f => f.id === editFacId ? { ...f, ...facForm } : f));
            setEditFacId(null);
        } else {
            // TODO: await axios.post("/crear_facultad", facForm)
            setFacultades(prev => [...prev, { id: newId(), ...facForm }]);
        }
        setFacForm({ nombre: "", codigo: "" });
        setShowFacForm(false);
    };

    const deleteFacultad = (id) => {
        // TODO: await axios.delete(`/eliminar_facultad/${id}`)
        setFacultades(prev => prev.filter(f => f.id !== id));
        if (selectedFac === id) { setSelectedFac(null); setSelectedProg(null); }
    };

    // ── Handlers Programas ───────────────────────────────────────────────────
    const savePrograma = (e) => {
        e.preventDefault();
        const payload = { ...progForm, facultad_id: parseInt(progForm.facultad_id) };
        if (editProgId) {
            // TODO: await axios.put(`/update_programa/${editProgId}`, payload)
            setProgramas(prev => prev.map(p => p.id === editProgId ? { ...p, ...payload } : p));
            setEditProgId(null);
        } else {
            // TODO: await axios.post("/crear_programa", payload)
            setProgramas(prev => [...prev, { id: newId(), ...payload }]);
        }
        setProgForm({ nombre: "", codigo: "", facultad_id: "" });
        setShowProgForm(false);
    };

    const deletePrograma = (id) => {
        // TODO: await axios.delete(`/eliminar_programa/${id}`)
        setProgramas(prev => prev.filter(p => p.id !== id));
        if (selectedProg === id) setSelectedProg(null);
    };

    // ── Handlers Grupos ──────────────────────────────────────────────────────
    const saveGrupo = (e) => {
        e.preventDefault();
        const payload = {
            ...grupoForm,
            semestre:    parseInt(grupoForm.semestre),
            programa_id: parseInt(grupoForm.programa_id),
            cupo:        grupoForm.cupo ? parseInt(grupoForm.cupo) : null,
        };
        if (editGrupoId) {
            // TODO: await axios.put(`/update_grupo/${editGrupoId}`, payload)
            setGrupos(prev => prev.map(g => g.id === editGrupoId ? { ...g, ...payload } : g));
            setEditGrupoId(null);
        } else {
            // TODO: await axios.post("/crear_grupo", payload)
            setGrupos(prev => [...prev, { id: newId(), ...payload }]);
        }
        setGrupoForm({ nombre: "", semestre: "", programa_id: "", cupo: "" });
        setShowGrupoForm(false);
    };

    const deleteGrupo = (id) => {
        // TODO: await axios.delete(`/eliminar_grupo/${id}`)
        setGrupos(prev => prev.filter(g => g.id !== id));
    };

    return (
        <div className="space-y-5">

            {/* ── Fila superior: Facultades + Programas ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── Facultades ── */}
                <div className={cx.card}>
                    <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-neutral-800">Facultades</h2>
                            <p className="text-xs text-neutral-400 mt-0.5">{facultades.length} registradas · clic para filtrar</p>
                        </div>
                        <button onClick={() => { setShowFacForm(v => !v); setEditFacId(null); setFacForm({ nombre: "", codigo: "" }); }}
                            className={cx.btnPrimary}>
                            {showFacForm ? "Cancelar" : "+ Nueva"}
                        </button>
                    </div>

                    {showFacForm && (
                        <form onSubmit={saveFacultad} className="px-5 py-4 bg-neutral-50/70 border-b border-neutral-100 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={cx.label}>Nombre</label>
                                    <input required className={cx.input} placeholder="Ej: Ingeniería"
                                        value={facForm.nombre}
                                        onChange={e => setFacForm(f => ({ ...f, nombre: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={cx.label}>Código</label>
                                    <input required className={cx.input} placeholder="Ej: ING" maxLength={8}
                                        value={facForm.codigo}
                                        onChange={e => setFacForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))} />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className={cx.btnPrimary}>{editFacId ? "Actualizar" : "Agregar"}</button>
                                <button type="button" onClick={() => { setShowFacForm(false); setEditFacId(null); }} className={cx.btnSecondary}>Cancelar</button>
                            </div>
                        </form>
                    )}

                    <div className="divide-y divide-neutral-50">
                        {facultades.map(f => (
                            <div key={f.id}
                                onClick={() => { setSelectedFac(selectedFac === f.id ? null : f.id); setSelectedProg(null); }}
                                className={`px-5 py-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                                    selectedFac === f.id ? "bg-neutral-900" : "hover:bg-neutral-50"
                                }`}
                            >
                                <div>
                                    <p className={`text-sm font-medium ${selectedFac === f.id ? "text-white" : "text-neutral-800"}`}>{f.nombre}</p>
                                    <p className={`text-xs mt-0.5 font-mono ${selectedFac === f.id ? "text-neutral-500" : "text-neutral-400"}`}>{f.codigo}</p>
                                </div>
                                <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                                    <button className={selectedFac === f.id
                                        ? "px-3 py-1.5 text-xs text-neutral-300 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition-colors"
                                        : cx.btnEdit}
                                        onClick={() => { setFacForm({ nombre: f.nombre, codigo: f.codigo }); setEditFacId(f.id); setShowFacForm(true); }}>
                                        Editar
                                    </button>
                                    <button className={cx.btnDanger} onClick={() => deleteFacultad(f.id)}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                        {facultades.length === 0 && (
                            <p className="px-5 py-10 text-center text-sm text-neutral-400 italic">Sin facultades registradas</p>
                        )}
                    </div>
                </div>

                {/* ── Programas — clic selecciona y filtra grupos ── */}
                <div className={cx.card}>
                    <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-neutral-800">
                                Programas
                                {selectedFac && <span className="ml-2 text-xs font-normal text-neutral-400">— {facultades.find(f => f.id === selectedFac)?.nombre}</span>}
                            </h2>
                            <p className="text-xs text-neutral-400 mt-0.5">{progsFiltrados.length} programas · clic para filtrar grupos</p>
                        </div>
                        <button onClick={() => {
                            setShowProgForm(v => !v);
                            setEditProgId(null);
                            setProgForm({ nombre: "", codigo: "", facultad_id: selectedFac ?? "" });
                        }} className={cx.btnPrimary}>
                            {showProgForm ? "Cancelar" : "+ Nuevo"}
                        </button>
                    </div>

                    {showProgForm && (
                        <form onSubmit={savePrograma} className="px-5 py-4 bg-neutral-50/70 border-b border-neutral-100 space-y-3">
                            <div>
                                <label className={cx.label}>Nombre del programa</label>
                                <input required className={cx.input} placeholder="Ej: Ingeniería de Sistemas"
                                    value={progForm.nombre}
                                    onChange={e => setProgForm(f => ({ ...f, nombre: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={cx.label}>Código</label>
                                    <input required className={cx.input} placeholder="Ej: ISI" maxLength={8}
                                        value={progForm.codigo}
                                        onChange={e => setProgForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))} />
                                </div>
                                <div>
                                    <label className={cx.label}>Facultad</label>
                                    {/* TODO: options desde GET /get_facultades */}
                                    <select required className={cx.input} value={progForm.facultad_id}
                                        onChange={e => setProgForm(f => ({ ...f, facultad_id: e.target.value }))}>
                                        <option value="">Selecciona</option>
                                        {facultades.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className={cx.btnPrimary}>{editProgId ? "Actualizar" : "Agregar"}</button>
                                <button type="button" onClick={() => { setShowProgForm(false); setEditProgId(null); }} className={cx.btnSecondary}>Cancelar</button>
                            </div>
                        </form>
                    )}

                    {!selectedFac && (
                        <p className="px-5 py-3 text-xs text-neutral-400 italic border-b border-neutral-50 bg-neutral-50/50">
                            Selecciona una facultad para filtrar sus programas
                        </p>
                    )}

                    <div className="divide-y divide-neutral-50">
                        {progsFiltrados.map(p => {
                            const fac = facultades.find(f => f.id === p.facultad_id);
                            const nGrupos = grupos.filter(g => g.programa_id === p.id).length;
                            return (
                                <div key={p.id}
                                    onClick={() => setSelectedProg(selectedProg === p.id ? null : p.id)}
                                    className={`px-5 py-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                                        selectedProg === p.id ? "bg-neutral-900" : "hover:bg-neutral-50"
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <p className={`text-sm font-medium truncate ${selectedProg === p.id ? "text-white" : "text-neutral-800"}`}>{p.nombre}</p>
                                        <p className={`text-xs mt-0.5 font-mono ${selectedProg === p.id ? "text-neutral-500" : "text-neutral-400"}`}>
                                            {p.codigo} · {fac?.nombre ?? "—"}
                                            <span className={`ml-2 ${selectedProg === p.id ? "text-neutral-400" : "text-neutral-300"}`}>· {nGrupos} grupos</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2 shrink-0 ml-3" onClick={e => e.stopPropagation()}>
                                        <button className={selectedProg === p.id
                                            ? "px-3 py-1.5 text-xs text-neutral-300 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition-colors"
                                            : cx.btnEdit}
                                            onClick={() => { setProgForm({ nombre: p.nombre, codigo: p.codigo, facultad_id: p.facultad_id }); setEditProgId(p.id); setShowProgForm(true); }}>
                                            Editar
                                        </button>
                                        <button className={cx.btnDanger} onClick={() => deletePrograma(p.id)}>Eliminar</button>
                                    </div>
                                </div>
                            );
                        })}
                        {progsFiltrados.length === 0 && (
                            <p className="px-5 py-10 text-center text-sm text-neutral-400 italic">Sin programas registrados</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Grupos de clase — card ancho completo ── */}
            <div className={cx.card}>
                <div className="px-5 py-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div>
                        <h2 className="font-semibold text-neutral-800">
                            Grupos
                            {selectedProg && (
                                <span className="ml-2 text-xs font-normal text-neutral-400">
                                    — {programas.find(p => p.id === selectedProg)?.nombre}
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {gruposFiltrados.length} grupos · cada grupo es el conjunto de estudiantes de un semestre
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {/* Filtro rápido por programa si no se seleccionó desde la lista */}
                        {/* TODO: options desde GET /get_programas */}
                        <select
                            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            value={selectedProg ?? ""}
                            onChange={e => setSelectedProg(e.target.value ? parseInt(e.target.value) : null)}
                        >
                            <option value="">Todos los programas</option>
                            {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                        <button onClick={() => {
                            setShowGrupoForm(v => !v);
                            setEditGrupoId(null);
                            setGrupoForm({ nombre: "", semestre: "", programa_id: selectedProg ?? "", cupo: "" });
                        }} className={cx.btnPrimary}>
                            {showGrupoForm ? "Cancelar" : "+ Nuevo grupo"}
                        </button>
                    </div>
                </div>

                {/* Formulario de grupo */}
                {showGrupoForm && (
                    <form onSubmit={saveGrupo} className="px-5 py-4 bg-neutral-50/70 border-b border-neutral-100 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                                <label className={cx.label}>Nombre del grupo</label>
                                <input required className={cx.input} placeholder="Ej: Grupo 01"
                                    value={grupoForm.nombre}
                                    onChange={e => setGrupoForm(f => ({ ...f, nombre: e.target.value }))} />
                            </div>
                            <div>
                                <label className={cx.label}>Semestre</label>
                                <input type="number" min="1" max="12" required className={cx.input} placeholder="Ej: 1"
                                    value={grupoForm.semestre}
                                    onChange={e => setGrupoForm(f => ({ ...f, semestre: e.target.value }))} />
                            </div>
                            <div>
                                <label className={cx.label}>Programa académico</label>
                                {/* TODO: options desde GET /get_programas */}
                                <select required className={cx.input} value={grupoForm.programa_id}
                                    onChange={e => setGrupoForm(f => ({ ...f, programa_id: e.target.value }))}>
                                    <option value="">Selecciona programa</option>
                                    {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={cx.label}>Cupo (opcional)</label>
                                <input type="number" min="1" className={cx.input} placeholder="Ej: 35"
                                    value={grupoForm.cupo}
                                    onChange={e => setGrupoForm(f => ({ ...f, cupo: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className={cx.btnPrimary}>{editGrupoId ? "Actualizar" : "Agregar grupo"}</button>
                            <button type="button" onClick={() => { setShowGrupoForm(false); setEditGrupoId(null); }} className={cx.btnSecondary}>Cancelar</button>
                        </div>
                    </form>
                )}

                {/* Tabla de grupos */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className={cx.th}>Grupo</th>
                                <th className={cx.th}>Semestre</th>
                                <th className={cx.th}>Programa</th>
                                <th className={cx.th}>Cupo</th>
                                <th className={cx.th + " text-right"}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {gruposFiltrados.map(g => {
                                const prog = programas.find(p => p.id === g.programa_id);
                                return (
                                    <tr key={g.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className={`${cx.td} font-medium`}>{g.nombre}</td>
                                        <td className={cx.td}>
                                            <span className={`${cx.badge} bg-neutral-100 text-neutral-600`}>Sem. {g.semestre}</span>
                                        </td>
                                        <td className={`${cx.td} text-neutral-500 max-w-[200px] truncate`}>{prog?.nombre ?? "—"}</td>
                                        <td className={cx.td}>
                                            {g.cupo
                                                ? <span className={`${cx.badge} bg-neutral-900 text-white`}>{g.cupo}</span>
                                                : <span className="text-neutral-300">—</span>
                                            }
                                        </td>
                                        <td className={`${cx.td} text-right`}>
                                            <div className="flex gap-2 justify-end">
                                                <button className={cx.btnEdit}
                                                    onClick={() => {
                                                        setGrupoForm({ nombre: g.nombre, semestre: g.semestre, programa_id: g.programa_id, cupo: g.cupo ?? "" });
                                                        setEditGrupoId(g.id);
                                                        setShowGrupoForm(true);
                                                    }}>
                                                    Editar
                                                </button>
                                                <button className={cx.btnDanger} onClick={() => deleteGrupo(g.id)}>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {gruposFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-5 py-10 text-center text-neutral-400 italic text-sm">
                                        {selectedProg ? "Este programa no tiene grupos registrados" : "Sin grupos registrados"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB: PERIODOS
// ═════════════════════════════════════════════════════════════════════════════
function TabPeriodos({ periodos, setPeriodos }) {
    const [showForm, setShowForm] = useState(false);
    const [form,    setForm]    = useState({ nombre: "", inicio: "", fin: "", activo: false });
    const [editId,  setEditId]  = useState(null);

    const handleSave = (e) => {
        e.preventDefault();
        if (editId) {
            // TODO: await axios.put(`/update_periodo/${editId}`, form)
            setPeriodos(prev => prev.map(p => p.id === editId ? { ...p, ...form } : p));
            setEditId(null);
        } else {
            // TODO: await axios.post("/crear_periodo", form)
            setPeriodos(prev => [...prev, { id: newId(), ...form }]);
        }
        setForm({ nombre: "", inicio: "", fin: "", activo: false });
        setShowForm(false);
    };

    const handleDelete = (id) => {
        // TODO: await axios.delete(`/eliminar_periodo/${id}`)
        setPeriodos(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className={`${cx.card} max-w-3xl`}>
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-neutral-800">Periodos / Semestres</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">{periodos.length} periodos registrados</p>
                </div>
                <button onClick={() => { setShowForm(v => !v); setEditId(null); setForm({ nombre: "", inicio: "", fin: "", activo: false }); }}
                    className={cx.btnPrimary}>
                    {showForm ? "Cancelar" : "+ Nuevo"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSave} className="px-5 py-4 bg-neutral-50/70 border-b border-neutral-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className={cx.label}>Nombre</label>
                            <input required className={cx.input} placeholder="Ej: 2026-1"
                                value={form.nombre}
                                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                        </div>
                        <div>
                            <label className={cx.label}>Fecha inicio</label>
                            <input type="date" required className={cx.input}
                                value={form.inicio}
                                onChange={e => setForm(f => ({ ...f, inicio: e.target.value }))} />
                        </div>
                        <div>
                            <label className={cx.label}>Fecha fin</label>
                            <input type="date" required className={cx.input}
                                value={form.fin}
                                onChange={e => setForm(f => ({ ...f, fin: e.target.value }))} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input type="checkbox" className="w-4 h-4 accent-black rounded"
                            checked={form.activo}
                            onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} />
                        <span className="text-sm text-neutral-700">Marcar como periodo activo</span>
                    </label>
                    <div className="flex gap-2">
                        <button type="submit" className={cx.btnPrimary}>{editId ? "Actualizar" : "Agregar"}</button>
                        <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className={cx.btnSecondary}>Cancelar</button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                            <th className={cx.th}>Nombre</th>
                            <th className={cx.th}>Inicio</th>
                            <th className={cx.th}>Fin</th>
                            <th className={cx.th}>Estado</th>
                            <th className={cx.th + " text-right"}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {periodos.map(p => (
                            <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                                <td className={`${cx.td} font-medium`}>{p.nombre}</td>
                                <td className={cx.td}>{p.inicio}</td>
                                <td className={cx.td}>{p.fin}</td>
                                <td className={cx.td}>
                                    <span className={`${cx.badge} ${p.activo ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                                        {p.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td className={`${cx.td} text-right`}>
                                    <div className="flex gap-2 justify-end">
                                        <button className={cx.btnEdit}
                                            onClick={() => { setForm({ nombre: p.nombre, inicio: p.inicio, fin: p.fin, activo: p.activo }); setEditId(p.id); setShowForm(true); }}>
                                            Editar
                                        </button>
                                        <button className={cx.btnDanger} onClick={() => handleDelete(p.id)}>Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {periodos.length === 0 && (
                            <tr><td colSpan="5" className="px-5 py-10 text-center text-neutral-400 italic text-sm">Sin periodos registrados</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB: JORNADAS
// ═════════════════════════════════════════════════════════════════════════════
function TabJornadas({ jornadas, setJornadas }) {
    const [showForm, setShowForm] = useState(false);
    const [form,    setForm]    = useState({ nombre: "", hora_inicio: "", hora_fin: "" });
    const [editId,  setEditId]  = useState(null);

    const handleSave = (e) => {
        e.preventDefault();
        if (editId) {
            // TODO: await axios.put(`/update_jornada/${editId}`, form)
            setJornadas(prev => prev.map(j => j.id === editId ? { ...j, ...form } : j));
            setEditId(null);
        } else {
            // TODO: await axios.post("/crear_jornada", form)
            setJornadas(prev => [...prev, { id: newId(), ...form }]);
        }
        setForm({ nombre: "", hora_inicio: "", hora_fin: "" });
        setShowForm(false);
    };

    const handleDelete = (id) => {
        // TODO: await axios.delete(`/eliminar_jornada/${id}`)
        setJornadas(prev => prev.filter(j => j.id !== id));
    };

    const durationLabel = (inicio, fin) => {
        const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
        const diff = toMin(fin) - toMin(inicio);
        if (diff <= 0) return "";
        return `${Math.floor(diff / 60)}h${diff % 60 ? ` ${diff % 60}min` : ""}`;
    };

    return (
        <div className={`${cx.card} max-w-xl`}>
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-neutral-800">Jornadas</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">{jornadas.length} jornadas registradas</p>
                </div>
                <button onClick={() => { setShowForm(v => !v); setEditId(null); setForm({ nombre: "", hora_inicio: "", hora_fin: "" }); }}
                    className={cx.btnPrimary}>
                    {showForm ? "Cancelar" : "+ Nueva"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSave} className="px-5 py-4 bg-neutral-50/70 border-b border-neutral-100 space-y-3">
                    <div>
                        <label className={cx.label}>Nombre</label>
                        <input required className={cx.input} placeholder="Ej: Diurna"
                            value={form.nombre}
                            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={cx.label}>Hora inicio</label>
                            <input type="time" required className={cx.input}
                                value={form.hora_inicio}
                                onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))} />
                        </div>
                        <div>
                            <label className={cx.label}>Hora fin</label>
                            <input type="time" required className={cx.input}
                                value={form.hora_fin}
                                onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className={cx.btnPrimary}>{editId ? "Actualizar" : "Agregar"}</button>
                        <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className={cx.btnSecondary}>Cancelar</button>
                    </div>
                </form>
            )}

            <div className="divide-y divide-neutral-50">
                {jornadas.map(j => (
                    <div key={j.id} className="px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-neutral-600">{j.nombre[0]}</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-800">{j.nombre}</p>
                                <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                                    {j.hora_inicio} — {j.hora_fin}
                                    {j.hora_inicio && j.hora_fin && (
                                        <span className="ml-2 text-neutral-300">{durationLabel(j.hora_inicio, j.hora_fin)}</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button className={cx.btnEdit}
                                onClick={() => { setForm({ nombre: j.nombre, hora_inicio: j.hora_inicio, hora_fin: j.hora_fin }); setEditId(j.id); setShowForm(true); }}>
                                Editar
                            </button>
                            <button className={cx.btnDanger} onClick={() => handleDelete(j.id)}>Eliminar</button>
                        </div>
                    </div>
                ))}
                {jornadas.length === 0 && (
                    <p className="px-5 py-10 text-center text-sm text-neutral-400 italic">Sin jornadas registradas</p>
                )}
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB: ASIGNATURAS
// ═════════════════════════════════════════════════════════════════════════════
function TabAsignaturas({ asignaturas, setAsignaturas, programas }) {
    const [showForm,   setShowForm]   = useState(false);
    const [form,       setForm]       = useState({ nombre: "", codigo: "", creditos: "", programa_id: "" });
    const [editId,     setEditId]     = useState(null);
    const [filterProg, setFilterProg] = useState("");

    const lista = filterProg
        ? asignaturas.filter(a => a.programa_id === parseInt(filterProg))
        : asignaturas;

    const handleSave = (e) => {
        e.preventDefault();
        const payload = { ...form, creditos: parseInt(form.creditos), programa_id: parseInt(form.programa_id) };
        if (editId) {
            // TODO: await axios.put(`/update_asignatura/${editId}`, payload)
            setAsignaturas(prev => prev.map(a => a.id === editId ? { ...a, ...payload } : a));
            setEditId(null);
        } else {
            // TODO: await axios.post("/crear_asignatura", payload)
            setAsignaturas(prev => [...prev, { id: newId(), ...payload }]);
        }
        setForm({ nombre: "", codigo: "", creditos: "", programa_id: "" });
        setShowForm(false);
    };

    const handleDelete = (id) => {
        // TODO: await axios.delete(`/eliminar_asignatura/${id}`)
        setAsignaturas(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className={`${cx.card} max-w-4xl`}>
            <div className="px-5 py-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div>
                    <h2 className="font-semibold text-neutral-800">Asignaturas</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">{lista.length} asignaturas</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {/* TODO: options desde GET /get_programas */}
                    <select className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        value={filterProg} onChange={e => setFilterProg(e.target.value)}>
                        <option value="">Todos los programas</option>
                        {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <button onClick={() => { setShowForm(v => !v); setEditId(null); setForm({ nombre: "", codigo: "", creditos: "", programa_id: "" }); }}
                        className={cx.btnPrimary}>
                        {showForm ? "Cancelar" : "+ Nueva"}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSave} className="px-5 py-4 bg-neutral-50/70 border-b border-neutral-100 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={cx.label}>Nombre</label>
                            <input required className={cx.input} placeholder="Ej: Bases de Datos"
                                value={form.nombre}
                                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                        </div>
                        <div>
                            <label className={cx.label}>Código</label>
                            <input required className={cx.input} placeholder="Ej: BD101" maxLength={10}
                                value={form.codigo}
                                onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))} />
                        </div>
                        <div>
                            <label className={cx.label}>Créditos</label>
                            <input type="number" min="1" max="10" required className={cx.input} placeholder="Ej: 3"
                                value={form.creditos}
                                onChange={e => setForm(f => ({ ...f, creditos: e.target.value }))} />
                        </div>
                        <div>
                            <label className={cx.label}>Programa académico</label>
                            {/* TODO: options desde GET /get_programas */}
                            <select required className={cx.input} value={form.programa_id}
                                onChange={e => setForm(f => ({ ...f, programa_id: e.target.value }))}>
                                <option value="">Selecciona programa</option>
                                {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className={cx.btnPrimary}>{editId ? "Actualizar" : "Agregar"}</button>
                        <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className={cx.btnSecondary}>Cancelar</button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                            <th className={cx.th}>Nombre</th>
                            <th className={cx.th}>Código</th>
                            <th className={cx.th}>Créditos</th>
                            <th className={cx.th}>Programa</th>
                            <th className={cx.th + " text-right"}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {lista.map(a => {
                            const prog = programas.find(p => p.id === a.programa_id);
                            return (
                                <tr key={a.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className={`${cx.td} font-medium`}>{a.nombre}</td>
                                    <td className={cx.td}>
                                        <span className={`${cx.badge} bg-neutral-100 text-neutral-600 font-mono`}>{a.codigo}</span>
                                    </td>
                                    <td className={cx.td}>
                                        <span className={`${cx.badge} bg-neutral-900 text-white`}>{a.creditos} cr</span>
                                    </td>
                                    <td className={`${cx.td} text-neutral-500 max-w- [160px] truncate`}>{prog?.nombre ?? "—"}</td>
                                    <td className={`${cx.td} text-right`}>
                                        <div className="flex gap-2 justify-end">
                                            <button className={cx.btnEdit}
                                                onClick={() => { setForm({ nombre: a.nombre, codigo: a.codigo, creditos: a.creditos, programa_id: a.programa_id }); setEditId(a.id); setShowForm(true); }}>
                                                Editar
                                            </button>
                                            <button className={cx.btnDanger} onClick={() => handleDelete(a.id)}>Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {lista.length === 0 && (
                            <tr><td colSpan="5" className="px-5 py-10 text-center text-neutral-400 italic text-sm">Sin asignaturas registradas</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
export function AdminHorario() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("horario");

    // TODO: Reemplazar estado inicial con datos cargados desde la API
    const [facultades,   setFacultades]   = useState(INIT_FACULTADES);
    const [programas,    setProgramas]    = useState(INIT_PROGRAMAS);
    const [periodos,     setPeriodos]     = useState(INIT_PERIODOS);
    const [jornadas,     setJornadas]     = useState(INIT_JORNADAS);
    const [asignaturas,  setAsignaturas]  = useState(INIT_ASIGNATURAS);
    const [docentes,     setDocentes]     = useState(INIT_DOCENTES); // TODO: GET /get_docentes
    const [grupos,       setGrupos]       = useState(INIT_GRUPOS);  // TODO: GET /get_grupos
    const [asignaciones, setAsignaciones] = useState([]);            // TODO: GET /get_asignaciones_horario
    // docente_id se agrega al filtro; controla qué grilla se muestra y qué disponibilidad se carga
    // TODO: persistir filtro en sessionStorage/URL params si se quiere mantener entre navegaciones
    const [filtro, setFiltro] = useState({ periodo_id: "", jornada_id: "", docente_id: "", programa_id: "" });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (!decoded || decoded.rol !== 1) { navigate("/login"); return; }

        // TODO: Cargar datos al montar el componente
        // Promise.all([
        //   fetchFacultades().then(setFacultades),
        //   fetchProgramas().then(setProgramas),
        //   fetchPeriodos().then(setPeriodos),
        //   fetchJornadas().then(setJornadas),
        //   fetchAsignaturas().then(setAsignaturas),
        //   fetchDocentes().then(setDocentes),
        //   fetchGrupos().then(setGrupos),
        //   fetchAsignaciones().then(setAsignaciones),
        // ]).catch(console.error);
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">

            {/* ── Header + Tab bar ── */}
            <div className="bg-white border-b border-neutral-100 sticky top-14 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-7 pb-0">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight">
                        Programación Académica
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 mb-4">
                        Gestiona horarios, grupos, periodos, jornadas y asignaturas
                    </p>

                    {/* Tabs */}
                    <div className="flex gap-0 overflow-x-auto">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? "border-neutral-900 text-neutral-900"
                                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-200"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Contenido de tab ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {activeTab === "horario" && (
                    <TabHorario
                        filtro={filtro} setFiltro={setFiltro}
                        periodos={periodos} jornadas={jornadas}
                        programas={programas} asignaturas={asignaturas}
                        docentes={docentes} grupos={grupos}
                        asignaciones={asignaciones} setAsignaciones={setAsignaciones}
                    />
                )}
                {activeTab === "grupos" && (
                    <TabGrupos
                        facultades={facultades} setFacultades={setFacultades}
                        programas={programas}   setProgramas={setProgramas}
                        grupos={grupos}         setGrupos={setGrupos}
                    />
                )}
                {activeTab === "periodos" && (
                    <TabPeriodos periodos={periodos} setPeriodos={setPeriodos} />
                )}
                {activeTab === "jornadas" && (
                    <TabJornadas jornadas={jornadas} setJornadas={setJornadas} />
                )}
                {activeTab === "asignaturas" && (
                    <TabAsignaturas
                        asignaturas={asignaturas} setAsignaturas={setAsignaturas}
                        programas={programas}
                    />
                )}
            </div>
        </div>
    );
}
