# 📋 Guía de Migración - De Props a Zustand

## 🚀 Cómo usar los stores

### 1. useAdminHorarioStore

**Para AdminHorario.jsx:**

```javascript
import { useAdminHorarioStore } from '../stores/useAdminHorarioStore.js';

export function AdminHorario() {
    const navigate = useNavigate();
    
    // Obtener estados y acciones del store (sin props)
    const {
        activeTab, setActiveTab,
        programas, periodos, jornadas, asignaturas, docentes, grupos,
        filtro, setFiltro, asignaciones, setAsignaciones,
        loadAllData
    } = useAdminHorarioStore();

    // Cargar datos una sola vez
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (!decoded || decoded.rol !== 1) { navigate("/login"); return; }

        loadAllData();
    }, [navigate]);

    return (
        <div>
            {/* Tabs */}
            {activeTab === "horario" && (
                <TabHorario 
                    // ❌ NO MÁS PROPS!
                    // Los componentes usan useAdminHorarioStore() directamente
                />
            )}
        </div>
    );
}
```

**Para TabHorario.jsx y otros componentes:**

```javascript
import { useAdminHorarioStore } from '../../stores/useAdminHorarioStore.js';

export function TabHorario() {
    // ✅ Acceder directamente del store
    const {
        filtro, setFiltro,
        periodos, jornadas, programas, asignaturas, 
        docentes, grupos,
        asignaciones, setAsignaciones
    } = useAdminHorarioStore();

    return (
        <div>
            <select 
                value={filtro.periodo_id}
                onChange={e => setFiltro({ 
                    ...filtro, 
                    periodo_id: e.target.value 
                })}
            >
                {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
        </div>
    );
}
```

---

### 2. useReportStore

**Para AdminReportes.jsx:**

```javascript
import { useReportStore } from '../stores/useReportStore.js';

export function AdminReportes() {
    const navigate = useNavigate();
    
    // Obtener todo del store
    const {
        filtro, setFiltro,
        docentes, programas, periodos,
        resultados, loading, error, stats,
        filtersReady, handleBuscar, handleLimpiar,
        loadInitialData
    } = useReportStore();

    // Cargar datos iniciales
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const decoded = decodeToken(token);
        if (!decoded || decoded.rol !== 1) { navigate("/login"); return; }

        loadInitialData();
    }, [navigate]);

    return (
        <div>
            {loading && <LoadingOverlay />}
            
            {/* 
                ❌ ANTES:
                <PanelFiltros 
                    filtro={filtro} setFiltro={setFiltro}
                    docentes={docentes} programas={programas}
                    handleBuscar={handleBuscar} handleLimpiar={handleLimpiar}
                    filtersReady={filtersReady}
                    loading={loading} resultados={resultados} error={error}
                />

                ✅ DESPUÉS:
            */}
            <PanelFiltros />

            {error && <Error message={error} />}

            {/* ✅ Resultado accede directamente del store */}
            {resultados && !loading && <Resultado />}
        </div>
    );
}
```

**Para PanelFiltros.jsx:**

```javascript
import { useReportStore } from '../../stores/useReportStore.js';

export const PanelFiltros = () => {
    // ✅ Sin props! Acceder directamente del store
    const {
        filtro, setFiltro,
        docentes, programas,
        filtersReady, loading, resultados, error,
        handleBuscar, handleLimpiar
    } = useReportStore();

    return (
        <div className={cx.card}>
            <div className="px-5 py-4 border-b border-neutral-100">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Parámetros del reporte
                </p>
            </div>

            <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Docente */}
                    <div>
                        <label className={cx.label}>Docente</label>
                        <select
                            className={cx.input}
                            value={filtro.id}
                            onChange={e =>
                                setFiltro({
                                    ...filtro,
                                    id: e.target.value,
                                    programa_id: "",
                                })
                            }
                        >
                            <option value="">Selecciona docente</option>
                            {docentes.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.primer_nombre} {d.primer_apellido}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Programa */}
                    <div>
                        <label className={cx.label}>Programa académico</label>
                        <select
                            className={cx.input}
                            value={filtro.programa_id}
                            onChange={e => setFiltro({ ...filtro, programa_id: e.target.value })}
                        >
                            <option value="">Selecciona programa</option>
                            {programas.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nombre} ({p.codigo})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha inicio */}
                    <div>
                        <label className={cx.label}>Fecha inicio</label>
                        <input
                            type="date"
                            className={cx.input}
                            value={filtro.fecha_inicio}
                            onChange={e => setFiltro({ ...filtro, fecha_inicio: e.target.value })}
                        />
                    </div>

                    {/* Fecha fin */}
                    <div>
                        <label className={cx.label}>Fecha fin</label>
                        <input
                            type="date"
                            className={cx.input}
                            value={filtro.fecha_fin}
                            onChange={e => setFiltro({ ...filtro, fecha_fin: e.target.value })}
                        />
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 pt-1">
                    <button
                        onClick={handleBuscar}
                        disabled={!filtersReady || loading}
                        className={cx.btnPrimary}
                    >
                        Generar reporte
                    </button>
                    {(resultados !== null || error) && (
                        <button onClick={handleLimpiar} className={cx.btnSecondary}>
                            Limpiar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
```

**Para Resultado.jsx:**

```javascript
import { useReportStore } from '../../stores/useReportStore.js';

export const Resultado = () => {
    // ✅ Acceder directamente del store
    const { resultados, filtro, stats } = useReportStore();

    if (!resultados) return null;

    return (
        <div className="space-y-5">
            {/* Encabezado del reporte */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-neutral-800">
                        {resultados.docente?.primer_nombre} {resultados.docente?.primer_apellido}
                        <span className="mx-2 text-neutral-300">·</span>
                        <span className="font-normal text-neutral-500">
                            {resultados.asignatura}
                        </span>
                    </h2>
                    <p className="text-sm text-neutral-400 mt-0.5">
                        {filtro.fecha_inicio} → {filtro.fecha_fin}
                        {resultados.periodos.length > 0 && (
                            <span className="ml-2">
                                · {resultados.periodos.map(p => p.nombre).join(", ")}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <TarjetaStats stats={stats} resultados={resultados} />
            )}

            {/* Contenido */}
            {resultados.clases.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <TablaDetalle resultados={resultados} />
                    <DetalleCelular resultados={resultados} />
                </>
            )}
        </div>
    );
};
```

---

## 📝 Pasos para la migración

### Paso 1: AdminHorario.jsx
1. Eliminar todos los `useState` locales
2. Importar `useAdminHorarioStore`
3. Reemplazar acceso a estados
4. Cambiar `setProgramas(...)` por `store.setProgramas(...)`
5. Llamar `loadAllData()` en el useEffect

### Paso 2: Componentes de AdminHorario (TabHorario, TabGrupos, etc.)
1. Eliminar props
2. Importar `useAdminHorarioStore`
3. Acceder directamente del store

### Paso 3: AdminReportes.jsx
1. Eliminar todos los `useState` locales
2. Importar `useReportStore`
3. Cambiar handlers por `store.handleBuscar()` y `store.handleLimpiar()`
4. Eliminar `useReport` hook
5. Llamar `loadInitialData()` en el useEffect

### Paso 4: PanelFiltros.jsx
1. Eliminar todos los props
2. Importar `useReportStore`
3. Actualizar firma de función: `export const PanelFiltros = () => { ... }`
4. Acceder estados del store

### Paso 5: Resultado.jsx
1. Eliminar todos los props
2. Importar `useReportStore`
3. Actualizar firma de función
4. Acceder estados del store

---

## 🎯 Verificación

- [ ] No hay props que se pasen entre componentes relacionados
- [ ] Todos los componentes usan el store correspondiente
- [ ] Los hooks `useEffect` llaman a `loadAllData()` o `loadInitialData()`
- [ ] Las acciones CRUD actualizan el store correctamente
- [ ] Solo hay UNA fuente de verdad por página

---

## 💡 Tips

- Usa **selectores** si solo necesitas ciertos estados
- Usa **listener** para efectos cuando necesites reaccionar a cambios
- Zustand es **muy rápido** - solo re-renderiza componentes que usan datos que cambiaron
- Puedes usar `shallow` de zustand para comparaciones superficiales si tienes muchos props

