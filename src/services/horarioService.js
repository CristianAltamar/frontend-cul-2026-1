import api from "../api/axios";

export const getHorarioDocente = async (id) => {
    const response = await api.get(`/get_horario_docente/${id}`);
    return response.data;
};

export const crearHorarioDocente = async (id_grupo, id_docente, id_salon, id_jornada, dia_semana, hora_inicio, hora_fin) => {
    const response = await api.post("/crear_horario", {
        id_grupo,
        id_docente,
        id_salon,
        id_jornada,
        dia_semana,
        hora_inicio,
        hora_fin,
    });
    return response.data;
}