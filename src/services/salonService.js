import api from "../api/axios";

export const getSalones = async () => {
    const res = await api.get("/get_salones")
    return res.data
}

export const createSalon = async (data) => {
    const res = await api.post("/create_salon", data)
    return res.data
}
