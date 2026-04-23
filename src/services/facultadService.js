import api from "../api/axios";

export const getFacultades = async () => {
    const response = await api.get("/get_facultades");
    return response.data;
};