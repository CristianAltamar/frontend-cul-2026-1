import { BrowserRouter,Routes,Route } from "react-router-dom";
import { Login } from "../pages/login.jsx";
import { Register } from "../pages/Register.jsx"

export function AppRoutes(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>} />
            </Routes>
        </BrowserRouter>
    );
}