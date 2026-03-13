import { useEffect, useState } from "react";
import { getHorarioDocente } from "../services/horarioService.js";

export function Horario(){
    const [horario,setHorario] = useState([]);

    useEffect(()=>{
        const cargarHorario = async ()=>{
            const data = await getHorarioDocente(1);
            setHorario(data);
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