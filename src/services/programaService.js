import api from "../api/axios";

export const getProgramas = async () => {
    const response = await api.get("/get_programas/");
    return response.data.resultado;
};

export const createPrograma = async (programa) => {
    const response = await api.post("/create_programa", programa);
    return response.data;
};

export const updatePrograma = async (programa_id, programa) => {
    const response = await api.put(`/update_programa/${programa_id}`, programa);
    return response.data;
};

export const deletePrograma = async (programa_id) => {
    const response = await api.delete(`/delete_programa/${programa_id}`);
    return response.data;
};