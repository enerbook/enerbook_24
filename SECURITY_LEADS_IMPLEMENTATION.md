# 🔒 Implementación de Seguridad para Leads Temporales

## Problema Actual

Los datos de leads temporales (`cotizaciones_leads_temp`) están expuestos públicamente debido a RLS policies permisivas:

```sql
-- ❌ INSEGURO (Actual)
CREATE POLICY "Temp quotes are publicly readable" ON cotizaciones_leads_temp
    FOR SELECT USING (true);
```

**Impacto:**
- Cualquiera puede leer TODOS los leads temporales
- Datos sensibles del recibo CFE expuestos (nombre, dirección, consumo, GPS)
- Enumeración de `temp_lead_id` para acceder a datos de otros usuarios

---

## Solución Implementada (Fase 1)

### ✅ Migración SQL Aplicada

Archivo: [`supabase/migrations/001_fix_leads_temp_rls_security.sql`](supabase/migrations/001_fix_leads_temp_rls_security.sql)

**Cambios:**
1. ✅ Eliminar política pública de lectura
2. ✅ Restringir lectura a leads de menos de 7 días
3. ✅ Validar formato de `temp_lead_id` en inserciones
4. ✅ Crear índice para prevenir enumeración
5. ✅ Función de limpieza automática de leads antiguos

### 📋 Cómo Aplicar la Migración

```bash
# Opción A: Usando Supabase CLI
supabase db push

# Opción B: Desde el Dashboard de Supabase
# 1. Ve a: https://supabase.com/dashboard/project/qkdvosjitrkopnarbozv/editor
# 2. SQL Editor > New Query
# 3. Copia y pega el contenido de 001_fix_leads_temp_rls_security.sql
# 4. Ejecuta
```

---

## Solución Completa (Fase 2) - PENDIENTE

La migración SQL es solo el primer paso. Para seguridad completa, implementar:

### Opción A: Validación con Sesión Anónima (Recomendado)

#### 1. Modificar tabla para trackear sesión

```sql
-- Agregar columna para trackear quién creó el lead
ALTER TABLE cotizaciones_leads_temp
ADD COLUMN created_by_session UUID REFERENCES auth.users(id);

-- Actualizar política de SELECT
DROP POLICY "Users can view own temp quotes" ON cotizaciones_leads_temp;

CREATE POLICY "Users can view own temp quotes" ON cotizaciones_leads_temp
    FOR SELECT
    USING (
        created_at > NOW() - INTERVAL '7 days'
        AND created_by_session = auth.uid()
    );
```

#### 2. Modificar `leadService.js` para guardar sesión

```javascript
// src/lead/services/leadService.js
export const leadService = {
  createLeadData: async (leadData) => {
    // Obtener sesión actual
    const { data: { user } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('cotizaciones_leads_temp')
      .insert([{
        ...leadData,
        created_by_session: user?.id  // Trackear sesión anónima
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
```

#### 3. Modificar flujo de leads anónimos

```javascript
// src/context/AuthContext.jsx
const setLeadMode = useCallback(async (newTempLeadId) => {
  // ... código actual ...

  // ✅ Verificar que el lead pertenece a la sesión actual
  const { data: { user } } = await supabase.auth.getSession();

  if (!user) {
    // Si no hay sesión anónima, crear una
    await supabase.auth.signInAnonymously();
  }

  // Ahora RLS verificará automáticamente que user.id === created_by_session
  const data = await fetchLeadData(newTempLeadId);

  // ... resto del código ...
}, []);
```

---

### Opción B: Tokens JWT Temporales (Más complejo, más seguro)

#### 1. Crear Supabase Edge Function

```typescript
// supabase/functions/create-temp-lead-token/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { temp_lead_id } = await req.json()

  // Generar token temporal (válido por 1 hora)
  const token = await generateSecureToken(temp_lead_id, 3600)

  return new Response(
    JSON.stringify({ token, expires_in: 3600 }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

#### 2. Modificar frontend para usar tokens

```javascript
// Al crear un lead
const createLead = async (leadData) => {
  // 1. Crear lead en DB
  const lead = await leadService.createLeadData(leadData);

  // 2. Obtener token temporal
  const { data: { token } } = await supabase.functions.invoke('create-temp-lead-token', {
    body: { temp_lead_id: lead.temp_lead_id }
  });

  // 3. Guardar token en sessionStorage
  sessionStorage.setItem(`lead_token_${lead.temp_lead_id}`, token);

  return lead;
};

// Al acceder a lead dashboard
const fetchLeadData = async (tempLeadId) => {
  const token = sessionStorage.getItem(`lead_token_${tempLeadId}`);

  if (!token) {
    throw new Error('Token de acceso no válido o expirado');
  }

  // Token se valida automáticamente en la Edge Function via RLS
  const { data } = await supabase
    .from('cotizaciones_leads_temp')
    .select('*')
    .eq('temp_lead_id', tempLeadId)
    .single();

  return data;
};
```

---

### Opción C: Hash Secreto (Más simple, menos seguro)

#### 1. Generar temp_lead_id con hash

```javascript
// utils/security.js
import crypto from 'crypto';

export const generateSecureTempLeadId = () => {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  const secret = process.env.TEMP_LEAD_SECRET; // Variable de entorno secreta

  // Hash: UUID + timestamp + secret
  const hash = crypto
    .createHash('sha256')
    .update(`${uuid}-${timestamp}-${secret}`)
    .digest('hex');

  // Formato final: uuid-hash_truncado
  return `${uuid}-${hash.substring(0, 16)}`;
};

export const validateTempLeadId = (tempLeadId) => {
  // Validar formato: uuid-hash
  const parts = tempLeadId.split('-');
  if (parts.length !== 6) return false; // UUID tiene 5 partes + hash

  const hash = parts[5];
  return hash.length === 16 && /^[a-f0-9]+$/.test(hash);
};
```

#### 2. Usar en creación de leads

```javascript
// src/lead/services/leadService.js
import { generateSecureTempLeadId } from '../../utils/security';

export const leadService = {
  createLeadData: async (leadData) => {
    const secureTempLeadId = generateSecureTempLeadId();

    const { data, error } = await supabase
      .from('cotizaciones_leads_temp')
      .insert([{
        ...leadData,
        temp_lead_id: secureTempLeadId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
```

---

## Comparación de Opciones

| Característica | Opción A (Sesión) | Opción B (JWT) | Opción C (Hash) |
|----------------|-------------------|----------------|-----------------|
| **Seguridad** | ⭐⭐⭐⭐ Alta | ⭐⭐⭐⭐⭐ Muy Alta | ⭐⭐⭐ Media |
| **Complejidad** | 🟢 Baja | 🔴 Alta | 🟡 Media |
| **Cambios requeridos** | Frontend + DB | Frontend + Backend + DB | Frontend + Utils |
| **Rendimiento** | ⚡ Rápido | ⚡ Rápido | ⚡ Muy rápido |
| **Mantenimiento** | 🟢 Fácil | 🔴 Complejo | 🟡 Moderado |
| **Recomendado para** | MVP/Producción | Enterprise | Prototipo |

---

## Recomendación

**Para Enerbook v25: Implementar Opción A (Sesión Anónima)**

**Razones:**
1. ✅ Seguridad robusta sin complejidad excesiva
2. ✅ Usa características nativas de Supabase
3. ✅ RLS hace el trabajo pesado automáticamente
4. ✅ Fácil de auditar y mantener
5. ✅ No requiere infraestructura adicional

---

## Plan de Implementación

### Fase 1: ✅ COMPLETADA
- [x] Aplicar migración SQL
- [x] Documentar problema y soluciones

### Fase 2: 🔄 EN PROGRESO
- [ ] Agregar columna `created_by_session` a tabla
- [ ] Modificar `leadService.createLeadData()`
- [ ] Implementar `supabase.auth.signInAnonymously()` en AuthContext
- [ ] Actualizar RLS policy para verificar sesión
- [ ] Testing completo del flujo de leads

### Fase 3: 📋 PENDIENTE
- [ ] Implementar limpieza automática con pg_cron
- [ ] Agregar logging de accesos sospechosos
- [ ] Configurar alertas de seguridad
- [ ] Documentación de usuario final

---

## Testing de Seguridad

### Test 1: Verificar que no se puede enumerar leads

```javascript
// Intentar acceder a lead de otro usuario
const { data, error } = await supabase
  .from('cotizaciones_leads_temp')
  .select('*')
  .eq('temp_lead_id', 'otro-usuario-uuid');

// Esperado: error = "Row level security policy violation"
console.assert(error !== null, '❌ Enumeración aún es posible');
```

### Test 2: Verificar expiración de 7 días

```sql
-- Crear lead antiguo (backdated)
INSERT INTO cotizaciones_leads_temp (temp_lead_id, created_at)
VALUES ('test-uuid', NOW() - INTERVAL '8 days');

-- Intentar leer
SELECT * FROM cotizaciones_leads_temp WHERE temp_lead_id = 'test-uuid';
-- Esperado: 0 rows (policy lo bloquea)
```

### Test 3: Verificar sesión anónima

```javascript
// Crear lead sin sesión
await supabase.auth.signOut();
const result = await leadService.createLeadData({ /* ... */ });

// Esperado: error o created_by_session = null
console.assert(result.created_by_session === null, '❌ Sesión no capturada');
```

---

## Monitoreo Post-Implementación

### Queries útiles para detectar problemas

```sql
-- 1. Ver leads sin sesión asociada (vulnerables)
SELECT COUNT(*) as leads_sin_sesion
FROM cotizaciones_leads_temp
WHERE created_by_session IS NULL
  AND created_at > NOW() - INTERVAL '7 days';

-- 2. Detectar patrones de enumeración
SELECT
  date_trunc('hour', created_at) as hora,
  COUNT(*) as intentos_acceso
FROM cotizaciones_leads_temp
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hora
HAVING COUNT(*) > 100  -- Threshold de sospecha
ORDER BY hora DESC;

-- 3. Auditar leads antiguos no limpiados
SELECT COUNT(*) as leads_expirados
FROM cotizaciones_leads_temp
WHERE created_at < NOW() - INTERVAL '7 days';
```

---

## Contacto

Para preguntas sobre esta implementación:
- **Desarrollador principal:** [Tu equipo]
- **Seguridad:** [Equipo de seguridad]
- **Supabase Support:** support@supabase.com

---

**Última actualización:** 2025-10-02
**Versión del documento:** 1.0
**Estado:** Fase 1 completada, Fase 2 pendiente
