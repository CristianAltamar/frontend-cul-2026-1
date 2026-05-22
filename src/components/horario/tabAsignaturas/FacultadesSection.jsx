import { useEffect, useState } from "react";
import { cx } from "../../../pages/AdminHorario.jsx";
import { useAdminHorarioStore } from "../../../stores/useAdminHorarioStore.js";
import { ConfirmModal } from "../../ConfirmModal.jsx";

export function FacultadesSection() {
    const { getFacultades, updateFacultad, createFacultad, deleteFacultad, facultades, setFacultades } = useAdminHorarioStore();
    const [showFacForm, setShowFacForm] = useState(false);
    const [facForm, setFacForm] = useState({ nombre: "" });
    const [editFacId, setEditFacId] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', action: null });

    const saveFacultad = (e) => {
        e.preventDefault();
        const action = editFacId ? 'actualizar' : 'crear';
        setModal({
            isOpen: true,
            type: 'info',
            title: action === 'actualizar' ? 'Actualizar facultad' : 'Crear facultad',
            message: `¿Estás seguro de que deseas ${action} la facultad "${facForm.nombre}"?`,
            action: async () => {
                try {
                    if (editFacId) {
                        await updateFacultad(editFacId, facForm);
                    } else {
                        await createFacultad(facForm);
                    }
                } catch (error) {
                    console.error("Error al guardar facultad:", error);
                }
                setFacForm({ nombre: "" });
                setShowFacForm(false);
            }
        });
    };

    const handleDeleteFacultad = (id) => {
        const facultad = facultades.find(f => f.id === id);
        setModal({
            isOpen: true,
            type: 'warning',
            title: 'Eliminar facultad',
            message: `¿Estás seguro de que deseas eliminar la facultad "${facultad?.nombre}"? Esta acción no se puede deshacer.`,
            action: async () => {
                try {
                    await deleteFacultad(id);
                } catch (error) {
                    console.error("Error al eliminar facultad:", error);
                }
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-neutral-800">Facultades</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{facultades.length} registradas · clic para filtrar</p>
                </div>
                <button onClick={() => { setShowFacForm(v => !v); setEditFacId(null); setFacForm({ nombre: "" }); }}
                    className={cx.btnPrimary}>
                    {showFacForm ? "Cancelar" : "+ Nueva"}
                </button>
            </div>

            {showFacForm && (
                <form onSubmit={saveFacultad} className="px-5 py-4 bg-neutral-50/70 border-b border-neutral-100 space-y-3">
                    <div>
                        <label className={cx.label}>Nombre</label>
                        <input required className={cx.input} placeholder="Ej: Ingeniería"
                            value={facForm.nombre}
                            onChange={e => setFacForm(f => ({ ...f, nombre: e.target.value }))} />
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
                                onClick={() => { setFacForm({ nombre: f.nombre }); setEditFacId(f.id); setShowFacForm(true); }}>
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

            <ConfirmModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                confirmText={modal.type === 'warning' ? 'Eliminar' : 'Aceptar'}
                onConfirm={async () => {
                    await modal.action?.();
                    setModal({ isOpen: false, type: 'info', title: '', message: '', action: null });
                }}
                onCancel={() => setModal({ isOpen: false, type: 'info', title: '', message: '', action: null })}
            />
        </div>
    );
}