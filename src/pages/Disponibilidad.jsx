
import { useState, useEffect } from "react";
import { getDisponibilidadDocente } from "../services/disponibilidadService.js";
import { decodeToken } from "../utils/decodeToken.js";
import { createSchedule, procesoDisponibilidad } from "../utils/schedule.js";

const startTime = "08:00";
const endTime = "22:00:00";
const durationMinutes = 45;

export const Disponibilidad = () => {
    const [semestre, setSemestre] = useState("2024-1");
    const [disponibilidad, setDisponibilidad] = useState({});

    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const { scheduleStart, scheduleEnd } = createSchedule(startTime, endTime, durationMinutes); // Crea horarios de startTime a endTime en pasos de durationMinutes minutos

    useEffect(() => {
        const loadDisponibilidad = async () => {
            // Verificar que el usuario tenga un token válido y el rol de docente
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found");
                navigate("/login");
                return;
            }
    
            const decodedToken = decodeToken(token);
            if (!decodedToken) {
                console.error("Invalid token");
                localStorage.removeItem('token');
                navigate("/login");
                return;
            }

            // Cargar disponibilidad existente para el semestre
            try {
                const data = await getDisponibilidadDocente(decodedToken.user_id);
                const schedule = procesoDisponibilidad(data);
                setDisponibilidad(schedule || {});
            } catch (err) {
                console.error("Error cargando disponibilidad:", err);
            }
        };
        loadDisponibilidad();
    }, []);

    const handleCheckboxChange = (dia, horainicio, horafin) => {
        const key = `${dia}-${horainicio} a ${horafin}`;
        setDisponibilidad(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        console.log(disponibilidad)
    };

    const handleSave = async () => {
        return; // Deshabilitado temporalmente
        try {
            await saveDisponibilidad(semestre, disponibilidad);
            alert("Disponibilidad guardada correctamente");
        } catch (err) {
            alert("Error guardando disponibilidad");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-6 font-sans">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-neutral-800 tracking-tight">Disponibilidad del Docente</h2>
                    <p className="mt-2 text-sm text-neutral-500">Selecciona tu semestre y marca los horarios disponibles</p>
                </div>

                <div className="flex justify-center">
                    <select
                        value={semestre}
                        onChange={(e) => setSemestre(e.target.value)}
                        className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                    >
                        <option value="2024-1">2024-1</option>
                        <option value="2024-2">2024-2</option>
                        <option value="2025-1">2025-1</option>
                        <option value="2025-2">2025-2</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr>
                                <th className="border border-neutral-200 px-4 py-2 text-left text-sm font-medium text-neutral-700">Hora inicio</th>
                                <th className="border border-neutral-200 px-4 py-2 text-left text-sm font-medium text-neutral-700">Hora fin</th>
                                {dias.map(dia => (
                                    <th key={dia} className="border border-neutral-200 px-4 py-2 text-center text-sm font-medium text-neutral-700">{dia}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {scheduleStart.map((hora, index) => (
                                <tr key={hora}>
                                    <td className="border border-neutral-200 px-4 py-2 text-sm text-neutral-700 font-medium">{hora}</td>
                                    <td className="border border-neutral-200 px-4 py-2 text-sm text-neutral-700 font-medium">{scheduleEnd[index]}</td>
                                    {dias.map(dia => {
                                        const key = `${dia}-${hora} a ${scheduleEnd[index]}`;
                                        return (
                                            <td key={key} className="border border-neutral-200 px-4 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={disponibilidad[key] || false}
                                                    onChange={() => handleCheckboxChange(dia, hora, scheduleEnd[index])}
                                                    className="w-4 h-4 text-neutral-900 bg-neutral-50 border-neutral-200 rounded focus:ring-neutral-900"
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleSave}
                        className="py-2.5 px-6 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 outline-none"
                    >
                        Guardar Disponibilidad
                    </button>
                </div>
            </div>
        </div>
    );
};