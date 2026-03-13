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
        <div>
            <h1>Salones</h1>
            {isAdmin && (
                <form onSubmit={handleSubmit}>
                    <input
                        name="codigo"
                        placeholder="codigo salón"
                        value={form.codigo}
                        onChange={handleChange}
                    />

                    <input
                        name="capacidad"
                        type="number"
                        placeholder="Capacidad"
                        value={form.capacidad}
                        onChange={handleChange}
                    />

                    <input
                        name="tipo"
                        placeholder="Tipo"
                        value={form.tipo}
                        onChange={handleChange}
                    />

                    <input
                        name="ubicacion"
                        placeholder="Ubicación"
                        value={form.ubicacion}
                        onChange={handleChange}
                    />

                    <button>Crear</button>
                </form>
            )}
            <hr/>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Capacidad</th>
                        <th>Tipo</th>
                        <th>Ubicación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                {salones.map(salon=>(
                    <tr key={salon.id}>
                        <td>{salon.id}</td>
                        <td>{salon.codigo}</td>
                        <td>{salon.capacidad}</td>
                        <td>{salon.tipo}</td>
                        <td>{salon.ubicacion}</td>
                        <td>
                            <button>
                                Eliminar
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}