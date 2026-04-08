import { Link } from "react-router-dom";

export function Home(){
    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-6 font-sans">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center space-y-6">
                <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight">Bienvenido</h1>
                <p className="text-neutral-500 text-sm">Selecciona una opción para continuar</p>
                <div className="flex flex-col gap-3 mt-8">
                    <Link to="/login" className="w-full">
                        <button className="w-full py-2.5 px-4 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 outline-none">
                            Iniciar Sesión
                        </button>
                    </Link>

                    <Link to="/register" className="w-full">
                        <button className="w-full py-2.5 px-4 bg-white text-neutral-800 border border-neutral-200 rounded-lg font-medium hover:bg-neutral-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-neutral-200 outline-none">
                            Crear Usuario
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}