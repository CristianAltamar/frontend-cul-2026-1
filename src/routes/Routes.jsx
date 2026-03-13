import { BrowserRouter,Routes,Route } from "react-router-dom";
import { Login } from "../pages/Login.jsx";
import { Register } from "../pages/Register.jsx";
import { Home } from "../pages/Home.jsx";
import { Horario } from "../pages/Horario.jsx";
import { AdminPanel } from "../pages/admin.jsx";
import { Salon } from "../pages/Salon.jsx";
import { Docente } from "../pages/Docente.jsx";

export function AppRoutes(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/horario" element={<Horario/>} />
                <Route path="/admin" element={<AdminPanel/>} />
                <Route path="/salones" element={<Salon/>} />
                <Route path="/docente" element={<Docente/>} />
            </Routes>
        </BrowserRouter>
    );
}