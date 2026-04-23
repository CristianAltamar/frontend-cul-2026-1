import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";
import { createUser } from "../services/userService.js";
import { LoadingOverlay, LoadingSpinner } from "../components/LoadingSpinner.jsx";

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

export function AdminCrearDocente() {
    const navigate = useNavigate();
    const [form,   setForm]   = useState(EMPTY_FORM);
    const [status, setStatus] = useState(null); // "ok" | "error"
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (!decoded || decoded.rol !== 1) { navigate("/login"); return; }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === "n_documento" || name === "id_rol" ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        setSaving(true);
        try {
            await createUser(form);
            setStatus("ok");
            setForm(EMPTY_FORM);
        } catch {
            setStatus("error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 px-6 py-12 font-sans">
            {saving && <LoadingOverlay message="Creando usuario…" />}
            <div className="max-w-2xl mx-auto space-y-8">

                <div className="border-b border-neutral-200 pb-5">
                    <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight">Crear usuario</h1>
                    <p className="mt-1 text-sm text-neutral-500">Registrar docente o administrador en el sistema</p>
                </div>

                {status === "ok" && (
                    <div className="px-4 py-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-100">
                        Usuario creado correctamente.
                    </div>
                )}
                {status === "error" && (
                    <div className="px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
                        Error al crear el usuario. Verifica los datos.
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
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

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving && <LoadingSpinner size="sm" light />}
                                {saving ? "Creando usuario…" : "Crear usuario"}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
