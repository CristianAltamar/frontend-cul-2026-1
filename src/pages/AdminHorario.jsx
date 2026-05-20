import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";
import { getDisponibilidadDocente } from "../services/disponibilidadService.js";
import { crearHorario, deleteHorario, getHorarioDocente, updateHorario } from "../services/horarioService.js";
import { getProgramas, createPrograma, updatePrograma, deletePrograma } from "../services/programaService.js";
import { getJornadas, createJornada, updateJornada, deleteJornada } from "../services/jornadaService.js";
import { getPeriodos, createPeriodo, updatePeriodo, deletePeriodo } from "../services/periodoService.js";
import { getAsignaturas, createAsignatura, updateAsignatura, deleteAsignatura } from "../services/asignaturaService.js";
import { getGrupos, createGrupo, updateGrupo, deleteGrupo } from "../services/grupoService.js";
import { getDocentes } from "../services/userService.js";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { TabAsignaturas }from "../components/horario/TabAsignatura.jsx";
import { TabJornadas } from "../components/horario/TabJornada.jsx";
import { TabPeriodos }  from "../components/horario/TabPeriodo.jsx";
import { TabGrupos }   from "../components/horario/TabGrupo.jsx";
import { TabHorario }  from "../components/horario/TabHorario.jsx";
import { createSchedule } from "../utils/schedule.js"; 
import { useAdminHorarioStore } from "../stores/useAdminHorarioStore.js";
// ── Constantes ────────────────────────────────────────────────────────────────


const TABS = [
    { id: "horario",     label: "Programación"  },
    { id: "grupos",      label: "Grupos"        },
    { id: "periodos",    label: "Periodos"      },
    { id: "jornadas",    label: "Jornadas"      },
    { id: "asignaturas", label: "Asignaturas"   },
];

// ── Clases Tailwind reutilizables ─────────────────────────────────────────────
export const cx = {
    input:        "w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800 disabled:opacity-50 cursor-pointer",
    label:        "block text-xs font-medium text-neutral-600 mb-1",
    btnPrimary:   "px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-neutral-800 active:bg-neutral-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
    btnSecondary: "px-4 py-2 bg-white text-neutral-700 border border-neutral-200 text-sm rounded-lg hover:bg-neutral-50 transition-colors font-medium cursor-pointer",
    btnDanger:    "px-3 py-1.5 text-xs text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors cursor-pointer",
    btnEdit:      "px-3 py-1.5 text-xs text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer",
    card:         "bg-white rounded-2xl border border-neutral-100 shadow-sm",
    badge:        "px-2 py-0.5 rounded-full text-xs font-medium",
    th:           "px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider text-left",
    td:           "px-5 py-3.5 text-sm text-neutral-700",
};

export function AdminHorario() {
    const navigate = useNavigate();

    const { loadAllData, setActiveTab, activeTab } = useAdminHorarioStore();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (!decoded || decoded.rol !== 1) { navigate("/login"); return; }

        loadAllData();

    }, [navigate]);

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">

            {/* ── Header + Tab bar ── */}
            <div className="bg-white border-b border-neutral-100 sticky top-14 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-7 pb-0">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight">
                        Programación Académica
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 mb-4">
                        Gestiona horarios, grupos, periodos, jornadas y asignaturas
                    </p>

                    {/* Tabs */}
                    <div className="flex gap-0 overflow-x-auto">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                                    activeTab === tab.id
                                        ? "border-neutral-900 text-neutral-900"
                                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-200"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Contenido de tab ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {activeTab === "horario" && (
                    <TabHorario />
                )}
                {activeTab === "grupos" && (
                    <TabGrupos />
                )}
                {activeTab === "periodos" && (
                    <TabPeriodos />
                )}
                {activeTab === "jornadas" && (
                    <TabJornadas />
                )}
                {activeTab === "asignaturas" && (
                    <TabAsignaturas />
                )}
            </div>
        </div>
    );
}
