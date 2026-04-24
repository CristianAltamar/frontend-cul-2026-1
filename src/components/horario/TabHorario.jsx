import { useState, useEffect, use } from "react";
import { getDisponibilidadDocente } from "../../services/disponibilidadService.js";
import { getHorarioDocente, crearHorario, updateHorario, deleteHorario, getHorarios } from "../../services/horarioService.js";
import { cx } from "../../pages/AdminHorario.jsx";
import { createSchedule, formatTimeForApi } from "../../utils/schedule.js";
import { LoadingSpinner } from "../LoadingSpinner.jsx";
import { Slots } from "./tabHorario/Slots.jsx";
import { TableHorario } from "./tabHorario/TableHorario.jsx";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function TabHorario({ filtro, setFiltro, periodos, jornadas, programas, asignaturas, docentes, grupos, asignaciones, setAsignaciones }) {
    const [modal,   setModal]   = useState(null);
    const [form,    setForm]    = useState({ asignatura_id: "", grupo_id: "", aula: "", _id: null });
    const [saving,  setSaving]  = useState(false);
    const [blockMsg,       setBlockMsg]       = useState("");
    const [conflictoGrupo, setConflictoGrupo] = useState(null);

    const [dispDocente, setDispDocente] = useState([]);
    const [loadingDisp, setLoadingDisp] = useState(false);
    const [loadingAsignaciones, setLoadingAsignaciones] = useState(false);

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
        if (!modal) return;
        if (form.asignatura_id) {
            setFiltro(f => ({ ...f, programa_id: asignaturas.find(a => a.id === parseInt(form.asignatura_id))?.programa_id || "" }));
        }
    }, [modal]);


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

    const gruposFiltrados = grupos.filter(g => g.id_jornada === parseInt(filtro.jornada_id));



    // Solo asignaciones del docente seleccionado → lo que se muestra como tarjeta en la grilla
    const getAsignacionPropia = (dia, hora) => 
        asignaciones.find(a => 
            a?.dia_semana  === dia &&
            a?.hora_inicio === hora &&
            a?.id_periodo  === parseInt(filtro.periodo_id) &&
            a?.id_jornada  === parseInt(filtro.jornada_id) &&
            a?.id_docente  === parseInt(filtro.docente_id)
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
        const existing = getAsignacionPropia(DIA_NUM[dia], formatTimeForApi(slot.inicio));
        setConflictoGrupo(null);
        setForm(existing
            ? { asignatura_id: String(existing.id_asignatura), grupo_id: String(existing.id_grupo) || "", aula: existing?.aula, _id: existing.id }
            : { asignatura_id: "", grupo_id: "", aula: "", _id: null }
        );
        setModal({ dia, ...slot });
    };

    const handleGrupoChange = (grupoId) => {
        const g = async () => {
            try {
                const data = await getHorarios();
                if (!data || !Array.isArray(data)) { setConflictoGrupo(null); return; }

                setForm(f => ({ ...f, grupo_id: grupoId }));
                if (!grupoId || !modal) { setConflictoGrupo(null); return; }
                const conflict = data.find(a => 
                    a.id_grupo    === parseInt(grupoId) &&
                    a.dia_semana  === DIA_NUM[modal.dia] &&
                    a.hora_inicio === formatTimeForApi(modal.inicio) &&
                    a.id_periodo  === parseInt(filtro.periodo_id) &&
                    a.id_jornada  === parseInt(filtro.jornada_id) &&
                    a.id_docente  !== parseInt(filtro.docente_id)
                );
                setConflictoGrupo(conflict ?? null);
            } catch (error) {
                console.error("Error al cargar los horarios:", error);
                setConflictoGrupo(null);}
        }
        g();
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
                id_periodo:    parseInt(filtro.periodo_id),
                id_jornada:    parseInt(filtro.jornada_id)
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
                        <TableHorario
                            timeSlots={timeSlots}
                            isDisponible={isDisponible}
                            getAsignacionPropia={getAsignacionPropia}
                            asignaturas={asignaturas}
                            handleCellClick={handleCellClick}
                            docenteActual={docenteActual}
                        />
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
                                <p className="text-xs text-neutral-500 mt-0.5 truncate">{docenteActual?.primer_nombre} {docenteActual?.primer_apellido}</p>
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
                                    {filtro.programa_id && (asignaturasFiltradas.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    )))}
                                </select>
                                {!filtro.programa_id && (
                                    <p className="text-xs text-red-400 mt-1">Selecciona un programa en los filtros para acotar.</p>
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
                                    {filtro.programa_id && gruposFiltrados.map(g =>  (
                                            <option key={g.id} value={g.id}>
                                                {g.codigo}
                                            </option>
                                    ))}
                                </select>
                                {conflictoGrupo ? (
                                    <p className="text-xs text-red-600 mt-1 font-medium">
                                        Ya asignado a <strong>{conflictoGrupo?.docente ?? "otro docente"}</strong> en este horario.
                                    </p>
                                ) : !filtro.programa_id ? (
                                    <p className="text-xs text-red-400 mt-1">Selecciona un programa para filtrar grupos.</p>
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