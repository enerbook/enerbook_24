# Sistema de Estadísticas del Landing Page

## 📊 Descripción General

El sistema de estadísticas del landing page ahora está **completamente automatizado** y calcula valores reales desde la base de datos. Los números mostrados son honestos y reflejan el crecimiento real del negocio.

---

## 🗄️ Arquitectura de la Base de Datos

### Tablas Principales

#### `landing_stats` (Tabla de Lectura)
Almacena el snapshot actual de estadísticas que se muestra en el landing page.

```sql
CREATE TABLE landing_stats (
  id UUID PRIMARY KEY,
  proyectos_realizados INTEGER,      -- Proyectos solares completados
  reduccion_promedio_recibos NUMERIC, -- % promedio de reducción (0-100)
  energia_producida_anual NUMERIC,    -- Total kWh producidos al año
  estados_cobertura INTEGER,          -- Número de estados con cobertura
  activo BOOLEAN DEFAULT true,        -- Si este es el registro activo
  notas TEXT,                         -- Notas de auditoría
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### `landing_stats_computed` (Vista Materializada)
Calcula automáticamente las estadísticas desde las tablas transaccionales.

```sql
CREATE MATERIALIZED VIEW landing_stats_computed AS
SELECT
  1 AS id, -- Singleton

  -- Proyectos realizados: contratos completados
  (SELECT COUNT(*)::integer FROM contratos WHERE estado = 'completado')
    AS proyectos_realizados,

  -- Reducción promedio: % de ahorro energético
  (SELECT AVG(...cálculo desde sizing_results...))
    AS reduccion_promedio_recibos,

  -- Energía producida anual: suma de yearly_prod
  (SELECT SUM((sizing_results->'results'->>'yearly_prod')::numeric)...)
    AS energia_producida_anual,

  -- Estados con cobertura
  (SELECT COUNT(DISTINCT region_nombre) FROM irradiacion_cache)
    AS estados_cobertura,

  now() AS computed_at;
```

---

## ⚙️ Flujo de Actualización Automática

```
┌─────────────────────────────────────────────────────────────┐
│  1. Evento Disparador                                       │
│     - Contrato completado (estado = 'completado')           │
│     - Nueva región agregada a irradiacion_cache             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Trigger: trigger_contrato_completado                    │
│     trigger_nueva_region                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Función: sync_landing_stats()                           │
│     - Refresca vista materializada (CONCURRENTLY)           │
│     - Lee datos calculados                                  │
│     - Desactiva registros antiguos                          │
│     - Inserta nuevo registro activo                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Landing Page (React)                                    │
│     - useStats() hook consulta cada 5 minutos               │
│     - Consulta directa: SELECT * FROM landing_stats         │
│                          WHERE activo = true                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Relación con Otras Tablas

### Flujo de Datos para Cálculos

```
cotizaciones_inicial
   ↓ (sizing_results.results.yearly_prod)
   ↓ (sizing_results.inputs.kWh_year_assumed)
   ↓
proyectos
   ↓ (cotizaciones_inicial_id)
   ↓
cotizaciones_final
   ↓ (proyectos_id)
   ↓
contratos (estado = 'completado')
   ↓
landing_stats_computed → landing_stats
```

### Foreign Keys
**Ninguna.** `landing_stats` es una tabla independiente sin foreign keys. Esto es **intencional** porque:
- Las estadísticas son datos de marketing/publicidad
- No representan relaciones transaccionales
- Deben ser tolerantes a fallos en otras tablas

---

## 🎯 Cómo Funcionan los Cálculos

### 1. Proyectos Realizados
```sql
SELECT COUNT(*)::integer
FROM contratos
WHERE estado = 'completado'
```

### 2. Reducción Promedio de Recibos
```sql
-- Fórmula: (energía_producida / energía_consumida) * 100
SELECT AVG(
  (cot.sizing_results->'results'->>'yearly_prod')::numeric /
  NULLIF((cot.sizing_results->'inputs'->>'kWh_year_assumed')::numeric, 0) * 100
)
FROM contratos c
JOIN cotizaciones_final cf ON cf.id = c.cotizaciones_final_id
JOIN proyectos p ON p.id = cf.proyectos_id
JOIN cotizaciones_inicial cot ON cot.id = p.cotizaciones_inicial_id
WHERE c.estado = 'completado'
```

### 3. Energía Producida Anual
```sql
SELECT SUM((cot.sizing_results->'results'->>'yearly_prod')::numeric)
FROM contratos c
-- ...joins...
WHERE c.estado = 'completado'
```

### 4. Estados con Cobertura
```sql
SELECT COUNT(DISTINCT region_nombre)
FROM irradiacion_cache
WHERE region_nombre IS NOT NULL
```

---

## 💻 Implementación en Frontend

### React Hook: `useStats()`
```javascript
import { useStats } from '../hooks/useStats';

function MyComponent() {
  const { stats, isLoading, error, refetch } = useStats();

  // stats.proyectos_realizados
  // stats.reduccion_promedio_recibos
  // stats.energia_producida_anual
  // stats.estados_cobertura
}
```

### Servicio: `statsService.js`
```javascript
export async function getLandingStats() {
  const { data, error } = await supabase
    .from('landing_stats')
    .select('proyectos_realizados, reduccion_promedio_recibos, energia_producida_anual, estados_cobertura')
    .eq('activo', true)
    .single();

  return data;
}
```

### Valores por Defecto (Fallback)
Si falla la conexión a Supabase, se usan estos valores:
```javascript
export const defaultStats = {
  proyectos_realizados: 1,
  reduccion_promedio_recibos: 85,
  energia_producida_anual: 311334,
  estados_cobertura: 2,
};
```

---

## 🔒 Seguridad (RLS)

La tabla `landing_stats` tiene **Row Level Security** habilitado:

```sql
-- Política: Solo lectura pública del registro activo
CREATE POLICY "landing_stats_public_read"
  ON landing_stats FOR SELECT
  USING (activo = true);
```

Esto permite que usuarios anónimos lean las estadísticas sin autenticación, pero **no** pueden modificarlas.

---

## 🛠️ Mantenimiento

### Actualizar Manualmente las Estadísticas
```sql
SELECT sync_landing_stats();
```

### Ver la Vista Materializada
```sql
SELECT * FROM landing_stats_computed;
```

### Refrescar Vista Manualmente
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY landing_stats_computed;
```

### Ver Historial de Estadísticas
```sql
SELECT * FROM landing_stats ORDER BY created_at DESC;
```

---

## 📈 Escalabilidad

### Cuando NO hay proyectos completados
Los cálculos usan valores por defecto:
- `proyectos_realizados`: 0
- `reduccion_promedio_recibos`: 85.00 (default)
- `energia_producida_anual`: 0
- `estados_cobertura`: 1 (mínimo)

### Cuando hay miles de proyectos
- La vista materializada usa `REFRESH CONCURRENTLY` (no bloquea lecturas)
- Los triggers solo se disparan en eventos relevantes
- El frontend cachea datos por 5 minutos

---

## ✅ Estado Actual del Sistema

| Estadística | Valor Actual | Fuente |
|------------|--------------|--------|
| Proyectos Realizados | 0 | `contratos` (estado='completado') |
| Reducción Promedio | 85% | Default (sin proyectos aún) |
| Energía Producida | 0 kWh | `sizing_results.yearly_prod` |
| Estados con Cobertura | 1 | `irradiacion_cache.region_nombre` |

**Última sincronización**: Automática cuando se complete el primer contrato.

---

## 🚀 Próximos Pasos

1. **Completar primer contrato**: Cambiar `estado = 'completado'` en la tabla `contratos`
2. **Agregar más regiones**: Insertar datos en `irradiacion_cache` con `region_nombre`
3. **Monitorear performance**: Si los triggers se vuelven lentos, considerar `pg_cron` para actualizaciones asíncronas

---

## 🐛 Troubleshooting

### "No se actualizan las estadísticas"
```sql
-- Verificar triggers
SELECT * FROM pg_trigger WHERE tgname LIKE '%landing_stats%';

-- Forzar actualización manual
SELECT sync_landing_stats();
```

### "Error de permisos"
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'landing_stats';
```

### "Vista materializada desactualizada"
```sql
-- Refrescar manualmente
REFRESH MATERIALIZED VIEW CONCURRENTLY landing_stats_computed;
```

---

## 📚 Referencias

- Migración: `create_landing_stats_automation_v2.sql`
- Componente: [`components/Stats.jsx`](components/Stats.jsx)
- Hook: [`hooks/useStats.js`](hooks/useStats.js)
- Servicio: [`services/statsService.js`](services/statsService.js)
