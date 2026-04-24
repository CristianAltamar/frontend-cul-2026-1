import { useState, useEffect } from "react";
import { getDisponibilidadDocente } from "../../services/disponibilidadService.js";
import { getHorarioDocente, crearHorario, updateHorario, deleteHorario } from "../../services/horarioService.js";
import { cx } from "../../pages/AdminHorario.jsx";
import { createSchedule, formatTimeForApi } from "../../utils/schedule.js";
import { LoadingSpinner } from "../LoadingSpinner.jsx";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function TabHorario({ filtro, setFiltro, periodos, jornadas, programas, asignaturas, docentes, grupos, asignaciones, setAsignaciones }) {
    const [modal,   setModal]   = useState(null);
    const [form,    setForm]    = useState({ asignatura_id: "", grupo_id: "", aula: "", _id: null });
    const [saving,  setSaving]  = useState(false);
    const [blockMsg,       setBlockMsg]       = useState("");
    const [conflictoGrupo, setConflictoGrupo] = useState(null);

    const [dispDocente, setDispDocente] = useState([]);
    const [loadingDisp, setLoadingDisp] = useState(false);
    const [, setLoadingAsignaciones] = useState(false);

    const toMin = t => { const p = t.split(":"); return parseInt(p[0]) * 60 + parseInt(p[1] || 0); };
    const DIA_NUM = { Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6 };

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

    useEffect(() => {
        if (!filtro.docente_id || !filtro.periodo_id) {
            setDispDocente([]);
            return;
        }
        setLoadingDisp(true);
        getDisponibilidadDocente(filtro.docente_id, filtro.periodo_id)
            .then(data => setDispDocente(data))
            .catch(error => {
                console.error("Error al cargar disponibilidad docente:", error);
                setDispDocente([]);
            })
            .finally(() => setLoadingDisp(false));
    }, [filtro.docente_id, filtro.periodo_id]);

    useEffect(() => {
        const loadHorarioDocente = async () => {
            if (!filtro.docente_id || !filtro.periodo_id || !filtro.jornada_id) {
                setAsignaciones([]);
                return;
            }
            setLoadingAsignaciones(true);
            try {
                const data = await getHorarioDocente(filtro.docente_id, filtro.periodo_id);
                setAsignaciones(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error al cargar el horario del docente:", error);
                setAsignaciones([]);
            } finally {
                setLoadingAsignaciones(false);
            }
        };

        loadHorarioDocente();
    }, [filtro.docente_id, filtro.periodo_id, filtro.jornada_id, setAsignaciones]);

    const jornadaActual = jornadas.find(j => j.id === parseInt(filtro.jornada_id));
    const docenteActual = docentes.find(d => d.id === parseInt(filtro.docente_id));
    const { scheduleStart, scheduleEnd } = jornadaActual ? createSchedule(jornadaActual.hora_inicio, jornadaActual.hora_fin, 45) : { scheduleStart: [], scheduleEnd: [] };
    const timeSlots = scheduleStart.map((inicio, index) => ({ inicio, fin: scheduleEnd[index] }));

    const asignaturasFiltradas = filtro.programa_id
        ? asignaturas.filter(a => a.programa_id === parseInt(filtro.programa_id))
        : asignaturas;

    const gruposFiltrados = grupos;

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
        if (!disp) {
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
        if (!form.asignatura_id || !form.grupo_id || hasConflict || !modal) return;
        setSaving(true);
        try {
            const payload = {
                id_grupo:      parseInt(form.grupo_id),
                id_docente:    parseInt(filtro.docente_id),
                dia_semana:    DIA_NUM[modal.dia],
                hora_inicio:   formatTimeForApi(modal.inicio),
                hora_fin:      formatTimeForApi(modal.fin),
                id_asignatura: parseInt(form.asignatura_id),
            };

            if (form._id) {
                await updateHorario(form._id, payload);
            } else {
                await crearHorario(payload);
            }

            const data = await getHorarioDocente(filtro.docente_id, filtro.periodo_id, filtro.jornada_id);
            setAsignaciones(Array.isArray(data) ? data : []);
            setModal(null);
        } catch (error) {
            console.error("Error al guardar horario:", error);
            showBlockMsg("No se pudo guardar el horario. Revisa la consola.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!id) return;
        try {
            await deleteHorario(id);
            const data = await getHorarioDocente(filtro.docente_id, filtro.periodo_id, filtro.jornada_id);
            setAsignaciones(Array.isArray(data) ? data : []);
            setModal(null);
        } catch (error) {
            console.error("Error al eliminar horario:", error);
            showBlockMsg("No se pudo eliminar el horario. Revisa la consola.");
        }
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
                            {docentes.map(d => <option key={d.id} value={d.id}>{d.primer_nombre} {d.primer_apellido}</option>)}
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
                                <div className="flex items-center gap-2 mt-0.5">
                                    <LoadingSpinner size="sm" />
                                    <p className="text-xs text-neutral-400">Cargando disponibilidad…</p>
                                </div>
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
                                        <th key={d} className="px-2 py-2.5 text-center border-r border-neutral-100 last:border-r-0 bg-white min-w-22.5">
                                            <span className="text-xs font-semibold text-neutral-500 tracking-wide">{d}</span>
                                            {timeSlots.length > 0 && (
                                                <div className="flex gap-0.5 mt-1.5 justify-center">
                                                    {timeSlots.map((s, i) => {
                                                        const slotDisp = isDisponible(d, s.inicio, s.fin);
                                                        return (
                                                            <span
                                                                key={i}
                                                                title={`${s.inicio}–${s.fin}`}
                                                                className={`h-1.5 rounded-full flex-1 max-w-3 transition-colors ${
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
                                                        <div className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-2.5 py-2.5 min-h-15 flex flex-col justify-between transition-all duration-150 shadow-sm hover:shadow-md">
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
                                                        <div className="min-h-15 rounded-xl bg-linear-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200 flex items-center justify-center hover:from-emerald-100 hover:to-emerald-200/80 hover:border-emerald-300 hover:shadow-sm transition-all duration-150 group">
                                                            <span className="w-7 h-7 rounded-full bg-emerald-200/70 group-hover:bg-emerald-300 flex items-center justify-center text-emerald-700 text-base font-bold transition-all duration-150 group-hover:scale-110">
                                                                +
                                                            </span>
                                                        </div>
                                                    ) : disp === false ? (
                                                        <div className="min-h-15 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center opacity-40 cursor-not-allowed">
                                                            <span className="text-neutral-400 text-lg select-none font-light">—</span>
                                                        </div>
                                                    ) : (
                                                        <div className="min-h-15 rounded-xl border border-dashed border-neutral-200 flex items-center justify-center hover:border-neutral-300 hover:bg-neutral-50/60 transition-all duration-150">
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