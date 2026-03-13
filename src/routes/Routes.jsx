import { BrowserRouter,Routes,Route } from "react-router-dom";
import { Login } from "../pages/login.jsx";
import { Register } from "../pages/Register.jsx";
import { Home } from "../pages/home.jsx";
import { Horario } from "../pages/Horario.jsx";

export function AppRoutes(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/horario" element={<Horario/>} />
            </Routes>
        </BrowserRouter>
    );
}