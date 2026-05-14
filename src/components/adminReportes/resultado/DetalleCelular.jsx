import { cx } from "../../../pages/AdminHorario";

export const DetalleCelular = ({ resultados }) => {
    return (
        <div className="sm:hidden space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-800">Detalle de clases</h3>
                <span className="text-xs text-neutral-400">
                    {resultados.clases.length} clase{resultados.clases.length !== 1 ? "s" : ""}
                </span>
            </div>

            {resultados.clases.map(clase => (
                <div key={clase.id} className={`${cx.card} p-4 space-y-3`}>

                    {/* Encabezado de card */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="font-semibold text-neutral-800 truncate">
                                {clase.asignatura}
                            </p>
                        </div>
                        <span className={`${cx.badge} bg-neutral-900 text-white shrink-0`}>
                            {clase.periodo}
                        </span>
                    </div>

                    {/* Día y horario */}
                    <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                        <span className="font-medium">{clase.dia_semana}</span>
                        <span className="text-neutral-300">·</span>
                        <span className="font-mono text-xs">{clase.hora_inicio}–{clase.hora_fin}</span>
                    </div>

                    {/* Badges: grupo y aula */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`${cx.badge} bg-neutral-100 text-neutral-600`}>
                            {clase.codigo_grupo}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}