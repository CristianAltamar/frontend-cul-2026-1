import { cx } from "../../../pages/AdminHorario"; 

export const TarjetaStats = ({ stats, resultados }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
            <div className={`${cx.card} p-5`}>
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                    Clases asignadas
                </p>
                <p className="text-3xl font-bold text-neutral-900 mt-2 tabular-nums">
                    {stats.totalClases}
                </p>
                <p className="text-xs text-neutral-400 mt-1">por semana</p>
            </div>

            <div className={`${cx.card} p-5`}>
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                    Horas semanales
                </p>
                <p className="text-3xl font-bold text-neutral-900 mt-2 tabular-nums">
                    {Math.floor(stats.totalMinutos / 60)}
                    <span className="text-lg text-neutral-500">h</span>
                    {stats.totalMinutos % 60 > 0 && (
                        <span className="text-lg text-neutral-500">
                            {stats.totalMinutos % 60}min
                        </span>
                    )}
                </p>
                <p className="text-xs text-neutral-400 mt-1">tiempo en clase</p>
            </div>

            <div className={`${cx.card} p-5`}>
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                    Días activos
                </p>
                <p className="text-3xl font-bold text-neutral-900 mt-2 tabular-nums">
                    {stats.diasActivos.length}
                </p>
                <p className="text-xs text-neutral-400 mt-1 truncate">
                    {stats.diasActivos.join(", ")}
                </p>
            </div>

            <div className={`${cx.card} p-5`}>
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                    Periodos
                </p>
                <p className="text-3xl font-bold text-neutral-900 mt-2 tabular-nums">
                    {stats.periodos}
                </p>
                <p className="text-xs text-neutral-400 mt-1 truncate">
                    {resultados.periodos.map(p => p.nombre).join(", ") || "—"}
                </p>
            </div>
        </div>
    );
}