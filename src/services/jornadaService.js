import api from "../api/axios";

export const getJornadas = async () => {
    const response = await api.get("/get_jornadas/");
    return response.data.resultado;
};

export const createJornada = async (jornada) => {
    const response = await api.post("/create_jornada", jornada);
    return response.data;
};

export const updateJornada = async (jornada_id, jornada) => {
    const response = await api.put(`/update_jornada/${jornada_id}`, jornada);
    return response.data;
};

export const deleteJornada = async (jornada_id) => {
    const response = await api.delete(`/delete_jornada/${jornada_id}`);
    return response.data;
};