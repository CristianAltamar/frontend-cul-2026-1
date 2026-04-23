import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";

export function Docente() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate("/login"); return; }
        const decodedToken = decodeToken(token);
        if (!decodedToken) { localStorage.removeItem('token'); navigate("/login"); return; }
        if (decodedToken.rol !== 2) { localStorage.removeItem('token'); navigate("/login"); return; }
    });

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const token = localStorage.getItem("token");
    const decoded = token ? decodeToken(token) : null;
    const displayName = decoded?.nombre
        || [decoded?.primer_nombre, decoded?.primer_apellido].filter(Boolean).join(" ").trim()
        || decoded?.email?.split("@")[0]
        || "";

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">

            {/* Header propio — sin navbar global */}
            <header className="bg-white border-b border-neutral-100">
                <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
                    <span className="text-base font-semibold text-neutral-800 tracking-tight">
                        CUL <span className="text-neutral-400 font-normal">2026</span>
                    </span>
                    <div className="flex items-center gap-3">
                        {displayName && (
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-semibold text-neutral-600 leading-none">
                                        {displayName[0].toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm text-neutral-700 font-medium hidden sm:block">{displayName}</span>
                            </div>
                        )}
                        <span className="text-neutral-200 hidden sm:block">|</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors font-medium"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

                <div className="border-b border-neutral-200 pb-5">
                    <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight">Panel de Docente</h1>
                    <p className="mt-2 text-sm text-neutral-500">Accede a tus clases, horarios y recursos asignados</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <Link to="/horario" className="group block h-full">
                        <div className="h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer">
                            <h3 className="text-lg font-medium text-neutral-800 group-hover:text-black transition-colors">Horarios</h3>
                            <p className="mt-2 text-sm text-neutral-500">Visualiza tus clases programadas</p>
                        </div>
                    </Link>

                    <Link to="/disponibilidad" className="group block h-full">
                        <div className="h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer">
                            <h3 className="text-lg font-medium text-neutral-800 group-hover:text-black transition-colors">Disponibilidad</h3>
                            <p className="mt-2 text-sm text-neutral-500">Gestiona tus cupos y horas libres</p>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
}
