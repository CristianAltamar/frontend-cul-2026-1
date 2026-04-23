import { useEffect, useState } from "react";
import { getHorarioDocente } from "../services/horarioService.js";
import { decodeToken } from "../utils/decodeToken.js";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";

const DIAS = { 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo" };

export function Horario() {
    const [horario, setHorario] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarHorario = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate("/login"); return; }
            const d = decodeToken(token);
            if (!d) { localStorage.removeItem('token'); navigate("/login"); return; }
            try {
                const data = await getHorarioDocente(d.user_id);
                setHorario(data.resultado ?? []);
            } catch (err) {
                console.error("Error cargando horario:", err);
                setHorario([]);
            } finally {
                setLoading(false);
            }
        };
        cargarHorario();
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 px-6 py-12 font-sans">
            <div className="max-w-5xl mx-auto space-y-10">

                <div className="border-b border-neutral-200 pb-5">
                    <h2 className="text-3xl font-semibold text-neutral-800 tracking-tight">Horario del Docente</h2>
                    <p className="mt-2 text-sm text-neutral-500">Revisa tus clases programadas para la semana</p>
                </div>

                {loading ? (
                    <div className="flex items-center gap-3 py-10 text-sm text-neutral-500">
                        <LoadingSpinner size="md" />
                        <span>Cargando horario…</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-600 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Día</th>
                                        <th className="px-6 py-4">Hora inicio</th>
                                        <th className="px-6 py-4">Hora fin</th>
                                        <th className="px-6 py-4">Grupo</th>
                                        <th className="px-6 py-4">Asignatura</th>
                                        <th className="px-6 py-4">Jornada</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                                    {horario.map(h => (
                                        <tr key={h.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold">{DIAS[h.dia_semana] ?? h.dia_semana}</td>
                                            <td className="px-6 py-4 text-neutral-600">{h.hora_inicio}</td>
                                            <td className="px-6 py-4 text-neutral-600">{h.hora_fin}</td>
                                            <td className="px-6 py-4 text-neutral-600">{h.codigo_grupo}</td>
                                            <td className="px-6 py-4 text-neutral-600">{h.codigo_salon}</td>
                                            <td className="px-6 py-4 text-neutral-600">{h.jornada}</td>
                                        </tr>
                                    ))}
                                    {horario.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-neutral-500 italic">
                                                No hay horarios asignados por el momento.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
