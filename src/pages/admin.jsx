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
        <div className="min-h-screen bg-neutral-50 px-6 py-12 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="border-b border-neutral-200 pb-5">
                    <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight">Panel de Administrador</h1>
                    <p className="mt-2 text-sm text-neutral-500">Gestiona los recursos e información del sistema</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/admin/horarios" className="group block h-full">
                        <div className="h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer">
                            <h3 className="text-lg font-medium text-neutral-800 group-hover:text-black transition-colors">Horarios</h3>
                            <p className="mt-2 text-sm text-neutral-500">Configurar y revisar horarios</p>
                        </div>
                    </Link>
                    
                    <Link to="/admin/docentes" className="group block h-full">
                        <div className="h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer">
                            <h3 className="text-lg font-medium text-neutral-800 group-hover:text-black transition-colors">Docentes</h3>
                            <p className="mt-2 text-sm text-neutral-500">Administrar personal docente</p>
                        </div>
                    </Link>
                    
                    <Link to="/admin/salones" className="group block h-full">
                        <div className="h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer">
                            <h3 className="text-lg font-medium text-neutral-800 group-hover:text-black transition-colors">Salones</h3>
                            <p className="mt-2 text-sm text-neutral-500">Aulas y recursos físicos</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}