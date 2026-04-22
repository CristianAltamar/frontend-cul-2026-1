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

// TODO: Cargar desde GET /get_docentes (filtrado por rol=2)
const INIT_DOCENTES = [
    { id: 1, nombre: "Carlos Pérez"    },
    { id: 2, nombre: "Ana González"    },
    { id: 3, nombre: "Luis Martínez"   },
    { id: 4, nombre: "María Rodríguez" },
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
function TabHorario({ filtro, setFiltro, periodos, jornadas, programas, asignaturas, docentes, asignaciones, setAsignaciones }) {
    const [modal, setModal]   = useState(null);
    const [form,  setForm]    = useState({ docente_id: "", asignatura_id: "", aula: "", _id: null });
    const [saving, setSaving] = useState(false);

    // ── Disponibilidad del docente seleccionado en el modal ───────────────────
    // TODO: dispDocente se carga desde GET /get_disponibilidad_docente/{id}?periodo_id={id}
    // Estructura esperada: [{ id, id_docente, dia_semana, hora_inicio, hora_fin, id_periodo, ... }]
    const [dispDocente,  setDispDocente]  = useState([]);
    const [loadingDisp,  setLoadingDisp]  = useState(false);

    // Convierte "HH:MM" o "HH:MM:SS" a minutos totales
    const toMin = t => { const p = t.split(":"); return parseInt(p[0]) * 60 + parseInt(p[1] || 0); };

    // Mapeo nombre de día → número (igual que en schedule.js / useDisponibilidad.js)
    const DIA_NUM = { Lunes: 1, Martes: 2, "Miércoles": 3, Jueves: 4, Viernes: 5, Sábado: 6 };

    // Verifica si el docente tiene disponibilidad que solape con el bloque dado
    // Retorna: true = disponible · false = no disponible · null = sin datos
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

    // Carga la disponibilidad del docente cada vez que cambia docente_id o periodo_id
    // TODO: cuando el backend esté disponible este effect ya está listo para producción
    useEffect(() => {
        if (!form.docente_id || !filtro.periodo_id) {
            setDispDocente([]);
            return;
        }
        setLoadingDisp(true);
        getDisponibilidadDocente(parseInt(form.docente_id), parseInt(filtro.periodo_id))
            .then(data => setDispDocente(Array.isArray(data) ? data : []))
            .catch(() => setDispDocente([]))
            .finally(() => setLoadingDisp(false));
    }, [form.docente_id, filtro.periodo_id]);

    const jornadaActual = jornadas.find(j => j.id === parseInt(filtro.jornada_id));
    const timeSlots     = jornadaActual ? generateTimeSlots(jornadaActual.hora_inicio, jornadaActual.hora_fin) : [];

    const asignaturasFiltradas = filtro.programa_id
        ? asignaturas.filter(a => a.programa_id === parseInt(filtro.programa_id))
        : asignaturas;

    const getAsignacion = (dia, hora) =>
        asignaciones.find(a =>
            a.dia          === dia &&
            a.hora_inicio  === hora &&
            a.periodo_id   === parseInt(filtro.periodo_id) &&
            a.jornada_id   === parseInt(filtro.jornada_id) &&
            a.programa_id  === parseInt(filtro.programa_id)
        );

    const openModal = (dia, slot) => {
        if (!filtro.periodo_id || !filtro.jornada_id || !filtro.programa_id) return;
        const existing = getAsignacion(dia, slot.inicio);
        setDispDocente([]); // limpia disponibilidad previa al abrir
        setForm(existing
            ? { docente_id: existing.docente_id, asignatura_id: existing.asignatura_id, aula: existing.aula, _id: existing.id }
            : { docente_id: "", asignatura_id: "", aula: "", _id: null }
        );
        setModal({ dia, ...slot });
    };

    const handleSave = async () => {
        if (!form.docente_id || !form.asignatura_id) return;
        setSaving(true);
        try {
            // TODO: Enviar al backend
            // const payload = {
            //     periodo_id:    parseInt(filtro.periodo_id),
            //     jornada_id:    parseInt(filtro.jornada_id),
            //     programa_id:   parseInt(filtro.programa_id),
            //     dia:           modal.dia,
            //     hora_inicio:   modal.inicio,
            //     hora_fin:      modal.fin,
            //     docente_id:    parseInt(form.docente_id),
            //     asignatura_id: parseInt(form.asignatura_id),
            //     aula:          form.aula,
            // };
            // form._id
            //   ? await axios.put(`/update_asignacion_horario/${form._id}`, payload)
            //   : await axios.post("/crear_asignacion_horario", payload);

            if (form._id) {
                setAsignaciones(prev => prev.map(a => a.id === form._id ? { ...a, ...form } : a));
            } else {
                setAsignaciones(prev => [...prev, {
                    id: newId(),
                    periodo_id:    parseInt(filtro.periodo_id),
                    jornada_id:    parseInt(filtro.jornada_id),
                    programa_id:   parseInt(filtro.programa_id),
                    dia:           modal.dia,
                    hora_inicio:   modal.inicio,
                    hora_fin:      modal.fin,
                    docente_id:    parseInt(form.docente_id),
                    asignatura_id: parseInt(form.asignatura_id),
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

    const filtersReady = filtro.periodo_id && filtro.jornada_id && filtro.programa_id;

    return (
        <div className="space-y-5">
            {/* ── Filtros ── */}
            <div className={`${cx.card} p-5`}>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Filtrar vista</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className={cx.label}>Periodo / Semestre</label>
                        {/* TODO: options desde GET /get_periodos */}
                        <select className={cx.input} value={filtro.periodo_id}
                            onChange={e => setFiltro(f => ({ ...f, periodo_id: e.target.value }))}>
                            <option value="">Selecciona periodo</option>
                            {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={cx.label}>Jornada</label>
                        {/* TODO: options desde GET /get_jornadas */}
                        <select className={cx.input} value={filtro.jornada_id}
                            onChange={e => setFiltro(f => ({ ...f, jornada_id: e.target.value }))}>
                            <option value="">Selecciona jornada</option>
                            {jornadas.map(j => (
                                <option key={j.id} value={j.id}>{j.nombre} ({j.hora_inicio}–{j.hora_fin})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={cx.label}>Programa académico</label>
                        {/* TODO: options desde GET /get_programas */}
                        <select className={cx.input} value={filtro.programa_id}
                            onChange={e => setFiltro(f => ({ ...f, programa_id: e.target.value }))}>
                            <option value="">Selecciona programa</option>
                            {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Grilla ── */}
            {!filtersReady ? (
                <div className={`${cx.card} py-16 flex flex-col items-center justify-center gap-2`}>
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 text-lg">◫</div>
                    <p className="text-sm text-neutral-400">Selecciona periodo, jornada y programa para ver la grilla</p>
                </div>
            ) : (
                <div className={`${cx.card} overflow-hidden`}>
                    <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-800">
                                {periodos.find(p => p.id === parseInt(filtro.periodo_id))?.nombre}
                                <span className="mx-1.5 text-neutral-300">·</span>
                                {jornadaActual?.nombre}
                                <span className="mx-1.5 text-neutral-300">·</span>
                                {programas.find(p => p.id === parseInt(filtro.programa_id))?.nombre}
                            </h2>
                        </div>
                        <span className="text-xs text-neutral-400">Clic en celda vacía para asignar</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse" style={{ minWidth: "700px" }}>
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100">
                                    <th className="px-4 py-3 text-xs font-medium text-neutral-500 text-left border-r border-neutral-100 w-24 sticky left-0 bg-neutral-50 z-10">
                                        Hora
                                    </th>
                                    {DIAS.map(d => (
                                        <th key={d} className="px-3 py-3 text-xs font-medium text-neutral-500 text-center border-r border-neutral-100 last:border-r-0">
                                            {d}
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
                                            const asig  = getAsignacion(dia, slot.inicio);
                                            const asig_ = asignaturas.find(a => a.id === asig?.asignatura_id);
                                            const doc   = docentes.find(d => d.id === asig?.docente_id);
                                            return (
                                                <td key={dia}
                                                    onClick={() => openModal(dia, slot)}
                                                    className="px-2 py-1.5 border-r border-neutral-50 last:border-r-0 cursor-pointer hover:bg-neutral-50/80 transition-colors align-top"
                                                >
                                                    {asig ? (
                                                        <div className="bg-neutral-900 text-white rounded-lg px-2.5 py-2 space-y-0.5 min-h- [44px]">
                                                            <p className="text-xs font-medium leading-tight">{asig_?.nombre ?? "—"}</p>
                                                            <p className="text-[10px] text-neutral-400">{doc?.nombre ?? "—"}</p>
                                                            {asig.aula && <p className="text-[10px] text-neutral-500">Aula {asig.aula}</p>}
                                                        </div>
                                                    ) : (
                                                        <div className="min-h- [44px] rounded-lg border border-dashed border-neutral-150 flex items-center justify-center hover:border-neutral-300 transition-colors">
                                                            <span className="text-neutral-250 text-xs">+</span>
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

            {/* ── Modal asignar clase ── */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/25 backdrop-blur-sm">
                    {/* Ancho dinámico: se amplía cuando hay docente seleccionado para mostrar disponibilidad */}
                    <div className={`bg-white rounded-2xl shadow-2xl w-full p-6 space-y-5 transition-all duration-200 ${
                        form.docente_id ? "max-w-xl" : "max-w-sm"
                    }`}>

                        {/* Encabezado */}
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Asignar clase</p>
                                <h3 className="font-semibold text-neutral-800 mt-1">
                                    {modal.dia} · {modal.inicio}–{modal.fin}
                                </h3>
                            </div>
                            <button onClick={() => setModal(null)} className="text-neutral-400 hover:text-neutral-700 text-xl leading-none mt-0.5">✕</button>
                        </div>

                        {/* Selector de docente */}
                        <div>
                            <label className={cx.label}>Docente</label>
                            {/* TODO: options desde GET /get_docentes?rol=2
                                Estructura esperada: [{ id, nombre }]
                                Al cambiar docente_id el useEffect carga automáticamente su disponibilidad */}
                            <select className={cx.input} value={form.docente_id}
                                onChange={e => setForm(f => ({ ...f, docente_id: e.target.value }))}>
                                <option value="">Selecciona docente</option>
                                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                            </select>
                        </div>

                        {/* ── Bloque de disponibilidad ─────────────────────────────────────────
                            Se muestra al seleccionar un docente.
                            Fuente: GET /get_disponibilidad_docente/{docente_id}?periodo_id={id}
                            La disponibilidad la registra el propio docente desde /disponibilidad
                        ────────────────────────────────────────────────────────────────────── */}
                        {form.docente_id && (
                            <div className="rounded-xl border border-neutral-100 overflow-hidden">

                                {/* Header del bloque */}
                                <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        Disponibilidad del docente
                                    </span>
                                    {loadingDisp ? (
                                        <span className="text-xs text-neutral-400 animate-pulse">Cargando…</span>
                                    ) : (
                                        <span className="text-xs text-neutral-400">
                                            {periodos.find(p => p.id === parseInt(filtro.periodo_id))?.nombre}
                                            {jornadaActual ? ` · ${jornadaActual.nombre}` : ""}
                                        </span>
                                    )}
                                </div>

                                {!loadingDisp && (
                                    <div className="p-4 space-y-4">

                                        {/* Estado del bloque actual (día y hora del modal) */}
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xs text-neutral-500 shrink-0">Este bloque:</span>
                                            {(() => {
                                                const disp = isDisponible(modal.dia, modal.inicio, modal.fin);
                                                if (disp === null) return (
                                                    <span className="text-xs text-neutral-400 italic">Sin datos registrados</span>
                                                );
                                                return disp ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                                        Disponible
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                                        No disponible
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        {/* Mini grilla semanal — muestra disponibilidad por día/hora de la jornada activa
                                            Verde oscuro = disponible · Gris claro = no disponible
                                            Celda con borde = el slot actual del modal */}
                                        {timeSlots.length > 0 ? (
                                            <div className="overflow-x-auto -mx-1">
                                                <table className="w-full border-collapse" style={{ minWidth: "320px" }}>
                                                    <thead>
                                                        <tr>
                                                            <th className="pr-2 pb-1.5 text-[10px] text-neutral-400 font-medium text-right w-12" />
                                                            {DIAS.map(d => (
                                                                <th key={d}
                                                                    className={`pb-1.5 px-0.5 text-[10px] font-semibold text-center ${
                                                                        modal.dia === d ? "text-neutral-900" : "text-neutral-400"
                                                                    }`}>
                                                                    {d.slice(0, 3)}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {timeSlots.map((slot, i) => (
                                                            <tr key={i}>
                                                                <td className="pr-2 py-0.5 text-[10px] text-neutral-400 font-mono text-right whitespace-nowrap align-middle">
                                                                    {slot.inicio}
                                                                </td>
                                                                {DIAS.map(dia => {
                                                                    const disp       = isDisponible(dia, slot.inicio, slot.fin);
                                                                    const isCurrent  = modal.dia === dia && modal.inicio === slot.inicio;
                                                                    return (
                                                                        <td key={dia} className="px-0.5 py-0.5">
                                                                            <div className={`h-5 rounded transition-colors ${
                                                                                isCurrent
                                                                                    ? disp
                                                                                        ? "bg-green-500 ring-2 ring-offset-1 ring-green-300"
                                                                                        : "bg-red-400  ring-2 ring-offset-1 ring-red-200"
                                                                                    : disp
                                                                                        ? "bg-neutral-800"
                                                                                        : "bg-neutral-100"
                                                                            }`} />
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            /* Si no hay jornada seleccionada en el filtro no se puede mostrar la grilla */
                                            <p className="text-xs text-neutral-400 italic">
                                                Selecciona una jornada en los filtros para ver la grilla.
                                            </p>
                                        )}

                                        {/* Sin disponibilidad registrada */}
                                        {!dispDocente.length && (
                                            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                                Este docente no ha registrado disponibilidad para el periodo seleccionado.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Asignatura y aula */}
                        <div className="space-y-4">
                            <div>
                                <label className={cx.label}>Asignatura</label>
                                {/* TODO: filtrar por programa del filtro activo — GET /get_asignaturas?programa_id={id} */}
                                <select className={cx.input} value={form.asignatura_id}
                                    onChange={e => setForm(f => ({ ...f, asignatura_id: e.target.value }))}>
                                    <option value="">Selecciona asignatura</option>
                                    {asignaturasFiltradas.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre} ({a.codigo})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={cx.label}>Aula / Salón</label>
                                {/* TODO: options desde GET /get_salones */}
                                <input className={cx.input} placeholder="Ej: A-201"
                                    value={form.aula}
                                    onChange={e => setForm(f => ({ ...f, aula: e.target.value }))} />
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2 pt-1">
                            <button onClick={handleSave}
                                disabled={saving || !form.docente_id || !form.asignatura_id}
                                className={`${cx.btnPrimary} flex-1`}>
                                {saving ? "Guardando..." : "Guardar"}
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
// TAB: GRUPOS — Facultades y Programas
// ═════════════════════════════════════════════════════════════════════════════
function TabGrupos({ facultades, setFacultades, programas, setProgramas }) {
    const [showFacForm,  setShowFacForm]  = useState(false);
    const [showProgForm, setShowProgForm] = useState(false);
    const [facForm,  setFacForm]  = useState({ nombre: "", codigo: "" });
    const [progForm, setProgForm] = useState({ nombre: "", codigo: "", facultad_id: "" });
    const [editFacId,  setEditFacId]  = useState(null);
    const [editProgId, setEditProgId] = useState(null);
    const [selectedFac, setSelectedFac] = useState(null);

    const progsFiltrados = selectedFac
        ? programas.filter(p => p.facultad_id === selectedFac)
        : programas;

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

    const deleteFacultad = (id) => {
        // TODO: await axios.delete(`/eliminar_facultad/${id}`)
        setFacultades(prev => prev.filter(f => f.id !== id));
        if (selectedFac === id) setSelectedFac(null);
    };

    const deletePrograma = (id) => {
        // TODO: await axios.delete(`/eliminar_programa/${id}`)
        setProgramas(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* ── Facultades ── */}
            <div className={cx.card}>
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-neutral-800">Facultades</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">{facultades.length} registradas · clic para filtrar programas</p>
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
                            onClick={() => setSelectedFac(selectedFac === f.id ? null : f.id)}
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

            {/* ── Programas ── */}
            <div className={cx.card}>
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-neutral-800">
                            Programas
                            {selectedFac && <span className="ml-2 text-xs font-normal text-neutral-400">
                                — {facultades.find(f => f.id === selectedFac)?.nombre}
                            </span>}
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5">{progsFiltrados.length} programas</p>
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
                        return (
                            <div key={p.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                                <div>
                                    <p className="text-sm font-medium text-neutral-800">{p.nombre}</p>
                                    <p className="text-xs text-neutral-400 mt-0.5 font-mono">{p.codigo} · {fac?.nombre ?? "—"}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button className={cx.btnEdit}
                                        onClick={() => {
                                            setProgForm({ nombre: p.nombre, codigo: p.codigo, facultad_id: p.facultad_id });
                                            setEditProgId(p.id);
                                            setShowProgForm(true);
                                        }}>
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
    const [asignaciones, setAsignaciones] = useState([]);            // TODO: GET /get_asignaciones_horario
    const [filtro, setFiltro] = useState({ periodo_id: "", jornada_id: "", programa_id: "" });

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
                        docentes={docentes}
                        asignaciones={asignaciones} setAsignaciones={setAsignaciones}
                    />
                )}
                {activeTab === "grupos" && (
                    <TabGrupos
                        facultades={facultades} setFacultades={setFacultades}
                        programas={programas}   setProgramas={setProgramas}
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
