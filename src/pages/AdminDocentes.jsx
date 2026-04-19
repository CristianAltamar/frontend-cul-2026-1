import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";
import { getDocentes } from "../services/userService.js";

const ROLES = { 1: "Administrador", 2: "Docente" };

export function AdminDocentes() {
    const navigate = useNavigate();
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (!decoded || decoded.rol !== 1) { navigate("/login"); return; }

        const cargar = async () => {
            try {
                const data = await getDocentes();
                setDocentes(data);
            } catch {
                setError("No se pudieron cargar los docentes.");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 px-6 py-12 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                <div className="flex items-center gap-4 border-b border-neutral-200 pb-5">
                    <button
                        onClick={() => navigate("/admin")}
                        className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                        ← Volver
                    </button>
                    <div>
                        <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight">Docentes</h1>
                        <p className="mt-1 text-sm text-neutral-500">Usuarios registrados en el sistema</p>
                    </div>
                </div>

                {loading && (
                    <p className="text-sm text-neutral-500">Cargando...</p>
                )}

                {error && (
                    <div className="px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-600 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Nombre</th>
                                        <th className="px-6 py-4">Documento</th>
                                        <th className="px-6 py-4">Teléfono</th>
                                        <th className="px-6 py-4">Correo</th>
                                        <th className="px-6 py-4">Rol</th>
                                        <th className="px-6 py-4">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                                    {docentes.map((d) => (
                                        <tr key={d.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium whitespace-nowrap">
                                                {[d.primer_nombre, d.segundo_nombre, d.primer_apellido, d.segundo_apellido]
                                                    .filter(Boolean).join(" ")}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 whitespace-nowrap">
                                                {d.tipo_documento} {d.n_documento}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600">{d.telefono}</td>
                                            <td className="px-6 py-4 text-neutral-600">{d.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    d.id_rol === 1
                                                        ? "bg-neutral-800 text-white"
                                                        : "bg-neutral-100 text-neutral-700"
                                                }`}>
                                                    {ROLES[d.id_rol] ?? d.rol}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    d.estado
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-red-50 text-red-600"
                                                }`}>
                                                    {d.estado ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {docentes.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-neutral-500 italic">
                                                No hay docentes registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
