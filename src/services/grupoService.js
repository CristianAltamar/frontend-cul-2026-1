import api from "../api/axios";

export const getGrupos = async () => {
    const response = await api.get("/get_grupos/");
    return response.data.resultado;
};

export const createGrupo = async (grupo) => {
    const response = await api.post("/create_grupo", grupo);
    return response.data;
};

export const updateGrupo = async (grupo_id, grupo) => {
    const response = await api.put(`/update_grupo/${grupo_id}`, grupo);
    return response.data;
};

export const deleteGrupo = async (grupo_id) => {
    const response = await api.delete(`/delete_grupo/${grupo_id}`);
    return response.data;
};