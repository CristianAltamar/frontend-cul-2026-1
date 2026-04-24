import api from "../api/axios";

export const getAsignaturas = async (programa_id) => {
    const url = programa_id ? `/get_asignaturas/?programa_id=${programa_id}` : "/get_asignaturas/";
    const response = await api.get(url);
    return response.data.resultado;
};

export const createAsignatura = async (asignatura) => {
    const response = await api.post("/create_asignatura", asignatura);
    return response.data;
};

export const updateAsignatura = async (asignatura_id, asignatura) => {
    const response = await api.put(`/update_asignatura/${asignatura_id}`, asignatura);
    return response.data;
};

export const deleteAsignatura = async (asignatura_id) => {
    const response = await api.delete(`/delete_asignatura/${asignatura_id}`);
    return response.data;
};