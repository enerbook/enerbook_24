# Sistema de Estadísticas Dinámicas del Landing

## Descripción

Se ha implementado un sistema completo para mostrar estadísticas dinámicas en el landing page de Enerbook, conectadas directamente a la base de datos de Supabase.

## Archivos Creados

### 1. Migración SQL
**Ubicación**: `/supabase/migrations/005_create_landing_stats.sql`

- Crea tabla `landing_stats` con columnas:
  - `proyectos_realizados`: Total de proyectos solares completados
  - `reduccion_promedio_recibos`: Porcentaje promedio de reducción en recibos (0-100)
  - `energia_producida_anual`: Total de energía producida anualmente en kWh
  - `estados_cobertura`: Número de estados con cobertura

- Funciones SQL creadas:
  - `get_active_landing_stats()`: Obtiene las estadísticas activas para mostrar
  - `calculate_landing_stats()`: Calcula estadísticas reales desde tablas de proyectos

- Row Level Security (RLS):
  - Lectura pública (cualquiera puede ver)
  - Escritura solo para administradores

### 2. Servicio de Estadísticas
**Ubicación**: `/src/landing/services/statsService.js`

Funciones principales:
- `getLandingStats()`: Obtiene estadísticas desde Supabase
- `getCalculatedStats()`: Obtiene estadísticas calculadas automáticamente
- `formatEnergy(kwh)`: Formatea números de energía (ej: "311,334 kWh")
- `formatPercent(percent)`: Formatea porcentajes
- `defaultStats`: Valores por defecto como fallback

### 3. Hook Personalizado
**Ubicación**: `/src/landing/hooks/useStats.js`

Hook `useStats()` que:
- Obtiene datos desde Supabase al montar el componente
- Actualiza automáticamente cada 5 minutos
- Usa valores por defecto como fallback si falla la conexión
- Retorna: `{ stats, isLoading, error, refetch }`

### 4. Componente Stats Actualizado
**Ubicación**: `/src/landing/components/Stats.jsx`

Cambios realizados:
- Importa `useStats` hook y `formatEnergy` utility
- Elimina valores hardcodeados
- Muestra "..." mientras carga
- Renderiza estadísticas dinámicas desde la DB

## Cómo Usar

### 1. Ejecutar la Migración SQL

```bash
# Opción A: Copiar y pegar en Supabase Dashboard
# Ve a: https://supabase.com/dashboard/project/[tu-proyecto]/sql
# Copia el contenido de: supabase/migrations/005_create_landing_stats.sql
# Pega y ejecuta

# Opción B: Usar CLI de Supabase (si está configurado)
supabase migration up
```

### 2. Verificar Datos Iniciales

La migración inserta automáticamente un registro inicial:
- Proyectos: 1+
- Reducción: 85%
- Energía: 311,334 kWh
- Estados: 2+

### 3. Actualizar Estadísticas

Puedes actualizar las estadísticas de dos formas:

**Opción A: Manualmente desde Supabase Dashboard**

```sql
UPDATE public.landing_stats
SET
  proyectos_realizados = 50,
  reduccion_promedio_recibos = 88.5,
  energia_producida_anual = 1500000,
  estados_cobertura = 10,
  updated_at = NOW()
WHERE activo = true;
```

**Opción B: Usar función de cálculo automático**

```sql
-- Ver estadísticas calculadas desde tablas reales
SELECT * FROM public.calculate_landing_stats();
```

### 4. Probar en Desarrollo

```bash
cd /Users/diegocarranza/Desktop/enerbook_24
npm run web
```

Navega a `http://localhost:8081` y verifica la sección de estadísticas.

## Flujo de Datos

```
Supabase DB (landing_stats)
    ↓
statsService.getLandingStats()
    ↓
useStats() hook
    ↓
Stats.jsx componente
    ↓
Renderiza en landing page
```

## Actualización Automática

- **Intervalo**: Cada 5 minutos
- **Fallback**: Si falla la conexión, usa valores por defecto
- **Cache**: No hay cache adicional, se consulta directo a Supabase

## Administración

### Ver Estadísticas Actuales

```sql
SELECT * FROM public.landing_stats WHERE activo = true;
```

### Agregar Nuevo Registro de Estadísticas

```sql
-- Desactivar el registro actual
UPDATE public.landing_stats SET activo = false WHERE activo = true;

-- Insertar nuevo registro
INSERT INTO public.landing_stats (
  proyectos_realizados,
  reduccion_promedio_recibos,
  energia_producida_anual,
  estados_cobertura,
  activo,
  notas
) VALUES (
  100,
  90.0,
  5000000.00,
  15,
  true,
  'Actualización Q1 2025'
);
```

### Calcular Estadísticas Reales

```sql
-- Obtener estadísticas calculadas automáticamente
SELECT * FROM public.calculate_landing_stats();

-- Nota: Esta función calcula:
-- - proyectos_completados: COUNT de proyectos con estado = 'completado'
-- - energia_total_kwh: SUM de energia_anual_estimada de cotizaciones_inicial
-- - estados_activos: Valor simulado (mejorarlo con ubicaciones reales)
```

## Seguridad

- **RLS habilitado**: Solo lectura pública, escritura para admins
- **Función SECURITY DEFINER**: Las funciones SQL corren con privilegios del creador
- **Validación de datos**: Constraints en la tabla previenen datos inválidos

## Próximos Pasos (Opcional)

1. **Agregar más métricas**:
   - Número de instaladores verificados
   - Clientes satisfechos
   - CO2 reducido

2. **Dashboard de administrador**:
   - Interfaz para actualizar estadísticas sin SQL
   - Vista previa antes de publicar

3. **Estadísticas calculadas en tiempo real**:
   - Trigger que actualiza automáticamente al completar proyectos
   - Cron job para actualización periódica

4. **Cache inteligente**:
   - Redis o similar para reducir consultas a DB
   - Invalidación automática al actualizar datos

## Troubleshooting

### Error: "Function get_active_landing_stats does not exist"
**Solución**: Ejecuta la migración SQL en Supabase

### Error: "No stats data returned, using defaults"
**Solución**: Verifica que existe al menos un registro con `activo = true`

```sql
SELECT * FROM public.landing_stats WHERE activo = true;
```

### Estadísticas no se actualizan
**Solución**: Verifica el intervalo del hook (5 min) o fuerza refresh del navegador

## Contacto

Para dudas o mejoras, contactar al equipo de desarrollo de Enerbook.
