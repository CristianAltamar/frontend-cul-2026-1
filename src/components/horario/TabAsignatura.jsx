import { AsignaturasSection } from "./AsignaturasSection.jsx";
import { FacultadesSection } from "./FacultadesSection.jsx";
import { ProgramasSection } from "./ProgramasSection.jsx";
import { getFacultades, createFacultad, updateFacultad, deleteFacultad } from "../../services/facultadService.js";
import { useEffect, useState } from "react";


export function TabAsignaturas({ asignaturas, setAsignaturas, programas, setProgramas }) {
    const [facultades, setFacultades] = useState([]);


    useEffect(() => {
        const loadFacultades = async () => {
            const data = await getFacultades();
            setFacultades(data);
        };
        loadFacultades();
    }, []);

    return (
        <div className="space-y-6">
            <details className="group">
                <summary className="cursor-pointer px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-neutral-800">Asignaturas</h2>
                        <p className="text-sm text-neutral-600 mt-1">Gestionar las asignaturas del sistema</p>
                    </div>
                    <svg className="w-5 h-5 text-neutral-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>
                <div className="mt-4">
                    <AsignaturasSection asignaturas={asignaturas} setAsignaturas={setAsignaturas} programas={programas} />
                </div>
            </details>

            <details className="group">
                <summary className="cursor-pointer px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-neutral-800">Facultades</h2>
                        <p className="text-sm text-neutral-600 mt-1">Gestionar las facultades del sistema</p>
                    </div>
                    <svg className="w-5 h-5 text-neutral-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>
                <div className="mt-4">
                    <FacultadesSection facultades={facultades} setFacultades={setFacultades} />
                </div>
            </details>

            <details className="group">
                <summary className="cursor-pointer px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-neutral-800">Programas</h2>
                        <p className="text-sm text-neutral-600 mt-1">Gestionar los programas del sistema</p>
                    </div>
                    <svg className="w-5 h-5 text-neutral-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>
                <div className="mt-4">
                    <ProgramasSection programas={programas} setProgramas={setProgramas} facultades={facultades} />
                </div>
            </details>
        </div>
    );
}