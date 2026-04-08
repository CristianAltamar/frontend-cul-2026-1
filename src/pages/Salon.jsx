import { useEffect, useState } from "react"
import { getSalones, createSalon } from "../services/salonService.js"
import { decodeToken } from "../utils/decodeToken.js"
import { useNavigate } from "react-router-dom"

export function SalonAdmin(){
    const [salones,setSalones] = useState([])
    const [isAdmin,setIsAdmin] = useState(false)
    const navigate = useNavigate()
    const [form,setForm] = useState({
        codigo:"",
        capacidad:0,
        tipo:"",
        ubicacion:""
    })
    
    const cargarSalones = async () => {
        const data = await getSalones()
        setSalones(data.resultado)
    }

    useEffect(()=>{
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found");
            navigate("/login");
            return;
        }

        const decodedToken = decodeToken(token);
        if (!decodedToken) {
            console.error("Invalid token");
            localStorage.removeItem('token');
            navigate("/login");
            return;
        }

        if (decodedToken.rol === 1) {
            setIsAdmin(true);
        }
        cargarSalones()
    },[])

    const handleChange = (e)=>{
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }


    const handleSubmit = async (e)=>{
        e.preventDefault()
        await createSalon(form)
        setForm({
            codigo:"",
            capacidad:0,
            tipo:"",
            ubicacion:""
        })
        cargarSalones()
    }

    return(
        <div className="min-h-screen bg-neutral-50 px-6 py-12 font-sans">
            <div className="max-w-6xl mx-auto space-y-10">
                <div className="border-b border-neutral-200 pb-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight">Gestión de Salones</h1>
                        <p className="mt-2 text-sm text-neutral-500">Administra y visualiza el listado de aulas disponibles</p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 mb-8">
                        <h2 className="text-lg font-medium text-neutral-800 mb-5">Crear Nuevo Salón</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-700">Código</label>
                                <input
                                    name="codigo"
                                    placeholder="..."
                                    value={form.codigo}
                                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-sm"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-700">Capacidad</label>
                                <input
                                    name="capacidad"
                                    type="number"
                                    placeholder="0"
                                    value={form.capacidad}
                                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-sm"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-700">Tipo</label>
                                <input
                                    name="tipo"
                                    placeholder="..."
                                    value={form.tipo}
                                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-sm"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-700">Ubicación</label>
                                <input
                                    name="ubicacion"
                                    placeholder="..."
                                    value={form.ubicacion}
                                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-sm"
                                    onChange={handleChange}
                                />
                            </div>

                            <button className="w-full py-2.5 px-4 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 text-sm">
                                Crear
                            </button>
                        </form>
                    </div>
                )}
                
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-600 font-medium">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Código</th>
                                    <th className="px-6 py-4 text-center">Capacidad</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Ubicación</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-neutral-800">
                            {salones.map(salon=>(
                                <tr key={salon.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-neutral-500">{salon.id}</td>
                                    <td className="px-6 py-4 font-semibold">{salon.codigo}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                                            {salon.capacidad}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{salon.tipo}</td>
                                    <td className="px-6 py-4 text-neutral-500">{salon.ubicacion}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-red-500 hover:text-red-700 hover:underline px-2 font-medium text-xs transition-colors">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {salones.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-neutral-500 italic">No hay salones registrados.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}