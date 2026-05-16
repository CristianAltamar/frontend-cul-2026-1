import { cx } from "../../pages/AdminHorario";
import { useReportStore } from "../../stores/useReportStore.js";
import { TarjetaStats } from "./resultado/TarjetaStats.jsx";
import { TablaDetalle } from "./resultado/TablaDetalle.jsx";
import { DetalleCelular } from "./resultado/DetalleCelular.jsx";
import { useEffect } from "react";

export const Resultado = () => {
    const { resultados, filtro, stats, loading } = useReportStore();

    useEffect(() => {
        console.log("Resultados actualizados:", resultados);
        console.log("Filtros actualizados:", filtro);
        console.log("Stats actualizados:", stats);
        console.log("Cargando:", loading);
    }, [resultados, filtro, stats, loading]);

    return (
        <div className="space-y-5">

            {/* Encabezado del reporte generado */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-neutral-800">
                        {resultados.docente?.primer_nombre} {resultados.docente?.primer_apellido}
                        <span className="mx-2 text-neutral-300">·</span>
                        <span className="font-normal text-neutral-500">
                            {resultados.asignatura}
                        </span>
                    </h2>
                    <p className="text-sm text-neutral-400 mt-0.5">
                        {filtro.fecha_inicio} → {filtro.fecha_fin}
                        {resultados.periodos.length > 0 && (
                            <span className="ml-2">
                                · {resultados.periodos.map(p => p.nombre).join(", ")}
                            </span>
                        )}
                    </p>
                </div>
                {/* TODO: Botón de exportación — conectar con backend o librería PDF */}
                {/* <button className={cx.btnSecondary}>Exportar PDF</button> */}
            </div>

            {/* ── Tarjetas de resumen ── */}
            {stats && (
                <TarjetaStats stats={stats} resultados={resultados} />
            )}

            {/* ── Sin resultados ── */}
            {resultados.clases.length === 0 ? (
                <div className={`${cx.card} py-16 flex flex-col items-center justify-center gap-3 px-4 text-center`}>
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 text-xl">
                        ◫
                    </div>
                    <div>
                        <p className="text-sm font-medium text-neutral-600">Sin clases en ese rango</p>
                        <p className="text-sm text-neutral-400 mt-1 max-w-xs">
                            No se encontraron clases asignadas para este docente en el programa y
                            fechas seleccionadas.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* ── Tabla de detalle — visible en sm+ ── */}
                    <TablaDetalle resultados={resultados} />

                    {/* ── Cards de detalle — visibles solo en mobile ── */}
                    <DetalleCelular resultados={resultados} />
                </>
            )}
        </div>
    )
}