import { formatTimeForApi, mergeContiguousSlots } from "../utils/schedule.js";
import { saveDisponibilidad as saveDisponibilidadApi } from "../services/disponibilidadService.js";

const diasSemanaMap = {
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6,
    Domingo: 7,
};

const buildSlotsFromRaw = (rawDisponibilidad) => {
    return Object.entries(rawDisponibilidad)
        .filter(([, checked]) => checked)
        .map(([key]) => {
            const [dia_semana, hora_inicio, hora_fin] = key.split("-");
            return { dia_semana, hora_inicio, hora_fin };
        });
};

export const useDisponibilidad = () => {
    const buildDisponibilidadPayload = (rawDisponibilidad, periodo, decodedToken) => {
        const selectedSlots = buildSlotsFromRaw(rawDisponibilidad);

        if (!decodedToken || !decodedToken.user_id || selectedSlots.length === 0) {
            return [];
        }

        const sortedSlots = selectedSlots.sort((a, b) => {
            const dayA = diasSemanaMap[a.dia_semana] || 0;
            const dayB = diasSemanaMap[b.dia_semana] || 0;
            if (dayA !== dayB) return dayA - dayB;
            return a.hora_inicio.localeCompare(b.hora_inicio);
        });

        const mergedSlots = mergeContiguousSlots(sortedSlots);

        return mergedSlots.map((slot) => ({
            id: 0,
            id_docente: decodedToken.user_id,
            nombre: "",
            id_periodo: periodo || 0,
            periodo: "",
            dia_semana: diasSemanaMap[slot.dia_semana] || 0,
            hora_inicio: formatTimeForApi(slot.hora_inicio),
            hora_fin: formatTimeForApi(slot.hora_fin),
            observacion: "",
        }));
    };

    const saveDisponibilidad = async (rawDisponibilidad, periodo, decodedToken) => {
        const payload = buildDisponibilidadPayload(rawDisponibilidad, periodo, decodedToken);
        return saveDisponibilidadApi(payload);
    };

    return { buildDisponibilidadPayload, saveDisponibilidad };
};
