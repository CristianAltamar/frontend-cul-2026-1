import { useState } from "react";
import { createUser } from "../services/userservice.js";

export function Register(){
    const [form,setForm] = useState({
        primer_nombre:"",
        segundo_nombre:"",
        primer_apellido:"",
        segundo_apellido:"",
        email:"",
        password_hash:"",
        id_rol:2,
        rol:null,
        activo:true
    });

    const handleChange = (e)=>{
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e)=>{
        e.preventDefault();
        try{
            await createUser(form);
            alert("Usuario creado");
        }catch(err){
            alert("Error creando usuario");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 px-4 py-8 font-sans">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-neutral-800 tracking-tight">Crear cuenta</h2>
                    <p className="mt-2 text-sm text-neutral-500">Completa tus datos para registrarte</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-neutral-700">Primer Nombre</label>
                            <input
                                name="primer_nombre"
                                placeholder="..."
                                required
                                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-sm text-neutral-800"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-neutral-700 block">Segundo Nombre</label>
                            <input
                                name="segundo_nombre"
                                placeholder="Opcional"
                                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-sm text-neutral-800"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-neutral-700 block mt-2">Primer Apellido</label>
                            <input
                                name="primer_apellido"
                                placeholder="..."
                                required
                                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-sm text-neutral-800"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-neutral-700 block mt-2">Segundo Apellido</label>
                            <input
                                name="segundo_apellido"
                                placeholder="Opcional"
                                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-sm text-neutral-800"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-1 mt-4">
                        <label className="text-sm font-medium text-neutral-700 block">Correo Electrónico</label>
                        <input
                            name="email"
                            placeholder="tucorreo@ejemplo.com"
                            className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-sm text-neutral-800"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1 mt-4">
                        <label className="text-sm font-medium text-neutral-700 block">Contraseña</label>
                        <input
                            name="password_hash"
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-sm text-neutral-800"
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="w-full mt-8 py-2.5 px-4 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 outline-none">
                        Registrarte
                    </button>
                    
                    <div className="text-center pt-3">
                        <p className="text-sm text-neutral-500">
                            ¿Ya tienes cuenta?{" "}
                            <a href="/login" className="font-semibold text-black hover:underline transition-all">
                                Iniciar Sesión
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}