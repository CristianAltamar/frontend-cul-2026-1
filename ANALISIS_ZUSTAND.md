# Análisis de Prop Drilling y Duplicación de Estado

## 🔴 PROBLEMAS IDENTIFICADOS

### 1. **AdminHorario.jsx** - Múltiples estados sin contexto
```
Estados locales:
- programas, setProgramas
- periodos, setPeriodos
- jornadas, setJornadas
- asignaturas, setAsignaturas
- docentes, setDocentes
- grupos, setGrupos
- asignaciones, setAsignaciones
- filtro, setFiltro
- activeTab, setActiveTab

Props pasadas a:
- TabHorario: filtro, setFiltro, periodos, jornadas, programas, asignaturas, docentes, grupos, asignaciones, setAsignaciones
- TabGrupos: grupos, setGrupos, periodos, jornadas
- TabPeriodos: periodos, setPeriodos
- TabJornadas: jornadas, setJornadas
- TabAsignaturas: asignaturas, setAsignaturas, programas, setProgramas

⚠️ PROP DRILLING profundo en TabHorario y sus sub-componentes
```

### 2. **AdminReportes.jsx** - Duplicación de datos
```
Estados separados:
- filtro, setFiltro (AdminReportes)
- filtro, setFiltro (también en useReport)
- docentes, setDocentes (cargados en AdminReportes)
- programas, setProgramas (cargados en AdminReportes)
- periodos, setPeriodos (cargados en AdminReportes)
- resultados, loading, error (en useReport)

Props pasadas a PanelFiltros:
- filtro, setFiltro, docentes, programas, handleBuscar, handleLimpiar, filtersReady, loading, resultados, error
⚠️ 10 PROPS! Prop drilling intenso
```

### 3. **Duplicación de "fuentes de la verdad"**
- Datos cargados en AdminReportes y nuevamente en useReport
- Estados filtro en múltiples lugares
- Llamadas a API duplicadas (getDocentes, getProgramas, getPeriodos)

### 4. **Componentes afectados**
```
PanelFiltros.jsx:
- Recibe: filtro, setFiltro, docentes, programas, handleBuscar, handleLimpiar, filtersReady, loading, resultados, error
- Modifica: filtro

Resultado.jsx:
- Recibe: resultados, filtro, stats
- Accede a: resultados.docente, resultados.clases, resultados.periodos, etc.
```

---

## ✅ SOLUCIÓN CON ZUSTAND

### Store 1: `useAdminHorarioStore`
**Responsabilidad:** Gestionar todos los datos de AdminHorario

```javascript
// Estados
- programas
- periodos
- jornadas
- asignaturas
- docentes
- grupos
- asignaciones
- filtro
- activeTab

// Acciones
- setProgramas
- setPeriodos
- setJornadas
- setAsignaturas
- setDocentes
- setGrupos
- setAsignaciones
- setFiltro
- setActiveTab
- loadAllData()
- resetFiltro()
```

### Store 2: `useReportStore`
**Responsabilidad:** Gestionar filtros, resultados y stats de AdminReportes

```javascript
// Estados
- filtro
- docentes
- programas
- periodos
- resultados
- loading
- error
- stats

// Acciones
- setFiltro
- setDocentes
- setProgramas
- setPeriodos
- setResultados
- setLoading
- setError
- setStats
- handleBuscar(filtro, periodos, docentes, programas)
- handleLimpiar
- loadInitialData() - Carga docentes, programas, periodos
```

---

## 📋 CAMBIOS REQUERIDOS

### AdminHorario.jsx
```diff
- Eliminar todos los useState locales
+ Usar useAdminHorarioStore para acceder a estados y acciones
- Llamadas a setProgramas, setJornadas, etc.
+ store.setProgramas(), store.setJornadas(), etc.
```

### AdminReportes.jsx
```diff
- Eliminar useState locales: filtro, docentes, programas, periodos, etc.
+ Usar useReportStore
- Eliminar handlers locales
+ Usar store.handleBuscar(), store.handleLimpiar()
- Pasar props individuales a PanelFiltros y Resultado
+ Dejar que PanelFiltros y Resultado consuman directamente del store
```

### PanelFiltros.jsx
```diff
- Recibir 10 props
+ Usar const { filtro, setFiltro, docentes, programas, handleBuscar, ... } = useReportStore()
- setFiltro(f => ({ ...f, ... }))
+ store.setFiltro({ ...filtro, ... })
```

### Resultado.jsx
```diff
- Recibir: resultados, filtro, stats
+ Usar const { resultados, filtro, stats } = useReportStore()
```

---

## 🎯 VENTAJAS

1. ✅ **Sin prop drilling** - Componentes acceden directamente del store
2. ✅ **Una única fuente de verdad** - Datos cargados una sola vez
3. ✅ **Componentes desacoplados** - No dependen de jerarquía de props
4. ✅ **Fácil de mantener** - Lógica centralizada
5. ✅ **Fácil de testear** - Store separado de componentes
6. ✅ **Performance** - Solo se re-renderiza lo que cambia (selectores de Zustand)
