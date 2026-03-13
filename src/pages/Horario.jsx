import { useEffect, useState } from "react";
import { getHorarioDocente } from "../services/horarioService.js";
import { decodeToken } from "../utils/decodeToken.js";
import { useNavigate  } from "react-router-dom";

export function Horario(){
    const [horario,setHorario] = useState([]);
    const navigate = useNavigate();

    useEffect(()=>{
        const cargarHorario = async ()=>{
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found");
                navigate("/login");
                return;
            }
            const d = decodeToken(token);
            if (!d) {
                console.error("Invalid token");
                localStorage.removeItem('token');
                navigate("/login");
                return;
            }
            if (d.rol !== 2) {
                console.error("Unauthorized access");
                localStorage.removeItem('token');
                navigate("/login");
                return;
            }
            const data = await getHorarioDocente(d.user_id);
            setHorario(data.resultado);
        }
        cargarHorario();
    },[])

    return(
        <div>
            <h2>Horario del profesor</h2>
            <table>
                <thead>
                <tr>
                    <th>Día</th>
                    <th>Hora inicio</th>
                    <th>Hora fin</th>
                </tr>
                </thead>
                <tbody>
                {horario.map(h => (
                    <tr key={h.id_horario}>
                        <td>{h.dia}</td>
                        <td>{h.hora_inicio}</td>
                        <td>{h.hora_fin}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}