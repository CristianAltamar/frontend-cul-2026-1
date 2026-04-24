import { useState, useEffect, use } from "react";
import { LoadingSpinner } from "../LoadingSpinner.jsx";
import { cx } from "../../pages/AdminHorario.jsx";
import { getAsignaturas, createAsignatura, updateAsignatura, deleteAsignatura } from "../../services/asignaturaService.js";

export function AsignaturasSection({ asignaturas, setAsignaturas, programas }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ nombre: "", programa_id: "" });
    const [editId, setEditId] = useState(null);
    const [filterProg, setFilterProg] = useState("");
    const [lista, setLista] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAsignaturas = async () => {
            try {
                const data = await getAsignaturas();
                setAsignaturas(data.resultado || []);
                setLista(data || []);

            } catch (error) {
                console.error("Error al cargar asignaturas:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAsignaturas();
    }, [setAsignaturas]);

    useEffect(() => {
        console.log(asignaturas);
    }, [asignaturas]);

    const saveAsignatura = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateAsignatura(editId, form);
                setAsignaturas(prev => prev.map(a => a.id === editId ? { ...a, ...form } : a));
                setEditId(null);
            } else {
                const response = await createAsignatura(form);
                const created = response.resultado ?? { ...form };
                setAsignaturas(prev => [...prev, created]);
            }
        } catch (error) {
            console.error("Error al guardar asignatura:", error);
        }
        setForm({ nombre: "", programa_id: "" });
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteAsignatura(id);
            setAsignaturas(prev => prev.filter(a => a.id !== id));
            setLista(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error("Error al eliminar asignatura:", error);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="px-5 py-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div>
                    <h3 className="font-semibold text-neutral-800">Asignaturas</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                        {lista.length} asignaturas · cada asignatura pertenece a un programa
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select
                        className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        value={filterProg}
                        onChange={e => setFilterProg(e.target.value)}
                    >
                        <option value="">Todos los programas</option>
                        {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <button onClick={() => { setShowForm(v => !v); setEditId(null); setForm({ nombre: "", programa_id: "" }); }}
                        className={cx.btnPrimary}>
                        {showForm ? "Cancelar" : "+ Nueva asignatura"}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={saveAsignatura} className="px-5 py-4 bg-neutral-50/70 border-b border-neutral-100 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={cx.label}>Nombre de la asignatura</label>
                            <input required className={cx.input} placeholder="Ej: Matemáticas I"
                                value={form.nombre}
                                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                        </div>
                        <div>
                            <label className={cx.label}>Programa</label>
                            <select required className={cx.input} value={form.programa_id}
                                onChange={e => setForm(f => ({ ...f, programa_id: e.target.value }))}>
                                <option value="">Selecciona programa</option>
                                {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className={cx.btnPrimary}>{editId ? "Actualizar" : "Agregar asignatura"}</button>
                        <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className={cx.btnSecondary}>Cancelar</button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                            <th className={cx.th}>Asignatura</th>
                            <th className={cx.th}>Programa</th>
                            <th className={cx.th + " text-right"}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {lista.map(a => {
                            return (
                                <tr key={a.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className={`${cx.td} font-medium`}>{a.nombre}</td>
                                    <td className={`${cx.td} text-neutral-500 max-w-50 truncate`}>{a.programa ?? "—"}</td>
                                    <td className={`${cx.td} text-right`}>
                                        <div className="flex gap-2 justify-end">
                                            <button className={cx.btnEdit}
                                                onClick={() => { setForm({ nombre: a.nombre, programa_id: a.programa_id ?? "" }); setEditId(a.id); setShowForm(true); }}>
                                                Editar
                                            </button>
                                            <button className={cx.btnDanger} onClick={() => handleDelete(a.id)}>Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {lista.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-5 py-10 text-center text-neutral-400 italic text-sm">
                                    Sin asignaturas registradas
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}