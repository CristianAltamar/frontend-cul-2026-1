import { useState } from "react";
import { cx } from "../../pages/AdminHorario.jsx";
import { useAdminHorarioStore } from "../../stores/useAdminHorarioStore.js";

export function ProgramasSection() {
    const { getProgramas, updatePrograma, deletePrograma, createPrograma, programas, facultades } = useAdminHorarioStore();
    const [showProgForm, setShowProgForm] = useState(false);
    const [progForm, setProgForm] = useState({ nombre: "", codigo: "", facultad_id: "" });
    const [editProg, setEditProg] = useState(null);

    const savePrograma = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...progForm, id_facultad: progForm.facultad_id };
            if (editProg) {
                await updatePrograma(editProg.id, payload);
                setEditProg(null);
            } else {
                await createPrograma(payload);
            }
        } catch (error) {
            console.error("Error al guardar programa:", error);
        }
        setProgForm({ nombre: "", codigo: "", facultad_id: "" });
        setShowProgForm(false);
    };

    const handleDeletePrograma = async (id) => {
        try {
            await deletePrograma(id);
        } catch (error) {
            console.error("Error al eliminar programa:", error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-neutral-800">Programas</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{programas.length} programas</p>
                </div>
                <button onClick={() => {
                    setShowProgForm(v => !v);
                    setEditProg(null);
                    setProgForm({ nombre: "", codigo: "", facultad_id: "" });
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
                            <input required className={cx.input} placeholder="Ej: ISI" maxLength={20}
                                value={progForm.codigo}
                                onChange={e => setProgForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))} />
                        </div>
                        <div>
                            <label className={cx.label}>Facultad</label>
                            <select required className={cx.input} value={progForm.facultad_id}
                                onChange={e => setProgForm(f => ({ ...f, facultad_id: e.target.value }))}>
                                <option value="">Selecciona</option>
                                {facultades.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className={cx.btnPrimary}>{editProg ? "Actualizar" : "Agregar"}</button>
                        <button type="button" onClick={() => { setShowProgForm(false); setEditProg(null); }} className={cx.btnSecondary}>Cancelar</button>
                    </div>
                </form>
            )}

            <div className="divide-y divide-neutral-50">
                {programas.map(p => {
                    return (
                        <div key={p.id}
                            className={`px-5 py-3.5 flex items-center justify-between cursor-pointer transition-colors hover:bg-neutral-50`}
                        >
                            <div className="min-w-0">
                                <p className={`text-sm font-medium truncate text-neutral-800`}>{p.nombre}</p>
                                <p className={`text-xs mt-0.5 font-mono text-neutral-400`}>
                                    {p.codigo} · {p?.nombre_facultad ?? "—"}
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0 ml-3">
                                <button className={cx.btnEdit}
                                    onClick={() => { setProgForm({ nombre: p.nombre, codigo: p.codigo, facultad_id: p.id_facultad }); setEditProg(p); setShowProgForm(true); }}>
                                    Editar
                                </button>
                                <button className={cx.btnDanger} onClick={() => handleDeletePrograma(p.id)}>Eliminar</button>
                            </div>
                        </div>
                    );
                })}
                {programas.length === 0 && (
                    <p className="px-5 py-10 text-center text-sm text-neutral-400 italic">Sin programas registrados</p>
                )}
            </div>
        </div>
    );
}