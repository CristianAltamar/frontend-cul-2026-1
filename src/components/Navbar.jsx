import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";

const docenteLinks = [
    { to: "/disponibilidad", label: "Disponibilidad" },
    { to: "/horario",        label: "Horario"        },
];

const adminLinks = [
    { to: "/admin/crear-usuario", label: "Crear usuario" },
    { to: "/admin/docentes",      label: "Usuarios"      },
    { to: "/admin/horario",       label: "Horario"       },
    { to: "/admin/reportes",      label: "Reportes"      },
];

export function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dashAnim, setDashAnim] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const decoded = token ? decodeToken(token) : null;
    const isAdmin = decoded?.rol === 1;

    const visibleLinks = isAdmin ? adminLinks : docenteLinks;
    const dashboardPath = isAdmin ? "/admin" : "/docente";

    const displayName = decoded?.nombre
        || [decoded?.primer_nombre, decoded?.primer_apellido].filter(Boolean).join(" ").trim()
        || decoded?.email?.split("@")[0]
        || "";

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleDashboard = () => {
        setDashAnim(true);
        setTimeout(() => {
            setDashAnim(false);
            navigate(dashboardPath);
        }, 200);
    };

    const navLinkClass = ({ isActive }) =>
        isActive
            ? "text-black font-medium border-b-2 border-black pb-0.5 transition-colors"
            : "text-neutral-500 hover:text-neutral-800 transition-colors font-medium";

    return (
        <nav className="bg-white border-b border-neutral-100 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

                {/* Logo */}
                <NavLink to="/" className="text-base font-semibold text-neutral-800 tracking-tight shrink-0">
                    CUL <span className="text-neutral-400 font-normal">2026</span>
                </NavLink>

                {/* Links desktop */}
                <div className="hidden md:flex items-center gap-6">

                    {/* Dashboard — admin y docente */}
                    <button
                        onClick={handleDashboard}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 select-none ${
                            dashAnim
                                ? "bg-neutral-900 text-white scale-95"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:scale-95"
                        }`}
                    >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                        </svg>
                        Dashboard
                    </button>

                    {visibleLinks.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                {/* Usuario + Logout desktop */}
                <div className="hidden md:flex items-center gap-3">
                    {displayName && (
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-white leading-none">
                                    {displayName[0].toUpperCase()}
                                </span>
                            </div>
                            <span className="text-sm text-neutral-700 font-medium hidden lg:block max-w-[140px] truncate">
                                {displayName}
                            </span>
                        </div>
                    )}
                    {displayName && <span className="text-neutral-200">|</span>}
                    <button
                        onClick={handleLogout}
                        className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors font-medium"
                    >
                        Cerrar sesión
                    </button>
                </div>

                {/* Hamburger mobile */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-1"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="Abrir menú"
                >
                    <span className={`block h-0.5 w-5 bg-neutral-700 transition-transform duration-200 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
                    <span className={`block h-0.5 w-5 bg-neutral-700 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                    <span className={`block h-0.5 w-5 bg-neutral-700 transition-transform duration-200 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
                </button>
            </div>

            {/* Menu mobile */}
            {menuOpen && (
                <div className="md:hidden border-t border-neutral-100 bg-white px-6 py-4 flex flex-col gap-4">

                    {/* Usuario mobile */}
                    {displayName && (
                        <div className="flex items-center gap-2 pb-1">
                            <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-white leading-none">
                                    {displayName[0].toUpperCase()}
                                </span>
                            </div>
                            <span className="text-sm text-neutral-700 font-medium">{displayName}</span>
                        </div>
                    )}

                    <hr className="border-neutral-100" />

                    {/* Dashboard mobile */}
                    <button
                        onClick={() => { setMenuOpen(false); handleDashboard(); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 w-fit ${
                            dashAnim
                                ? "bg-neutral-900 text-white"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        }`}
                    >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                        </svg>
                        Dashboard
                    </button>

                    {visibleLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={navLinkClass}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    <hr className="border-neutral-100" />
                    <button
                        onClick={handleLogout}
                        className="text-left text-sm text-neutral-500 hover:text-neutral-800 transition-colors font-medium"
                    >
                        Cerrar sesión
                    </button>
                </div>
            )}
        </nav>
    );
}
