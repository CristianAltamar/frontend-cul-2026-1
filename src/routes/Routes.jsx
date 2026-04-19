import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "../components/Layout.jsx";
import { Login } from "../pages/Login.jsx";
import { Register } from "../pages/Register.jsx";
import { Home } from "../pages/Home.jsx";
import { Horario } from "../pages/Horario.jsx";
import { AdminPanel } from "../pages/Admin.jsx";
import { AdminDocentes } from "../pages/AdminDocentes.jsx";
import { Docente } from "../pages/Docente.jsx";
import { Disponibilidad } from "../pages/Disponibilidad.jsx";

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Páginas sin navbar */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Páginas con navbar */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/docente" element={<Docente />} />
                    <Route path="/disponibilidad" element={<Disponibilidad />} />
                    <Route path="/horario" element={<Horario />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/admin/docentes" element={<AdminDocentes />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
