import api from "../api/axios";

export const getFacultades = async () => {
    const response = await api.get("/get_facultades/");
    return response.data.resultado;
};

export const createFacultad = async (facultad) => {
    const response = await api.post("/create_facultad", facultad);
    return response.data;
};

export const updateFacultad = async (facultad_id, facultad) => {
    const response = await api.put(`/update_facultad/${facultad_id}`, facultad);
    return response.data;
};

export const deleteFacultad = async (facultad_id) => {
    const response = await api.delete(`/delete_facultad/${facultad_id}`);
    return response.data;
};