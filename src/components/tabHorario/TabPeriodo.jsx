import { useState } from "react";
import { createPeriodo, updatePeriodo, deletePeriodo } from "../../services/periodoService.js";
import { cx } from "../../pages/AdminHorario.jsx";


export function TabPeriodos({ periodos, setPeriodos }) {
    const [showForm, setShowForm] = useState(false);
    const [form,    setForm]    = useState({ nombre: "", inicio: "", fin: "", activo: false });
    const [editId,  setEditId]  = useState(null);

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = { nombre: form.nombre, fecha_inicio: form.inicio, fecha_fin: form.fin };
        try {
            if (editId) {
                await updatePeriodo(editId, payload);
                setPeriodos(prev => prev.map(p => p.id === editId ? { ...p, ...form } : p));
                setEditId(null);
            } else {
                await createPeriodo(payload);
                setPeriodos(prev => [...prev, { ...form }]);
            }
        } catch (error) {
            console.error("Error al guardar periodo:", error);
        }
        setForm({ nombre: "", inicio: "", fin: "", activo: false });
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        try {
            await deletePeriodo(id);
            setPeriodos(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error al eliminar periodo:", error);
        }
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