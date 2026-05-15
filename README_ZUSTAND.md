# 🎯 Zustand Store Implementation - README

## 📋 Overview

Se han creado **dos stores de Zustand** para eliminar prop drilling y tener una única fuente de verdad en tu aplicación:

### 1. **useAdminHorarioStore** 
- **Archivo**: `src/stores/useAdminHorarioStore.js`
- **Responsabilidad**: Gestionar todos los datos de la página AdminHorario
- **Datos**: programas, periodos, jornadas, asignaturas, docentes, grupos, asignaciones, filtro, activeTab
- **Acciones**: Setters, CRUD operations, loadAllData

### 2. **useReportStore**
- **Archivo**: `src/stores/useReportStore.js`
- **Responsabilidad**: Gestionar filtros, resultados y stats de AdminReportes
- **Datos**: filtro, docentes, programas, periodos, resultados, loading, error, stats
- **Acciones**: Setters, loadInitialData, handleBuscar, handleLimpiar

---

## ✅ Checklist de Implementación

### Fase 1: AdminReportes (Más Simple - EMPIEZA POR AQUÍ)

- [ ] **1.1** Actualizar `src/pages/AdminReportes.jsx`
  - Importar: `import { useReportStore } from '../stores/useReportStore.js';`
  - Reemplazar todos los useState por destructuring del store
  - Cambiar `useReport` hook por `loadInitialData()` y `handleBuscar()`
  - Eliminar props pasadas a `PanelFiltros` y `Resultado`

- [ ] **1.2** Actualizar `src/components/adminReportes/PanelFiltros.jsx`
  - Eliminar todos los props de la función
  - Importar: `import { useReportStore } from '../../stores/useReportStore.js';`
  - Agregar: `const { filtro, setFiltro, ... } = useReportStore();`
  - Verificar que los selects y inputs funcionen correctamente

- [ ] **1.3** Actualizar `src/components/adminReportes/Resultado.jsx`
  - Eliminar todos los props de la función
  - Importar: `import { useReportStore } from '../../stores/useReportStore.js';`
  - Agregar: `const { resultados, filtro, stats } = useReportStore();`
  - Verificar que se muestre correctamente

- [ ] **1.4** Eliminar `src/hooks/useReport.jsx`
  - Una vez migrado a AdminReportes, este hook ya no es necesario

### Fase 2: AdminHorario (Más Complejo)

- [ ] **2.1** Actualizar `src/pages/AdminHorario.jsx`
  - Importar: `import { useAdminHorarioStore } from '../stores/useAdminHorarioStore.js';`
  - Reemplazar todos los useState por destructuring del store
  - Llamar `loadAllData()` en el useEffect
  - Eliminar props pasadas a Tab components

- [ ] **2.2** Actualizar `src/components/horario/TabHorario.jsx`
  - Eliminar todos los props
  - Importar el store
  - Acceder datos directamente del store

- [ ] **2.3** Actualizar `src/components/horario/TabAsignatura.jsx`
  - Eliminar todos los props
  - Importar el store
  - Usar `store.createAsignatura()`, `store.updateAsignatura()`, etc.

- [ ] **2.4** Actualizar `src/components/horario/TabGrupo.jsx`
  - Eliminar todos los props
  - Importar el store
  - Usar CRUD actions del store

- [ ] **2.5** Actualizar `src/components/horario/TabPeriodo.jsx`
  - Eliminar todos los props
  - Importar el store
  - Usar CRUD actions del store

- [ ] **2.6** Actualizar `src/components/horario/TabJornada.jsx`
  - Eliminar todos los props
  - Importar el store
  - Usar CRUD actions del store

- [ ] **2.7** Actualizar Sub-componentes de horario
  - `src/components/horario/tabHorario/Slots.jsx`
  - `src/components/horario/tabHorario/TableHorario.jsx`
  - Eliminar props, importar store, acceder directamente

---

## 📝 Template Rápido para Migración

### Para PanelFiltros.jsx

```javascript
import { cx } from "../../pages/AdminHorario";
import { useReportStore } from '../../stores/useReportStore.js';

export const PanelFiltros = () => {  // ✅ SIN PROPS
    const {
        filtro, setFiltro,
        docentes, programas,
        filtersReady, loading, resultados, error,
        handleBuscar, handleLimpiar
    } = useReportStore();

    return (
        // ... UI igual al actual
    );
};
```

### Para Resultado.jsx

```javascript
import { cx } from "../../pages/AdminHorario";
import { useReportStore } from '../../stores/useReportStore.js';
import { TarjetaStats } from "./resultado/TarjetaStats.jsx";
import { TablaDetalle } from "./resultado/TablaDetalle.jsx";
import { DetalleCelular } from "./resultado/DetalleCelular.jsx";

export const Resultado = () => {  // ✅ SIN PROPS
    const { resultados, filtro, stats } = useReportStore();

    if (!resultados) return null;

    return (
        // ... UI igual al actual
    );
};
```

### Para Tab Components (TabHorario, TabGrupos, etc.)

```javascript
import { useAdminHorarioStore } from '../../stores/useAdminHorarioStore.js';

export function TabHorario() {  // ✅ SIN PROPS
    const {
        filtro, setFiltro,
        periodos, jornadas, programas, asignaturas,
        docentes, grupos,
        asignaciones, setAsignaciones
    } = useAdminHorarioStore();

    return (
        // ... UI igual al actual
    );
}
```

---

## 🔍 Verificación de Errores Comunes

### ❌ Error Común 1: "store.setFiltro is not a function"
**Causa**: No importaste el store correctamente
```javascript
// ❌ INCORRECTO
import useReportStore from '../stores/useReportStore.js';

// ✅ CORRECTO
import { useReportStore } from '../stores/useReportStore.js';
```

### ❌ Error Común 2: "state is undefined"
**Causa**: Trying to access state instead of calling the hook
```javascript
// ❌ INCORRECTO
const filtro = useReportStore.filtro;

// ✅ CORRECTO
const { filtro } = useReportStore();
```

### ❌ Error Común 3: Componente no se actualiza
**Causa**: No estás usando el estado del store
```javascript
// ❌ INCORRECTO - Creas state local
const [filtro, setFiltro] = useState();

// ✅ CORRECTO - Usas el store
const { filtro, setFiltro } = useReportStore();
```

### ❌ Error Común 4: "filtersReady undefined"
**Causa**: `filtersReady` es un getter, no está en el retorno del store como tal
```javascript
// ✅ Acceso correcto
const store = useReportStore();
if (store.filtersReady) { ... }

// O directamente destructurado (dentro del componente)
const { filtersReady } = useReportStore();
```

---

## 🧪 Testing de los Stores

```javascript
// Puedes testear cada acción del store de forma aislada
import { useReportStore } from '../stores/useReportStore.js';

// Test 1: Verificar que filtersReady sea false con filtro vacío
const store = useReportStore.getState();
console.log(store.filtersReady); // false

// Test 2: Setear filtro y verificar
store.setFiltro({
    id: '1',
    programa_id: '2',
    fecha_inicio: '2024-01-01',
    fecha_fin: '2024-12-31'
});
console.log(store.filtersReady); // true

// Test 3: Verificar loadInitialData
await store.loadInitialData();
console.log(store.docentes.length > 0); // true
console.log(store.programas.length > 0); // true
```

---

## 📚 Documentación Adicional

- **ANALISIS_ZUSTAND.md** - Análisis detallado del problema y solución
- **ANTES_DESPUES.md** - Comparación visual antes/después del refactor
- **GUIA_MIGRACION_ZUSTAND.md** - Guía paso a paso con ejemplos de código

---

## 🎯 Beneficios Inmediatos Después de la Migración

✅ **Sin prop drilling** - Componentes acceden directamente del store
✅ **Una única fuente de verdad** - Datos sincronizados en toda la app
✅ **Componentes reutilizables** - Pueden usarse en cualquier contexto
✅ **Más fácil de mantener** - Cambios centralizados en los stores
✅ **Mejor performance** - Solo re-renderiza lo que cambia
✅ **Más fácil testear** - Logic separada de componentes UI
✅ **Más escalable** - Agregar nuevas páginas/features es simple

---

## 🚀 Próximos Pasos (Opcional)

1. **Agregar DevTools de Zustand** para debugging
2. **Agregar persistencia** si necesitas guardar estado en localStorage
3. **Agregar middlewares** para logging de acciones
4. **Refactorizar otros hooks** con el mismo patrón (useDisponibilidad, etc.)

---

## 💬 Preguntas Frecuentes

**P: ¿Necesito eliminar useEffect en los componentes?**
R: No, los useEffect siguen siendo útiles. Solo no los uses para prop drilling.

**P: ¿Puedo tener múltiples instancias del store?**
R: No, Zustand crea una única instancia global. Si necesitas múltiples, considera usar Context + hooks.

**P: ¿Cómo manejo efectos secundarios complejos?**
R: Crea acciones asíncronas en el store (como `loadAllData` o `handleBuscar`).

**P: ¿El store es reactivo?**
R: Sí, Zustand es completamente reactivo. Los componentes se suscriben automáticamente a cambios.

**P: ¿Necesito Context API además de Zustand?**
R: No, Zustand reemplaza Context API de forma más eficiente.

---

## 📞 Soporte

Si encuentras problemas durante la migración:
1. Verifica los errores comunes arriba ↑
2. Asegúrate de importar correctamente: `import { useStore } from '...'`
3. Verifica que el archivo del store está en `src/stores/`
4. Revisa la consola del navegador para errores específicos

¡Adelante con la migración! 🚀
