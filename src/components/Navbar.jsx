import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";

const docenteLinks = [
    { to: "/", label: "Inicio", exact: true },
    { to: "/docente", label: "Panel" },
    { to: "/disponibilidad", label: "Disponibilidad" },
    { to: "/horario", label: "Horario" },
];

const adminLinks = [
    { to: "/", label: "Inicio", exact: true },
    { to: "/admin", label: "Administración" },
    { to: "/admin/docentes", label: "Docentes" },
];

export function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const decoded = token ? decodeToken(token) : null;
    const isAdmin = decoded?.rol === 1;

    const visibleLinks = isAdmin ? adminLinks : docenteLinks;

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
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
                <div className="hidden md:flex items-center gap-7">
                    {visibleLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.exact}
                            className={navLinkClass}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                {/* Logout desktop */}
                <div className="hidden md:flex items-center">
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
                    {visibleLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.exact}
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
