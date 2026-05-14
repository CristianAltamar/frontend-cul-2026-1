import { cx } from "../../../pages/AdminHorario";

export const TablaDetalle = ({ resultados }) => {
    return (
        <div className={`${cx.card} overflow-hidden hidden sm:block`}>
            <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="font-semibold text-neutral-800">Detalle de clases</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                    {resultados.clases.length} clase{resultados.clases.length !== 1 ? "s" : ""} encontrada{resultados.clases.length !== 1 ? "s" : ""}
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: "640px" }}>
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                            <th className={cx.th}>Día</th>
                            <th className={cx.th}>Horario</th>
                            <th className={cx.th}>Asignatura</th>
                            <th className={cx.th}>Grupo</th>
                            <th className={cx.th}>Período</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {resultados.clases.map(clase => (
                            <tr
                                key={clase.id}
                                className="hover:bg-neutral-50/50 transition-colors"
                            >
                                <td className={`${cx.td} font-medium text-neutral-800`}>
                                    {clase.dia_semana}
                                </td>
                                <td className={cx.td}>
                                    <span className="font-mono text-xs text-neutral-600 whitespace-nowrap">
                                        {clase.hora_inicio}–{clase.hora_fin}
                                    </span>
                                </td>
                                <td className={cx.td}>
                                    {clase.asignatura}
                                </td>
                                <td className={cx.td}>
                                    <p className="text-neutral-700">{clase.codigo_grupo}</p>
                                </td>
                                <td className={cx.td}>
                                    <span className={`${cx.badge} bg-neutral-900 text-white`}>
                                        {clase.periodo}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}