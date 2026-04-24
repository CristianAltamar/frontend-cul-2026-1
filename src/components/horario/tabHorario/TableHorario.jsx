import { Slots } from "./Slots.jsx";
import { formatTimeForApi } from "../../../utils/schedule.js";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const TableHorario = ({ timeSlots, isDisponible, getAsignacionPropia, asignaturas, handleCellClick, docenteActual }) => {
    return (
    <table className="w-full text-sm border-collapse table-fixed" style={{ minWidth: "600px" }}>
        <thead>
            <tr className="border-b border-neutral-100">
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 text-left border-r border-neutral-100 w-20 sticky left-0 bg-white z-10">
                    Hora
                </th>
                {DIAS.map(d => (
                    <th key={d} className="px-2 py-2.5 text-center border-r border-neutral-100 last:border-r-0 bg-white w-40 overflow-hidden">
                        <span className="text-xs font-semibold text-neutral-500 tracking-wide whitespace-nowrap truncate block">{d}</span>
                        {timeSlots.length > 0 && (
                            <Slots
                                timeSlots={timeSlots}
                                d={d}
                                isDisponible={isDisponible}
                            />
                        )}
                    </th>
                ))}
            </tr>
        </thead>
        <tbody>
            {timeSlots.map((slot, i) => (
                <tr key={i} className="border-b border-neutral-50 last:border-b-0 max-w-40">
                    <td className="px-4 py-2 text-[11px] text-neutral-400 font-mono border-r border-neutral-100 sticky left-0 bg-white z-10 whitespace-nowrap align-middle">
                        {slot.inicio}
                        <span className="block text-neutral-300">{slot.fin}</span>
                    </td>
                    {DIAS.map((dia, i) => {
                        const asig  = getAsignacionPropia(i+1, formatTimeForApi(slot.inicio));
                        const asig_ = asignaturas.find(a => a.id === asig?.id_asignatura);
                        const disp  = isDisponible(dia, slot.inicio, slot.fin);
                        return (
                            <td key={dia}
                                onClick={() => handleCellClick(dia, slot)}
                                className={`px-1.5 py-1.5 border-r border-neutral-50 last:border-r-0 align-top w-40 overflow-hidden ${
                                    !disp ? "cursor-not-allowed" : "cursor-pointer"
                                }`}
                            >
                                {asig ? (
                                    <div className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-2.5 py-2.5 min-h-15 flex flex-col justify-between transition-all duration-150 shadow-sm hover:shadow-md w-full overflow-hidden min-w-0">
                                        <p className="text-[11px] font-semibold leading-tight whitespace-nowrap truncate">{asig_?.nombre ?? "—"}</p>
                                        <div className="mt-1.5 space-y-0.5">
                                            <p className="text-[10px] text-neutral-400 truncate whitespace-nowrap overflow-hidden">{docenteActual?.primer_nombre ?? "—"} {docenteActual?.primer_apellido ?? "—"}</p>
                                            {asig.aula && (
                                                <span className="inline-block text-[9px] bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded-full truncate whitespace-nowrap overflow-hidden">
                                                    Aula {asig.aula}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : disp ? (
                                    <div className="min-h-15 rounded-xl bg-linear-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200 flex items-center justify-center hover:from-emerald-100 hover:to-emerald-200/80 hover:border-emerald-300 hover:shadow-sm transition-all duration-150 group">
                                        <span className="w-7 h-7 rounded-full bg-emerald-200/70 group-hover:bg-emerald-300 flex items-center justify-center text-emerald-700 text-base font-bold transition-all duration-150 group-hover:scale-110">
                                            +
                                        </span>
                                    </div>
                                ) : (
                                    <div className="min-h-15 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center opacity-40 cursor-not-allowed">
                                        <span className="text-neutral-400 text-lg select-none font-light">—</span>
                                    </div>
                                )}
                            </td>
                        );
                    })}
                </tr>
            ))}
        </tbody>
    </table>
    )
}