import api from "../api/axios";

export const getPeriodos = async () => {
    const response = await api.get("/get_periodos");
    return response.data.resultado;
};