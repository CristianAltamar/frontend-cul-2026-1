import api from "../api/axios";

export const getHorarioDocente = async (id) => {
    const response = await api.get(`/get_horario_docente/${id}`);
    return response.data;
};