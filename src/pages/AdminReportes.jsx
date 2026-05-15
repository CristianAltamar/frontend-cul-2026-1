import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken.js";
import { LoadingOverlay } from "../components/LoadingSpinner.jsx";
import { cx } from "./AdminHorario.jsx";
import { useReportStore } from "../stores/useReportStore.js";
import { PanelFiltros } from "../components/adminReportes/PanelFiltros.jsx";
import { Error } from "../components/Error.jsx";
import { Resultado } from "../components/adminReportes/Resultado.jsx";
import doc from "../assets/doc.svg";
import { useReportStore } from "../stores/useReportStore.js";


// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
export function AdminReportes() {
    const { docentes, setDocentes, programas, setProgramas, periodos, setPeriodos } = useReportStore();
    const navigate = useNavigate();

    // ── Filtros del reporte ────────────────────────────────────────────────────
    const [filtro, setFiltro] = useState({
        id:"",
        programa_id:  "",
        fecha_inicio: "",
        fecha_fin:    "",
    });

    // ── Estado de la búsqueda ─────────────────────────────────────────────────
    const [grupos, setGrupos] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [horariosDocente, setHorariosDocente] = useState([]);

    const { filtersReady, resultados, loading, error, handleBuscar, Limpiar } = useReport({ filtro, periodos, docentes, programas });

    // ── Auth: solo admins (rol 1) y cargar datos iniciales ─────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (!decoded || decoded.rol !== 1) { navigate("/login"); return; }

        loadInitialData();
    }, [navigate]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-neutral-50 font-sans">

            {/* Overlay de carga de pantalla completa */}
            {loading && <LoadingOverlay message="Generando reporte..." />}

            {/* ── Encabezado de página (sticky bajo el Navbar) ── */}
            <div className="bg-white border-b border-neutral-100 sticky top-14 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight">
                        Reportes
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Consulta las clases asignadas a un docente por programa y rango de fechas
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <PanelFiltros />

                {/* ══ BANNER DE ERROR ══════════════════════════════════════════ */}
                {error && (
                    <Error message={error} />
                )}

                {/* ══ RESULTADOS ═══════════════════════════════════════════════ */}
                {resultados && !loading && (
                    <Resultado />
                )}

                {/* ══ ESTADO VACÍO INICIAL (sin búsqueda) ══════════════════════ */}
                {!resultados && !loading && !error && (
                    <div className={`${cx.card} py-20 flex flex-col items-center justify-center gap-3 px-4 text-center`}>
                        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3-14.25h.008v.008H15.75V3.75zm0 3h.008v.008H15.75V6.75zm0 3h.008v.008H15.75V9.75zm0 3h.008v.008H15.75v-.008zM9 21H5.25A2.25 2.25 0 013 18.75V5.25A2.25 2.25 0 015.25 3h9.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H7.5M9 21h9.75A2.25 2.25 0 0021 18.75V9.75c0-.621-.504-1.125-1.125-1.125H15.75"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-700">Sin reporte generado</p>
                            <p className="text-sm text-neutral-400 mt-1 max-w-sm">
                                Selecciona un docente, programa y rango de fechas, luego presiona
                                "Generar reporte".
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
