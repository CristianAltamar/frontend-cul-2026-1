import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";
import { createUser } from "../services/userService.js";

const EMPTY_FORM = {
    tipo_documento: "",
    n_documento: 0,
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    telefono: "",
    email: "",
    password_hash: "",
    id_rol: 2,
    rol: null,
    estado: true,
};

export function AdminPanel() {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [status, setStatus] = useState(null); // "ok" | "error"

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (!decoded) { localStorage.removeItem("token"); navigate("/login"); return; }
        if (decoded.rol !== 1) { navigate("/login"); return; }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "n_documento" || name === "id_rol" ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        try {
            await createUser(form);
            setStatus("ok");
            setForm(EMPTY_FORM);
            setShowForm(false);
        } catch {
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 px-6 py-12 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="border-b border-neutral-200 pb-5">
                    <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight">Panel de Administrador</h1>
                    <p className="mt-2 text-sm text-neutral-500">Gestiona los recursos e información del sistema</p>
                </div>

                {/* Notificaciones */}
                {status === "ok" && (
                    <div className="px-4 py-3 rounded-lg bg-neutral-100 text-neutral-700 text-sm border border-neutral-200">
                        Usuario creado correctamente.
                    </div>
                )}
                {status === "error" && (
                    <div className="px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
                        Error al crear el usuario. Verifica los datos.
                    </div>
                )}

                {/* Cards de navegación */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        onClick={() => { setShowForm(true); setStatus(null); }}
                        className="group block h-full bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer"
                    >
                        <h3 className="text-lg font-medium text-neutral-800 group-hover:text-black transition-colors">Crear usuario</h3>
                        <p className="mt-2 text-sm text-neutral-500">Registrar docente o administrador</p>
                    </div>

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

            
                </div>

                {/* Formulario crear usuario */}
                {showForm && (
                    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-neutral-800">Nuevo usuario</h2>
                                <p className="mt-1 text-sm text-neutral-500">Completa los datos del usuario a registrar</p>
                            </div>
                            <button
                                onClick={() => { setShowForm(false); setStatus(null); }}
                                className="text-neutral-400 hover:text-neutral-700 transition-colors text-xl leading-none"
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-neutral-700">Tipo documento</label>
                                    <select
                                        name="tipo_documento"
                                        required
                                        value={form.tipo_documento}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800"
                                    >
                                        <option value="">Selecciona</option>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                        <option value="TI">Tarjeta de Identidad</option>
                                        <option value="PP">Pasaporte</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-neutral-700">Número documento</label>
                                    <input
                                        type="number"
                                        name="n_documento"
                                        placeholder="..."
                                        required
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-neutral-700">Primer nombre</label>
                                    <input name="primer_nombre" placeholder="..." required onChange={handleChange}
                                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-neutral-700">Segundo nombre</label>
                                    <input name="segundo_nombre" placeholder="Opcional" onChange={handleChange}
                                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-neutral-700">Primer apellido</label>
                                    <input name="primer_apellido" placeholder="..." required onChange={handleChange}
                                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-neutral-700">Segundo apellido</label>
                                    <input name="segundo_apellido" placeholder="Opcional" onChange={handleChange}
                                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-700">Teléfono</label>
                                <input name="telefono" placeholder="..." required onChange={handleChange}
                                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-700">Correo electrónico</label>
                                <input type="email" name="email" placeholder="correo@ejemplo.com" required onChange={handleChange}
                                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-700">Contraseña</label>
                                <input type="password" name="password_hash" placeholder="••••••••" required onChange={handleChange}
                                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800" />
                            </div>

                            {/* Selector de rol — solo visible en el panel admin */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-700">Rol</label>
                                <select
                                    name="id_rol"
                                    value={form.id_rol}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800"
                                >
                                    <option value={2}>Docente</option>
                                    <option value={1}>Administrador</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 px-4 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 outline-none"
                                >
                                    Crear usuario
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setStatus(null); }}
                                    className="py-2.5 px-4 bg-white text-neutral-700 border border-neutral-200 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
