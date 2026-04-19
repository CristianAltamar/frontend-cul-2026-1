import api from "../api/axios.js";

export const createUser = async (data) => {
    const response = await api.post("/create_docente", data);
    return response.data;
};

export const getDocentes = async () => {
    const response = await api.get("/get_docentes/");
    return response.data.resultado;
};