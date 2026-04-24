import { useState } from "react";
import { cx } from "../../pages/AdminHorario.jsx";
import { createFacultad, updateFacultad, deleteFacultad } from "../../services/facultadService.js";

export function FacultadesSection({ facultades, setFacultades }) {
    const [showFacForm, setShowFacForm] = useState(false);
    const [facForm, setFacForm] = useState({ nombre: "", codigo: "" });
    const [editFacId, setEditFacId] = useState(null);

    const saveFacultad = async (e) => {
        e.preventDefault();
        try {
            if (editFacId) {
                await updateFacultad(editFacId, facForm);
                setFacultades(prev => prev.map(f => f.id === editFacId ? { ...f, ...facForm } : f));
                setEditFacId(null);
            } else {
                // eslint-disable-next-line no-unused-vars
                const response = await createFacultad(facForm);
                setFacultades(prev => [...prev, { ...facForm }]);
            }
        } catch (error) {
            console.error("Error al guardar facultad:", error);
        }
        setFacForm({ nombre: "", codigo: "" });
        setShowFacForm(false);
    };

    const handleDeleteFacultad = async (id) => {
        try {
            await deleteFacultad(id);
            setFacultades(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error("Error al eliminar facultad:", error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-neutral-800">Facultades</h3>
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
                        className={`px-5 py-3.5 flex items-center justify-between cursor-pointer transition-colors hover:bg-neutral-50`}
                    >
                        <div>
                            <p className={`text-sm font-medium text-neutral-800`}>{f.nombre}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button className={cx.btnEdit}
                                onClick={() => { setFacForm({ nombre: f.nombre, codigo: f.codigo }); setEditFacId(f.id); setShowFacForm(true); }}>
                                Editar
                            </button>
                            <button className={cx.btnDanger} onClick={() => handleDeleteFacultad(f.id)}>Eliminar</button>
                        </div>
                    </div>
                ))}
                {facultades.length === 0 && (
                    <p className="px-5 py-10 text-center text-sm text-neutral-400 italic">Sin facultades registradas</p>
                )}
            </div>
        </div>
    );
}