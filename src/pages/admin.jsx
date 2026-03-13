import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";

export function AdminPanel(){

    const navigate = useNavigate();

    useEffect(() => {
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

        if (decodedToken.rol !== 1) {
            console.error("Unauthorized access");
            localStorage.removeItem('token');
            navigate("/login");
            return;
        }
    })

    return(
        <div>
            <h1>Panel de Administrador</h1>
            <div>
                <Link to="/admin/horarios">
                    <button>Horarios</button>
                </Link>
                <Link to="/admin/docentes">
                    <button>Docentes</button>
                </Link>
                <Link to="/admin/salones">
                    <button>Salones</button>
                </Link>
            </div>
        </div>
    )
}