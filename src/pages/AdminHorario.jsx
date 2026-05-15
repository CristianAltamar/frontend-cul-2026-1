import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";
import { useAdminHorarioStore } from "../stores/useAdminHorarioStore.js";
import { TabAsignaturas } from "../components/horario/TabAsignatura.jsx";
import { TabJornadas } from "../components/horario/TabJornada.jsx";
import { TabPeriodos } from "../components/horario/TabPeriodo.jsx";
import { TabGrupos } from "../components/horario/TabGrupo.jsx";
import { TabHorario } from "../components/horario/TabHorario.jsx"; 
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
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
    input:        "w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm text-neutral-800 disabled:opacity-50",
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

// ── Utilidades ────────────────────────────────────────────────────────────────
function generateTimeSlots(horaInicio, horaFin, intervalMin = 60) {
    const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const toStr = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const slots = [];
    let cur = toMin(horaInicio);
    const end = toMin(horaFin);
    while (cur + intervalMin <= end) {
        slots.push({ inicio: toStr(cur), fin: toStr(cur + intervalMin) });
        cur += intervalMin;
    }
    return slots;
}

export function AdminHorario() {
    const navigate = useNavigate();

    // ── Obtener estado y acciones del store ────────────────────────────────
    const {
        activeTab, setActiveTab, loading, 
        error, loadAllData
    } = useAdminHorarioStore();

    // ── Auth: solo admins (rol 1) y cargar datos iniciales ────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (!decoded || decoded.rol !== 1) { navigate("/login"); return; }

        loadAllData();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
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
                                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
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
                        {activeTab === "horario" && <TabHorario />}
                        {activeTab === "grupos" && <TabGrupos />}
                        {activeTab === "periodos" && <TabPeriodos />}
                        {activeTab === "jornadas" && <TabJornadas />}
                        {activeTab === "asignaturas" && <TabAsignaturas />}
                    </div>
                </>
            )}
        </div>
    );
}
