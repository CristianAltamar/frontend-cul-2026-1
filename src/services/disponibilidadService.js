import api from "../api/axios";

export const getDisponibilidadDocente = async (id, id_periodo) => {
    const response = await api.get(`/get_disponibilidad_docente/${id}?periodo_id=${id_periodo}`);
    return response.data;
};

export const saveDisponibilidad = async (disponibilidad) => {
    const response = await api.post("/create_multiple_disponibilidad_docente", disponibilidad);
    return response.data;
};