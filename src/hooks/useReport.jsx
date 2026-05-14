import { useState } from "react";
import { getHorarioDocente } from "../services/horarioService";

const DIA_ORDEN = { 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado" };

// Verifica si dos rangos de fecha se solapan (string "YYYY-MM-DD")
function rangesOverlap(s1, e1, s2, e2) {
    return s1 <= e2 && e1 >= s2;
}

export const useReport = ({ filtro, periodos, docentes, programas }) => {
    const [resultados, setResultados] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const filtersReady =
            filtro.id &&
            filtro.programa_id &&
            filtro.fecha_inicio &&
            filtro.fecha_fin &&
            filtro.fecha_inicio <= filtro.fecha_fin;

        // ── Generar reporte ───────────────────────────────────────────────────────
        const handleBuscar = async () => {
            if (!filtersReady) return;
            setLoading(true);
            setError("");

            try {
                // Periodos que se solapan con el rango de fechas seleccionado
                const periodosFiltrados = periodos.filter(p =>
                    rangesOverlap(filtro.fecha_inicio, filtro.fecha_fin, p.fecha_inicio, p.fecha_fin)
                );
                const periodoIds = periodosFiltrados.map(p => p.id);

                const horariosDocente = await getHorarioDocente(filtro.id, periodoIds[0], filtro.programa_id);

                setResultados({
                    docente:  docentes.find(d => d.id === parseInt(filtro.id)),
                    programa: programas.find(p => p.id === parseInt(filtro.programa_id)),
                    periodos: periodosFiltrados,
                    clases:   horariosDocente.map(h => ({ ...h, dia_semana: DIA_ORDEN[h.dia_semana] ?? "Desconocido" })),
                });
            } catch {
                setError("Error al generar el reporte. Intenta nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        // ── Limpiar resultados ─────────────────────────────────────────────
        const Limpiar = () => {
        setResultados(null);
        setError("");
    };
    return { filtersReady, resultados, loading, error, handleBuscar, Limpiar };
}