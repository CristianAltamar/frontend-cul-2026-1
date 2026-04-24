import { useState } from "react";
import { createGrupo, updateGrupo, deleteGrupo } from "../../services/grupoService.js";
import { cx } from "../../pages/AdminHorario.jsx";

export function TabGrupos({ grupos, setGrupos, periodos, jornadas }) {
    // ── Estado Grupos ────────────────────────────────────────────────────────
    const [showGrupoForm, setShowGrupoForm] = useState(false);
    const [grupoForm,     setGrupoForm]     = useState({ codigo: "", id_periodo: "", id_jornada: "", cupo: "" });
    const [editGrupoId,   setEditGrupoId]   = useState(null);

    const gruposFiltrados = grupos;

    // ── Handlers Grupos ──────────────────────────────────────────────────────
    const saveGrupo = async (e) => {
        e.preventDefault();
        const payload = {
            codigo: grupoForm.codigo,
            id_periodo: parseInt(grupoForm.id_periodo),
            id_jornada: parseInt(grupoForm.id_jornada),
            cupo: grupoForm.cupo ? parseInt(grupoForm.cupo) : null,
            estado: true,
        };
        if (editGrupoId) {
            try {
                await updateGrupo(editGrupoId, payload);
                setGrupos(prev => prev.map(g => g.id === editGrupoId ? {
                    ...g,
                    ...payload,
                    codigo: payload.codigo,
                    id_periodo: payload.id_periodo,
                    id_jornada: payload.id_jornada,
                    periodo: periodos.find(p => p.id === payload.id_periodo)?.nombre ?? g.periodo,
                    jornada: jornadas.find(j => j.id === payload.id_jornada)?.nombre ?? g.jornada,
                    cupo: payload.cupo,
                } : g));
                setEditGrupoId(null);
            } catch (error) {
                console.error("Error al actualizar grupo:", error);
            }
        } else {
            try {
                const response = await createGrupo(payload);
                const created = response.resultado ?? { ...payload };
                setGrupos(prev => [...prev, {
                    ...created,
                    codigo: payload.codigo,
                    id_periodo: payload.id_periodo,
                    id_jornada: payload.id_jornada,
                    periodo: periodos.find(p => p.id === payload.id_periodo)?.nombre ?? "",
                    jornada: jornadas.find(j => j.id === payload.id_jornada)?.nombre ?? "",
                    cupo: payload.cupo,
                }]);
            } catch (error) {
                console.error("Error al crear grupo:", error);
            }
        }
        setGrupoForm({ codigo: "", id_periodo: "", id_jornada: "", cupo: "" });
        setShowGrupoForm(false);
    };

    const handleDeleteGrupo = async (id) => {
        try {
            await deleteGrupo(id);
            setGrupos(prev => prev.filter(g => g.id !== id));
        } catch (error) {
            console.error("Error al eliminar grupo:", error);
        }
    };

    return (
        <div className={`${cx.card} max-w-4xl`}>
            <div className="px-5 py-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div>
                    <h2 className="font-semibold text-neutral-800">Grupos</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                        {gruposFiltrados.length} grupos · cada grupo es el conjunto de estudiantes de un semestre
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => {
                        setShowGrupoForm(v => !v);
                        setEditGrupoId(null);
                        setGrupoForm({ codigo: "", id_periodo: "", id_jornada: "", cupo: "" });
                    }} className={cx.btnPrimary}>
                        {showGrupoForm ? "Cancelar" : "+ Nuevo grupo"}
                    </button>
                </div>
            </div>

            <div>
                {showGrupoForm && (
                    <form onSubmit={saveGrupo} className="px-5 py-4 bg-neutral-50/70 border-b border-neutral-100 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                                <label className={cx.label}>Código del grupo</label>
                                <input required className={cx.input} placeholder="Ej: G-101"
                                    value={grupoForm.codigo}
                                    onChange={e => setGrupoForm(f => ({ ...f, codigo: e.target.value }))} />
                            </div>
                            <div>
                                <label className={cx.label}>Periodo</label>
                                <select required className={cx.input} value={grupoForm.id_periodo}
                                    onChange={e => setGrupoForm(f => ({ ...f, id_periodo: e.target.value }))}>
                                    <option value="">Selecciona periodo</option>
                                    {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={cx.label}>Jornada</label>
                                <select required className={cx.input} value={grupoForm.id_jornada}
                                    onChange={e => setGrupoForm(f => ({ ...f, id_jornada: e.target.value }))}>
                                    <option value="">Selecciona jornada</option>
                                    {jornadas.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
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
                                <th className={cx.th}>Jornada</th>
                                <th className={cx.th}>Periodo</th>
                                <th className={cx.th}>Cupo</th>
                                <th className={cx.th + " text-right"}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {gruposFiltrados.map(g => {
                                return (
                                    <tr key={g.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className={`${cx.td} font-medium`}>{g.codigo}</td>
                                        <td className={cx.td}>{g.jornada ?? "—"}</td>
                                        <td className={`${cx.td} text-neutral-500 max-w-50 truncate`}>{g.periodo ?? "—"}</td>
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
                                                        setGrupoForm({ codigo: g.codigo, id_periodo: g.id_periodo ?? "", id_jornada: g.id_jornada ?? "", cupo: g.cupo ?? "" });
                                                        setEditGrupoId(g.id);
                                                        setShowGrupoForm(true);
                                                    }}>
                                                    Editar
                                                </button>
                                                <button className={cx.btnDanger} onClick={() => handleDeleteGrupo(g.id)}>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {gruposFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-5 py-10 text-center text-neutral-400 italic text-sm">
                                        {gruposFiltrados.length === 0 ? "Sin grupos registrados" : ""}
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