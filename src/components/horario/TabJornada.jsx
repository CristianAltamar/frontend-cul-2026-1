import { useState } from "react";
import { createJornada, updateJornada, deleteJornada } from "../../services/jornadaService.js";
import { cx } from "../../pages/AdminHorario.jsx";
import { formatTimeForApi } from "../../utils/schedule.js";

export function TabJornadas({ jornadas, setJornadas }) {
    const [showForm, setShowForm] = useState(false);
    const [form,    setForm]    = useState({ nombre: "", hora_inicio: "", hora_fin: "" });
    const [editId,  setEditId]  = useState(null);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateJornada(editId, form);
                setJornadas(prev => prev.map(j => j.id === editId ? { ...j, ...form } : j));
                setEditId(null);
            } else {
                const response = await createJornada(form);
                const created = response.resultado ?? { ...form };
                setJornadas(prev => [...prev, created]);
            }
        } catch (error) {
            console.error("Error al guardar jornada:", error);
        }
        setForm({ nombre: "", hora_inicio: "", hora_fin: "" });
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteJornada(id);
            setJornadas(prev => prev.filter(j => j.id !== id));
        } catch (error) {
            console.error("Error al eliminar jornada:", error);
        }
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
                                onChange={e => setForm(f => ({ ...f, hora_inicio: formatTimeForApi(e.target.value) }))} />
                        </div>
                        <div>
                            <label className={cx.label}>Hora fin</label>
                            <input type="time" required className={cx.input}
                                value={form.hora_fin}
                                onChange={e => setForm(f => ({ ...f, hora_fin: formatTimeForApi(e.target.value) }))} />
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
                                onClick={() => { setForm({ nombre: j.nombre, hora_inicio: formatTimeForApi(j.hora_inicio), hora_fin: formatTimeForApi(j.hora_fin) }); setEditId(j.id); setShowForm(true); }}>
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