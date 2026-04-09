import api from "../api/axios";

export const getDisponibilidadDocente = async (id) => {
    const response = await api.get(`/get_disponibilidad_docente/${id}`);
    return response.data;
};
