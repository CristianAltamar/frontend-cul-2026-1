import api from "../api/axios";

export const getHorarioDocente = async (id_docente, id_periodo) => {
    const response = await api.get(`/get_horario_docente/${id_docente}?id_periodo=${id_periodo}`);
    return response.data.resultado;
};

export const getHorarioPrograma = async (id_programa, id_periodo) => {
    const response = await api.get(`/get_horario_programa/${id_programa}?id_periodo=${id_periodo}`);
    return response.data.resultado;
};

export const getHorarios = async () => {
    const response = await api.get("/get_horarios/");
    return response.data.resultado;
};

export const crearHorario = async (horario) => {
    const response = await api.post("/create_horario", horario);
    return response.data;
};

export const updateHorario = async (horario_id, horario) => {
    const response = await api.put(`/update_horario/${horario_id}`, horario);
    return response.data;
};

export const deleteHorario = async (horario_id) => {
    const response = await api.delete(`/delete_horario/${horario_id}`);
    return response.data;
};