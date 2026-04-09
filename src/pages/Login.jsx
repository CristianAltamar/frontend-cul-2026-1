import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";

export function Login(){
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            // Realizar la solicitud de inicio de sesión
            const data = await login(email,password);
            // Guardar el token en localStorage
            localStorage.setItem("token",data.access_token);
            // Decodificar el token para obtener el rol del usuario
            const decodedtoken = decodeToken(data.access_token);
            if (decodedtoken.rol === 1) {
                navigate("/admin");
                return;
            }
            navigate("/docente");
        }catch(err){
            alert("Credenciales incorrectas");
        }
    };

    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-6 font-sans">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-neutral-800 tracking-tight">Iniciar Sesión</h2>
                    <p className="mt-2 text-sm text-neutral-500">Ingresa tus credenciales para acceder</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700">Correo Electrónico</label>
                        <input
                            type="email"
                            placeholder="tucorreo@ejemplo.com"
                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-sm text-neutral-800"
                            onChange={(e)=>setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700">Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-sm text-neutral-800"
                            onChange={(e)=>setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="w-full mt-6 py-2.5 px-4 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 outline-none cursor-pointer">
                        Ingresar
                    </button>
                    
                    <div className="text-center pt-2">
                        <p className="text-sm text-neutral-500">
                            ¿No tienes una cuenta?{" "}
                            <Link to="/register" className="font-semibold text-black hover:underline transition-all">
                                Registrarse
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}