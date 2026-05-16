import { cx } from "../../pages/AdminHorario";
import { useReportStore } from "../../stores/useReportStore.js";
import { useEffect } from "react";

export const PanelFiltros = () => {
    const { 
        filtro, setFiltro, 
        docentes, programas, 
        loading, resultados, error,
        handleBuscar, handleLimpiar 
    } = useReportStore();

    const filtersReady =(
            filtro.docente_id &&
            filtro.programa_id &&
            filtro.fecha_inicio &&
            filtro.fecha_fin &&
            filtro.fecha_inicio <= filtro.fecha_fin
        )

    return (
        <div className={cx.card}>
            <div className="px-5 py-4 border-b border-neutral-100">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Parámetros del reporte
                </p>
            </div>

            <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Filtro 1: Docente */}
                    <div>
                        <label className={cx.label}>Docente</label>
                        <select
                            className={cx.input}
                            value={filtro.docente_id}
                            onChange={e =>
                                setFiltro({
                                    docente_id:  e.target.value,
                                    programa_id: "", // resetear programa al cambiar docente
                                })
                            }
                        >
                            <option value="">Selecciona docente</option>
                            {docentes.map(d => (
                                <option key={d.id} value={d.id}>{d.primer_nombre} {d.primer_apellido}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro 2: Programa */}
                    <div>
                        <label className={cx.label}>Programa académico</label>
                        <select
                            className={cx.input}
                            value={filtro.programa_id}
                            onChange={e => setFiltro({ programa_id: e.target.value })}
                        >
                            <option value="">
                                Selecciona programa
                            </option>
                            {programas.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nombre} ({p.codigo})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro 3: Fecha inicio */}
                    <div>
                        <label className={cx.label}>Fecha inicio</label>
                        <input
                            type="date"
                            className={cx.input}
                            value={filtro.fecha_inicio}
                            onChange={e => setFiltro({ fecha_inicio: e.target.value })}
                        />
                    </div>

                    {/* Filtro 4: Fecha fin */}
                    <div>
                        <label className={cx.label}>Fecha fin</label>
                        <input
                            type="date"
                            className={cx.input}
                            value={filtro.fecha_fin}
                            min={filtro.fecha_inicio || undefined}
                            onChange={e => setFiltro({ fecha_fin: e.target.value })}
                        />
                        {filtro.fecha_inicio && filtro.fecha_fin && filtro.fecha_inicio > filtro.fecha_fin && (
                            <p className="text-xs text-red-600 mt-1">
                                La fecha fin debe ser posterior a la fecha inicio.
                            </p>
                        )}
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 pt-1">
                    <button
                        onClick={handleBuscar}
                        disabled={!filtersReady || loading}
                        className={cx.btnPrimary}
                    >
                        Generar reporte
                    </button>
                    {(resultados !== null || error) && (
                        <button onClick={handleLimpiar} className={cx.btnSecondary}>
                            Limpiar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}