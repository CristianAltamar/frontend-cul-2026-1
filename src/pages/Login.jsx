import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import fondoLogin from "../assets/fondo_login.jpg";

export function Login() {
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await login(email, password);
            localStorage.setItem("token", data.access_token);
            const decodedtoken = decodeToken(data.access_token);
            navigate(decodedtoken.rol === 1 ? "/admin" : "/docente");
        } catch (err) {
            setError("Correo o contraseña incorrectos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex font-sans overflow-hidden">

            {/* ── Fondo imagen ── */}
            <div className="absolute inset-0 z-0">
                <img
                    src={fondoLogin}
                    alt="CUL campus"
                    className="w-full h-full object-cover"
                />
                {/* Capa de oscurecimiento con gradiente */}
                <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/50 to-black/20" />
            </div>

            {/* ── Contenido ── */}
            <div className="relative z-10 flex w-full min-h-screen">

                {/* Panel izquierdo — branding */}
                <div className="hidden lg:flex flex-col justify-between w-1/2 px-16 py-14">
                    <div>
                        <span className="text-white text-xl font-semibold tracking-tight">
                            CUL <span className="text-white/50 font-normal">2026</span>
                        </span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
                            Sistema de<br />Programación<br />Académica
                        </h1>
                        <p className="text-white/60 text-base max-w-sm leading-relaxed">
                            Gestión de horarios y asignación de docentes para la Corporación Universitaria latinoamericana. Accede a tu panel para administrar tus clases y disponibilidad.
                        </p>
                    </div>
                    <p className="text-white/30 text-xs">© 2026 CUL · Todos los derechos reservados</p>
                </div>

                {/* Panel derecho — formulario */}
                <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
                    <div className="w-full max-w-sm">

                        {/* Logo mobile */}
                        <div className="lg:hidden mb-8 text-center">
                            <span className="text-white text-xl font-semibold tracking-tight">
                                CUL <span className="text-white/50 font-normal">2026</span>
                            </span>
                        </div>

                        {/* Card del formulario */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">

                            <div className="space-y-1">
                                <h2 className="text-2xl font-semibold text-white tracking-tight">Iniciar sesión</h2>
                                <p className="text-sm text-white/50">Ingresa tus credenciales para acceder</p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-red-500/20 border border-red-400/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                    <p className="text-sm text-red-200">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-white/70 uppercase tracking-wider">
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="tucorreo@ejemplo.com"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-white/70 uppercase tracking-wider">
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 mt-2 py-3 px-4 bg-white text-neutral-900 rounded-xl font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all focus:ring-2 focus:ring-white/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading && <LoadingSpinner size="sm" />}
                                    {loading ? "Ingresando…" : "Ingresar"}
                                </button>

                            </form>

                            <div className="text-center pt-1">
                                <p className="text-sm text-white/40">
                                    ¿No tienes cuenta?{" "}
                                    <Link to="/register" className="text-white font-medium hover:underline transition-all">
                                        Registrarse
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
