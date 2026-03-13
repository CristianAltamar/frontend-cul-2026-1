import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

export function Login(){
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const data = await login(email,password);
            localStorage.setItem("token",data.access_token);
            navigate("/horario");
        }catch(err){
            alert("Credenciales incorrectas");
        }
    };

    return(
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                type="email"
                placeholder="email"
                onChange={(e)=>setEmail(e.target.value)}
                />

                <input
                type="password"
                placeholder="password"
                onChange={(e)=>setPassword(e.target.value)}
                />

                <button type="submit">
                Login
                </button>

                <Link to="/register">
                Crear usuario
                </Link>

            </form>
        </div>

    );

}