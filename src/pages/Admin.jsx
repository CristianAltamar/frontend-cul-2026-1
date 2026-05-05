import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";
import { PowerBIReporte } from "../components/PowerBIReporte.jsx";

export function AdminPanel() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (!decoded) { localStorage.removeItem("token"); navigate("/login"); return; }
        if (decoded.rol !== 1) { navigate("/login"); return; }
    }, []);

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

            {/* Header del panel — sin navbar global */}
            <header className="bg-white border-b border-neutral-100">
                <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
                    <span className="text-base font-semibold text-neutral-800 tracking-tight">
                        CUL <span className="text-neutral-400 font-normal">2026</span>
                    </span>
                    <div className="flex items-center gap-3">
                        {displayName && (
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-semibold text-white leading-none">
                                        {displayName[0].toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm text-neutral-700 font-medium hidden sm:block">{displayName}</span>
                            </div>
                        )}
                        {displayName && <span className="text-neutral-200 hidden sm:block">|</span>}
                        <button
                            onClick={handleLogout}
                            className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors font-medium cursor-pointer"
                        >
                        Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

                <div className="border-b border-neutral-200 pb-5">
                    <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight">Panel de Administrador</h1>
                    <p className="mt-2 text-sm text-neutral-500">Gestiona los recursos e información del sistema</p>
                </div>

                <div className="w-full h-7/12">
                    <h2 className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors font-medium pb-4">Dashboard Gestión de Horarios</h2>
                    <PowerBIReporte/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    <Link to="/admin/crear-usuario" className="group block h-full">
                        <div className="h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer">
                            <h3 className="text-lg font-medium text-neutral-800 group-hover:text-black transition-colors">Crear usuario</h3>
                            <p className="mt-2 text-sm text-neutral-500">Registrar docente o administrador</p>
                        </div>
                    </Link>

                    <Link to="/admin/docentes" className="group block h-full">
                        <div className="h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer">
                            <h3 className="text-lg font-medium text-neutral-800 group-hover:text-black transition-colors">Usuarios</h3>
                            <p className="mt-2 text-sm text-neutral-500">Ver todos los usuarios registrados</p>
                        </div>
                    </Link>

                    <Link to="/admin/horario" className="group block h-full">
                        <div className="h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer">
                            <h3 className="text-lg font-medium text-neutral-800 group-hover:text-black transition-colors">Horario</h3>
                            <p className="mt-2 text-sm text-neutral-500">Gestionar el horario académico</p>
                        </div>
                    </Link>

                    <Link to="/admin/reportes" className="group block h-full">
                        <div className="h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer">
                            <h3 className="text-lg font-medium text-neutral-800 group-hover:text-black transition-colors">Reportes</h3>
                            <p className="mt-2 text-sm text-neutral-500">Clases asignadas por docente, programa y fechas</p>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
}
