import api from "../api/axios";

export const getPeriodos = async () => {
    const response = await api.get("/get_periodos/");
    return response.data.resultado;
};

export const createPeriodo = async (periodo) => {
    const response = await api.post("/create_periodo", periodo);
    return response.data;
};

export const updatePeriodo = async (periodo_id, periodo) => {
    const response = await api.put(`/update_periodo/${periodo_id}`, periodo);
    return response.data;
};

export const deletePeriodo = async (periodo_id) => {
    const response = await api.delete(`/delete_periodo/${periodo_id}`);
    return response.data;
};