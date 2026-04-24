
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDisponibilidadDocente, saveDisponibilidad } from "../services/disponibilidadService.js";
import { decodeToken } from "../utils/decodeToken.js";
import { createSchedule, procesoDisponibilidad } from "../utils/schedule.js";
import { useDisponibilidad } from "../hooks/useDisponibilidad.js";
import { getPeriodos } from "../services/periodoService.js";
import { use } from "react";
import { LoadingOverlay, LoadingSpinner } from "../components/LoadingSpinner.jsx";

const startTime = "08:00";
const endTime = "22:00:00";
const durationMinutes = 45;

export const Disponibilidad = () => {
    const [semestre, setSemestre] = useState();
    const [disponibilidad, setDisponibilidad] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { buildDisponibilidadPayload } = useDisponibilidad();
    const [periodos, setPeriodos] = useState([]);

    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const { scheduleStart, scheduleEnd } = createSchedule(startTime, endTime, durationMinutes);

    const loadPeriodos = async () => {
        try {
            const data = await getPeriodos();
            setSemestre(data.length > 0 ? data[0].id : null);
            setPeriodos(data);
        } catch (err) {
            console.error("Error cargando periodos:", err);
        }
    };

    const loadDisponibilidad = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate("/login"); return; }
        const decodedToken = decodeToken(token);
        if (!decodedToken) { localStorage.removeItem('token'); navigate("/login"); return; }
        setLoading(true);
        try {
            const data = await getDisponibilidadDocente(decodedToken.user_id, semestre);
            const schedule = procesoDisponibilidad(data);
            setDisponibilidad(schedule || {});
        } catch (err) {
            console.error("Error cargando disponibilidad:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPeriodos(); }, []);
    useEffect(() => { loadDisponibilidad(); }, [semestre]);

    const handleCheckboxChange = (dia, horainicio, horafin) => {
        const key = `${dia}-${horainicio}-${horafin}`;
        setDisponibilidad(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        if (!token) { alert("Debe iniciar sesión para guardar disponibilidad."); navigate('/login'); return; }
        const decodedToken = decodeToken(token);
        if (!decodedToken) { alert("Token inválido. Inicie sesión de nuevo."); localStorage.removeItem('token'); navigate('/login'); return; }
        const payload = buildDisponibilidadPayload(disponibilidad, semestre, decodedToken);
        if (payload.length === 0) { alert("Selecciona al menos un horario antes de guardar."); return; }
        setSaving(true);
        try {
            await saveDisponibilidad(payload);
            alert("Disponibilidad guardada correctamente");
        } catch (err) {
            console.error("Error guardando disponibilidad:", err);
            alert("Error guardando disponibilidad");
        } finally {
            setSaving(false);
        }
    };

    const totalSeleccionados = Object.values(disponibilidad).filter(Boolean).length;

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            {loading && <LoadingOverlay message="Cargando disponibilidad…" />}
            {saving && <LoadingOverlay message="Guardando disponibilidad…" />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-5">

                {/* ── Header ── */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight">Disponibilidad</h1>
                    <p className="mt-1 text-sm text-neutral-500">Marca los bloques horarios en que estás disponible para dictar clases</p>
                </div>

                {/* ── Selector de periodo ── */}
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Periodo académico</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        {periodos.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSemestre(p.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                                    semestre == p.id
                                        ? "bg-neutral-900 text-white shadow-sm"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                            >
                                {p.nombre}
                            </button>
                        ))}
                        {totalSeleccionados > 0 && (
                            <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                                {totalSeleccionados} bloque{totalSeleccionados !== 1 ? "s" : ""} seleccionado{totalSeleccionados !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Grilla ── */}
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">

                    {/* Encabezado de la grilla */}
                    <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-800">Grilla semanal</h2>
                            <p className="text-xs text-neutral-400 mt-0.5">Haz clic en un bloque para marcarlo como disponible</p>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 border border-emerald-500 inline-block" />
                                Disponible
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-100 border border-dashed border-neutral-300 inline-block" />
                                No disponible
                            </div>
                        </div>
                    </div>

                    {/* Tabla con scroll horizontal */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse" style={{ minWidth: "700px" }}>
                            <thead>
                                <tr className="border-b border-neutral-100">
                                    <th className="px-4 py-3 text-xs font-medium text-neutral-500 text-left border-r border-neutral-100 w-24 sticky left-0 bg-white z-10">
                                        Hora
                                    </th>
                                    {dias.map(d => {
                                        const selCount = scheduleStart.filter((h, i) =>
                                            disponibilidad[`${d}-${h}-${scheduleEnd[i]}`]
                                        ).length;
                                        return (
                                            <th key={d} className="px-2 py-2.5 text-center border-r border-neutral-100 last:border-r-0 bg-white min-w-18">
                                                <span className="text-xs font-semibold text-neutral-500 tracking-wide">
                                                    {d.slice(0, 3)}
                                                </span>
                                                {/* Mini barra de disponibilidad por día */}
                                                <div className="flex gap-px mt-1.5 justify-center">
                                                    {scheduleStart.map((h, i) => {
                                                        const key = `${d}-${h}-${scheduleEnd[i]}`;
                                                        return (
                                                            <span
                                                                key={i}
                                                                className={`h-1.5 rounded-full flex-1 max-w-1.5 transition-colors duration-150 ${
                                                                    disponibilidad[key] ? "bg-emerald-400" : "bg-neutral-200"
                                                                }`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                {selCount > 0 && (
                                                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block leading-none">
                                                        {selCount}
                                                    </span>
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {scheduleStart.map((hora, index) => (
                                    <tr key={hora} className="border-b border-neutral-50 last:border-b-0">
                                        <td className="px-4 py-1.5 text-[11px] text-neutral-400 font-mono border-r border-neutral-100 sticky left-0 bg-white z-10 whitespace-nowrap align-middle">
                                            {hora}
                                            <span className="block text-neutral-300">{scheduleEnd[index]}</span>
                                        </td>
                                        {dias.map(dia => {
                                            const key = `${dia}-${hora}-${scheduleEnd[index]}`;
                                            const selected = disponibilidad[key] || false;
                                            return (
                                                <td
                                                    key={dia}
                                                    onClick={() => handleCheckboxChange(dia, hora, scheduleEnd[index])}
                                                    className="px-1 py-1 border-r border-neutral-50 last:border-r-0 cursor-pointer align-top"
                                                >
                                                    {selected ? (
                                                        <div className="min-h-9.5 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm hover:from-emerald-600 hover:to-emerald-700 transition-all duration-150 hover:shadow-md group">
                                                            <svg className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className="min-h-9.5 rounded-xl border border-dashed border-neutral-200 flex items-center justify-center hover:border-emerald-300 hover:bg-emerald-50/60 transition-all duration-150 group">
                                                            <span className="text-neutral-300 group-hover:text-emerald-400 text-sm font-light transition-colors duration-150">+</span>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Guardar ── */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-neutral-800 active:bg-neutral-900 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving && <LoadingSpinner size="sm" light />}
                        {saving ? "Guardando…" : "Guardar disponibilidad"}
                    </button>
                </div>

            </div>
        </div>
    );
};
