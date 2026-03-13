import { Link } from "react-router-dom";

export function Home(){
    return(
        <div>
            <h1>Bienvenido</h1>
            <p>Selecciona una opción</p>
            <div>
                <Link to="/login">
                    <button>Login</button>
                </Link>

                <Link to="/register">
                    <button>Crear usuario</button>
                </Link>
            </div>
        </div>
    )
}