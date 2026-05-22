import { useState, useEffect } from "react";
import { getDisponibilidadDocente } from "../../services/disponibilidadService.js";
import { getHorarioDocente, crearHorario, updateHorario, deleteHorario, getHorarios } from "../../services/horarioService.js";
import { cx } from "../../pages/AdminHorario.jsx";
import { formatTimeForApi } from "../../utils/schedule.js";
import { LoadingSpinner } from "../LoadingSpinner.jsx";
import { Slots } from "./tabHorario/Slots.jsx";
import { TableHorario } from "./tabHorario/TableHorario.jsx";
import { useAdminHorarioStore } from "../../stores/useAdminHorarioStore.js";
import { Error } from "../Error.jsx";
import { parseTime } from "../../utils/schedule.js";
import { ConfirmModal } from "../ConfirmModal.jsx";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function TabHorario() {
    const { filtro, setFiltro, periodos, jornadas, programas, getProgramaByAsignatura, asignaturas, getAsignaturas, docentes, gruposFiltrados, loadGruposByPeriodoJornada, asignaciones, setAsignaciones, disponibilidadDocente, setDisponibilidadDocente, loadDisponibilidadAndHorarios, loadingDispAsig, isDisponible, getAsignacionPropia } = useAdminHorarioStore();

    const [modal,   setModal]   = useState(null);
    const [form,    setForm]    = useState({ asignatura_id: "", grupo_id: "", aula: "", _id: null });
    const [saving,  setSaving]  = useState(false);
    const [blockMsg,       setBlockMsg]       = useState("");
    const [conflictoGrupo, setConflictoGrupo] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: 'info', title: '', message: '', action: null });

    const DIA_NUM = { Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6 };

    const filtersReady =  filtro.periodo && filtro.jornada && filtro.docente;

    const handleCellClick = (dia, slot) => {
        if (!filtersReady) return;
        const disp = isDisponible(DIA_NUM[dia], slot.inicio, slot.fin);
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

    useEffect(() => {
        if (!modal) return;
        if (form.asignatura_id) {
            getProgramaByAsignatura(form.asignatura_id);
        }
    }, [modal]);


    useEffect(() => {
        if (!filtro.docente || !filtro.periodo) {
            setDisponibilidadDocente([]);
            return;
        }
        loadDisponibilidadAndHorarios(filtro.docente.id, filtro.periodo.id, filtro.jornada?.id)
    
    }, [filtro.docente, filtro.periodo, filtro.jornada]);

    useEffect(() => {
        if (!filtro.programa) return;
        getAsignaturas(filtro.programa.id);
        loadGruposByPeriodoJornada(filtro.periodo?.id, filtro.jornada?.id);
    }, [filtro.programa]);

    const showBlockMsg = (msg) => {
        setBlockMsg(msg);
        setTimeout(() => setBlockMsg(""), 3000);
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
                    a.id_periodo  === parseInt(filtro.periodo?.id) &&
                    a.id_jornada  === parseInt(filtro.jornada?.id) &&
                    a.id_docente  !== parseInt(filtro.docente?.id)
                );
                setConflictoGrupo(conflict ?? null);
            } catch (error) {
                console.error("Error al cargar los horarios:", error);
                setConflictoGrupo(null);}
        }
        g();
    };

    const handleSave = async () => {
        if (!form.asignatura_id || !form.grupo_id || !!conflictoGrupo || !modal) return;
        const action = form._id ? 'actualizar' : 'crear';
        setConfirmModal({
            isOpen: true,
            type: 'info',
            title: action === 'actualizar' ? 'Actualizar horario' : 'Crear horario',
            message: `¿Estás seguro de que deseas ${action} esta asignación?`,
            action: async () => {
                try {
                    const payload = {
                        id_grupo:      parseInt(form.grupo_id),
                        id_docente:    parseInt(filtro.docente?.id),
                        dia_semana:    DIA_NUM[modal.dia],
                        hora_inicio:   formatTimeForApi(modal.inicio),
                        hora_fin:      formatTimeForApi(modal.fin),
                        id_asignatura: parseInt(form.asignatura_id),
                        id_periodo:    parseInt(filtro.periodo?.id),
                        id_jornada:    parseInt(filtro.jornada?.id)
                    };

                    if (form._id) {
                        await updateHorario(form._id, payload);
                    } else {
                        await crearHorario(payload);
                    }

                    await loadDisponibilidadAndHorarios(filtro.docente?.id, filtro.periodo?.id, filtro.jornada?.id);
                    setModal(null);
                } catch (error) {
                    console.error("Error al guardar horario:", error);
                    showBlockMsg("No se pudo guardar el horario. Revisa la consola.");
                }
            }
        });
    };

    const handleDelete = async (id) => {
        if (!id) return;
        setConfirmModal({
            isOpen: true,
            type: 'warning',
            title: 'Eliminar horario',
            message: '¿Estás seguro de que deseas eliminar esta asignación? Esta acción no se puede deshacer.',
            action: async () => {
                try {
                    await deleteHorario(id);
                    await loadDisponibilidadAndHorarios(filtro.docente?.id, filtro.periodo?.id, filtro.jornada?.id);
                    setModal(null);
                } catch (error) {
                    console.error("Error al eliminar horario:", error);
                    showBlockMsg("No se pudo eliminar el horario. Revisa la consola.");
                }
            }
        });
    };

    return (
        <div className="space-y-5">

            {/* ── Filtros ── */}
            <div className={`${cx.card} p-5`}>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Filtrar vista</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div>
                        <label className={cx.label}>Periodo / Semestre</label>
                        <select className={cx.input} value={filtro.periodo?.id || ""}
                            onChange={e => setFiltro({periodo: periodos.find(p => p.id === parseInt(e.target.value)) || null})}>
                            <option value="">Selecciona periodo</option>
                            {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={cx.label}>Jornada</label>
                        <select className={cx.input} value={filtro.jornada?.id || ""}
                            onChange={e => setFiltro({jornada: jornadas.find(j => j.id === parseInt(e.target.value)) || null})}>
                            <option value="">Selecciona jornada</option>
                            {jornadas.map(j => (
                                <option key={j.id} value={j.id}>{j.nombre} ({j.hora_inicio}–{j.hora_fin})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={cx.label}>Docente</label>
                        <select className={cx.input} value={filtro.docente?.id || ""}
                            onChange={e => setFiltro({docente: docentes.find(d => d.id === parseInt(e.target.value)) || null})}>
                            <option value="">Selecciona docente</option>
                            {docentes.map(d => <option key={d.id} value={d.id}>{d.primer_nombre} {d.primer_apellido}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={cx.label}>Programa académico</label>
                        <select className={cx.input} value={filtro.programa?.id || ""}
                            onChange={e => setFiltro({programa: programas.find(p => p.id === parseInt(e.target.value)) || null})}>
                            <option value="">Todos los programas</option>
                            {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>

                </div>
            </div>

            {/* ── Banner: bloque horario no disponible ── */}
            {blockMsg && (
                <Error>{blockMsg}</Error>
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
                                {filtro.periodo?.nombre}
                                <span className="mx-1.5 text-neutral-300">·</span>
                                {filtro.jornada?.nombre}
                                {filtro.programa?.id && (
                                    <>
                                        <span className="mx-1.5 text-neutral-300">·</span>
                                        {filtro.programa?.nombre}
                                    </>
                                )}
                            </h2>
                            {loadingDispAsig && (
                                <div className="flex items-center gap-2 mt-0.5">
                                    <LoadingSpinner size="sm" />
                                    <p className="text-xs text-neutral-400">Cargando disponibilidad…</p>
                                </div>
                            )}
                            {!loadingDispAsig && !disponibilidadDocente.length && (
                                <p className="text-xs text-amber-600 mt-0.5">
                                    Este docente no tiene disponibilidad registrada para este periodo.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {filtro.docente && (
                                <span className="text-xs text-neutral-500">
                                    Disponibilidad de: <strong className="text-neutral-700">{filtro.docente?.primer_nombre} {filtro.docente?.primer_apellido}</strong>
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
                            handleCellClick={handleCellClick}
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
                                <p className="text-xs text-neutral-500 mt-0.5 truncate">{filtro.docente?.primer_nombre} {filtro.docente?.primer_apellido}</p>
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
                                    {filtro.programa && (asignaturas.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    )))}
                                </select>
                                {!filtro.programa && (
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
                                    {filtro.programa && gruposFiltrados.map(g =>  (
                                            <option key={g.id} value={g.id}>
                                                {g.codigo}
                                            </option>
                                    ))}
                                </select>
                                {conflictoGrupo ? (
                                    <p className="text-xs text-red-600 mt-1 font-medium">
                                        Ya asignado a <strong>{conflictoGrupo?.docente ?? "otro docente"}</strong> en este horario.
                                    </p>
                                ) : !filtro.programa ? (
                                    <p className="text-xs text-red-400 mt-1">Selecciona un programa para filtrar grupos.</p>
                                ) : null}
                            </div>

                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={handleSave}
                                disabled={!form.asignatura_id || !form.grupo_id || !!conflictoGrupo}
                                className={`${cx.btnPrimary} flex-1`}
                            >
                                Guardar
                            </button>
                            {form._id && (
                                <button onClick={() => handleDelete(form._id)} className={cx.btnDanger}>Eliminar</button>
                            )}
                            <button onClick={() => setModal(null)} className={cx.btnSecondary}>Cancelar</button>
                        </div>

                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.type === 'warning' ? 'Eliminar' : 'Aceptar'}
                onConfirm={async () => {
                    await confirmModal.action?.();
                    setConfirmModal({ isOpen: false, type: 'info', title: '', message: '', action: null });
                }}
                onCancel={() => setConfirmModal({ isOpen: false, type: 'info', title: '', message: '', action: null })}
            />
        </div>
    );
}