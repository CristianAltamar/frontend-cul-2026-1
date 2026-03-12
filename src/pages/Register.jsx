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

    return(
        <div>
            <h2>Crear usuario</h2>
            <form onSubmit={handleSubmit}>
                <input
                name="primer_nombre"
                placeholder="Primer nombre"
                required
                onChange={handleChange}
                />

                <input
                name="segundo_nombre"
                placeholder="Segundo ombre"
                onChange={handleChange}
                />

                <input
                name="primer_apellido"
                placeholder="Primer apellido"
                required
                onChange={handleChange}
                />

                <input
                name="segundo_apellido"
                placeholder="Segundo apellido"
                onChange={handleChange}
                />

                <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
                />

                <input
                name="password_hash"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                />

                <button type="submit">
                Crear
                </button>
            </form>
        </div>
    )
}