import { useEffect, useMemo, useState } from "react";
import { getHorarioDocente } from "../services/horarioService.js";
import { decodeToken } from "../utils/decodeToken.js";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";

const DIAS = { 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo" };
const DIAS_CORTOS = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 7: "Dom" };

const DIA_STYLES = {
    1: { dot: "bg-sky-500", soft: "bg-sky-50 text-sky-700 ring-sky-200" },
    2: { dot: "bg-emerald-500", soft: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    3: { dot: "bg-amber-500", soft: "bg-amber-50 text-amber-700 ring-amber-200" },
    4: { dot: "bg-violet-500", soft: "bg-violet-50 text-violet-700 ring-violet-200" },
    5: { dot: "bg-rose-500", soft: "bg-rose-50 text-rose-700 ring-rose-200" },
    6: { dot: "bg-indigo-500", soft: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
    7: { dot: "bg-neutral-500", soft: "bg-neutral-100 text-neutral-700 ring-neutral-200" },
};

const formatHora = (h) => (typeof h === "string" ? h.slice(0, 5) : h);

export function Horario() {
    const [horario, setHorario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [primerNombre, setPrimerNombre] = useState("");
    const [filtroDia, setFiltroDia] = useState(0); // 0 = todos
    const navigate = useNavigate();

    useEffect(() => {
        const cargarHorario = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate("/login"); return; }
            const d = decodeToken(token);
            if (!d) { localStorage.removeItem('token'); navigate("/login"); return; }

            const firstWord = (v) =>
                typeof v === "string" && v.trim() ? v.trim().split(/\s+/)[0] : "";

            try {
                const data = await getHorarioDocente(d.user_id, 1);
                console.log("Horario cargado:", data);
                const lista = data ?? [];
                setHorario(lista);

                // El JWT solo trae user_id y rol, así que extraemos el primer
                // nombre del campo "docente" que viene en la respuesta del horario.
                const nombreCompleto = lista.find(h => h?.docente)?.docente ?? "";
                setPrimerNombre(firstWord(nombreCompleto));
            } catch (err) {
                console.error("Error cargando horario:", err);
                setHorario([]);
            } finally {
                setLoading(false);
            }
        };
        cargarHorario();
    }, []);

    const horarioOrdenado = useMemo(() => {
        return [...horario].sort((a, b) => {
            const da = Number(a.dia_semana) - Number(b.dia_semana);
            if (da !== 0) return da;
            return String(a.hora_inicio ?? "").localeCompare(String(b.hora_inicio ?? ""));
        });
    }, [horario]);

    const diasActivos = useMemo(() => {
        const set = new Set(horarioOrdenado.map(h => Number(h.dia_semana)));
        return [...set].sort((a, b) => a - b);
    }, [horarioOrdenado]);

    const horarioFiltrado = useMemo(() => {
        if (!filtroDia) return horarioOrdenado;
        return horarioOrdenado.filter(h => Number(h.dia_semana) === filtroDia);
    }, [horarioOrdenado, filtroDia]);

    const grupos = useMemo(() => {
        const map = new Map();
        horarioFiltrado.forEach(h => {
            const dia = Number(h.dia_semana);
            if (!map.has(dia)) map.set(dia, []);
            map.get(dia).push(h);
        });
        return [...map.entries()].sort((a, b) => a[0] - b[0]);
    }, [horarioFiltrado]);

    const totalClases = horarioOrdenado.length;
    const totalDias = diasActivos.length;
    const asignaturasUnicas = useMemo(
        () => new Set(horarioOrdenado.map(h => h.asignatura)).size,
        [horarioOrdenado]
    );

    return (
        <div className="min-h-screen bg-linear-to-b from-neutral-50 to-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans">
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">

                {/* Encabezado */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-neutral-200 pb-5">
                    <div>
                        <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Semana en curso
                        </span>
                        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight">
                            Horario del Docente
                        </h2>
                        <p className="mt-2 text-sm text-neutral-500">
                            Hola {primerNombre ? <>, <span className="font-medium text-neutral-700">{primerNombre}</span></> : null} revisa tus clases programadas para la semana
                        </p>
                    </div>

                    {!loading && totalClases > 0 && (
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 sm:px-4 sm:py-3 text-center shadow-sm">
                                <p className="text-lg sm:text-xl font-semibold text-neutral-800">{totalClases}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wide">Clases</p>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 sm:px-4 sm:py-3 text-center shadow-sm">
                                <p className="text-lg sm:text-xl font-semibold text-neutral-800">{totalDias}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wide">Días</p>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 sm:px-4 sm:py-3 text-center shadow-sm">
                                <p className="text-lg sm:text-xl font-semibold text-neutral-800">{asignaturasUnicas}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wide">Materias</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filtros por día */}
                {!loading && diasActivos.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
                        <button
                            onClick={() => setFiltroDia(0)}
                            className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border ${filtroDia === 0
                                ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-800"
                                }`}
                        >
                            Todos
                        </button>
                        {diasActivos.map(d => {
                            const active = filtroDia === d;
                            return (
                                <button
                                    key={d}
                                    onClick={() => setFiltroDia(d)}
                                    className={`shrink-0 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border ${active
                                        ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                                        : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-800"
                                        }`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${DIA_STYLES[d]?.dot ?? "bg-neutral-400"}`} />
                                    <span className="sm:hidden">{DIAS_CORTOS[d]}</span>
                                    <span className="hidden sm:inline">{DIAS[d]}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Contenido */}
                {loading ? (
                    <div className="flex items-center justify-center gap-3 py-20 text-sm text-neutral-500 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                        <LoadingSpinner size="md" />
                        <span>Cargando horario…</span>
                    </div>
                ) : horarioOrdenado.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-6 py-16 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-neutral-700">Sin clases asignadas</p>
                        <p className="mt-1 text-xs text-neutral-500">No hay horarios programados por el momento.</p>
                    </div>
                ) : (
                    <div className="space-y-5 sm:space-y-6">
                        {grupos.map(([dia, clases]) => {
                            const style = DIA_STYLES[dia] ?? DIA_STYLES[7];
                            return (
                                <section key={dia} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                                    {/* Encabezado del día */}
                                    <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100 bg-neutral-50/60">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                                            <h3 className="text-sm sm:text-base font-semibold text-neutral-800 tracking-tight">
                                                {DIAS[dia] ?? dia}
                                            </h3>
                                        </div>
                                        <span className="text-[11px] sm:text-xs font-medium text-neutral-500">
                                            {clases.length} {clases.length === 1 ? "clase" : "clases"}
                                        </span>
                                    </div>

                                    {/* Vista móvil: tarjetas */}
                                    <ul className="md:hidden divide-y divide-neutral-100">
                                        {clases.map(h => (
                                            <li key={h.id} className="px-4 py-4 hover:bg-neutral-50/60 transition-colors">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-neutral-800 truncate">
                                                            {h.asignatura}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-neutral-500">
                                                            Grupo <span className="font-medium text-neutral-700">{h.codigo_grupo}</span>
                                                            <span className="mx-1.5 text-neutral-300">·</span>
                                                            {h.jornada}
                                                        </p>
                                                    </div>
                                                    <span className={`shrink-0 inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${style.soft}`}>
                                                        {formatHora(h.hora_inicio)} – {formatHora(h.hora_fin)}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Vista escritorio: tabla */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-white border-b border-neutral-100 text-neutral-500 font-medium text-xs uppercase tracking-wide">
                                                <tr>
                                                    <th className="px-6 py-3">Horario</th>
                                                    <th className="px-6 py-3">Asignatura</th>
                                                    <th className="px-6 py-3">Grupo</th>
                                                    <th className="px-6 py-3">Jornada</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100 text-neutral-800">
                                                {clases.map(h => (
                                                    <tr key={h.id} className="hover:bg-neutral-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.soft}`}>
                                                                {formatHora(h.hora_inicio)} – {formatHora(h.hora_fin)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-neutral-800">{h.asignatura}</td>
                                                        <td className="px-6 py-4 text-neutral-600">{h.codigo_grupo}</td>
                                                        <td className="px-6 py-4 text-neutral-600">{h.jornada}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            );
                        })}

                        {filtroDia !== 0 && horarioFiltrado.length === 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 px-6 py-12 text-center text-sm text-neutral-500">
                                No tienes clases asignadas para {DIAS[filtroDia]}.
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
