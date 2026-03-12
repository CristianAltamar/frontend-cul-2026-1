import api from "../api/axios.js";

export const createUser = async (data) => {
    const response = await api.post("/create_usuario", data);
    return response.data;
};