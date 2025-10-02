# 🔒 Guía de Migraciones de Seguridad

## ⚠️ ERROR ACTUAL

Si ves este error:
```
GET .../administradores?select=id,activo&usuario_id=eq....&activo=eq.true 500 (Internal Server Error)
```

**Causa:** La tabla `administradores` tiene RLS habilitado pero faltan las políticas.

---

## 📋 Orden Correcto de Aplicación

### 1️⃣ Primera Migración (Ya Aplicada ✅)
```sql
-- 001_fix_leads_temp_rls_security.sql
-- ✅ Ya aplicada - arregla seguridad de leads temporales
```

### 2️⃣ Hotfix Administradores (APLICAR AHORA 🔥)
```sql
-- 003_hotfix_administradores_rls.sql
-- Objetivo: Habilitar RLS sin romper queries actuales
```

**Cómo aplicar:**

**Opción A: Supabase Dashboard (Recomendado)**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/qkdvosjitrkopnarbozv/editor)
2. Clic en "SQL Editor"
3. Copia y pega el contenido de `003_hotfix_administradores_rls.sql`
4. Ejecuta (Run)

**Opción B: Supabase CLI**
```bash
cd supabase
supabase db push
```

### 3️⃣ Crear Super Admin (DESPUÉS DE 003 🔥)
```sql
-- 004_create_first_super_admin.sql
-- Objetivo: Crear tu primer usuario administrador
```

**Pasos:**

1. **Obtén tu User ID:**
   ```sql
   -- Ejecuta en SQL Editor:
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```

2. **Edita la migración 004:**
   - Abre `004_create_first_super_admin.sql`
   - Busca `'TU_USER_ID_AQUI'`
   - Reemplaza con tu UUID real
   - Descomenta el bloque INSERT

3. **Ejecuta la migración:**
   ```sql
   -- Copia el INSERT editado y ejecútalo en SQL Editor
   INSERT INTO administradores (usuario_id, nivel_acceso, activo)
   VALUES ('ee234787-55e6-438f-9ffa-62ecbf4ed052', 'super_admin', true)
   RETURNING id, usuario_id, nivel_acceso;
   ```

### 4️⃣ Seguridad Completa (DESPUÉS DE 004 ⏳)
```sql
-- 002_fix_admin_rls_policies.sql
-- Objetivo: Implementar políticas RLS restrictivas
-- ⚠️ NO ejecutar antes de tener un super_admin
```

**Aplicar solo después de:**
- ✅ Migration 003 aplicada
- ✅ Super admin creado
- ✅ Login funciona correctamente

---

## 🚀 Pasos Rápidos (TL;DR)

```bash
# 1. Aplicar hotfix
# Copia 003_hotfix_administradores_rls.sql en SQL Editor y ejecuta

# 2. Obtener tu user_id
SELECT id, email FROM auth.users WHERE email = 'tu-email@example.com';
# Copia el UUID que aparece

# 3. Crear super admin
INSERT INTO administradores (usuario_id, nivel_acceso, activo)
VALUES ('TU_UUID_AQUI', 'super_admin', true);

# 4. Verificar
SELECT * FROM administradores WHERE activo = true;

# 5. Refrescar la app
# El error 500 debería desaparecer

# 6. (Opcional) Aplicar 002 para seguridad completa
# Copia 002_fix_admin_rls_policies.sql en SQL Editor y ejecuta
```

---

## 🔍 Verificación

### Después de Migration 003:
```sql
-- Debe retornar rows sin error 500
SELECT id, activo FROM administradores WHERE activo = true;
```

### Después de crear super_admin:
```sql
-- Debe mostrar tu usuario
SELECT
    a.usuario_id,
    u.correo_electronico,
    a.nivel_acceso,
    a.activo
FROM administradores a
JOIN usuarios u ON u.id = a.usuario_id
WHERE a.activo = true;
```

### Después de Migration 002:
```sql
-- Solo tu usuario admin debería poder ver esto
SELECT COUNT(*) FROM comisiones_enerbook;
-- Si no eres admin, debe dar error de permisos (correcto)
```

---

## ❓ Troubleshooting

### Error: "duplicate key value violates unique constraint"
**Causa:** Ya existe un admin con ese usuario_id

**Solución:**
```sql
-- Actualizar el existente en vez de insertar
UPDATE administradores
SET nivel_acceso = 'super_admin', activo = true
WHERE usuario_id = 'TU_UUID';
```

### Error: "relation 'administradores' does not exist"
**Causa:** La tabla no existe en tu base de datos

**Solución:**
```sql
-- Ejecutar el schema completo primero
-- Archivo: .estructura_lógica/schema/schema_v1.sql
```

### Error: "infinite recursion detected in policy"
**Causa:** Políticas RLS mal configuradas

**Solución:**
```sql
-- Deshabilitar RLS temporalmente
ALTER TABLE administradores DISABLE ROW LEVEL SECURITY;
-- Verificar queries
-- Rehabilitar con migration 003
```

### El admin panel sigue dando 500
**Solución:**
1. Verifica que migration 003 se aplicó:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE tablename = 'administradores';
   -- rowsecurity debe ser 't' (true)
   ```

2. Verifica que existe el admin:
   ```sql
   SELECT COUNT(*) FROM administradores WHERE activo = true;
   -- Debe ser > 0
   ```

3. Limpia caché del navegador y recarga

---

## 📞 Soporte

Si sigues teniendo problemas:
1. Comparte el error exacto
2. Comparte resultado de:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'administradores';
   SELECT COUNT(*) FROM administradores WHERE activo = true;
   ```
3. Verifica los logs de Supabase Dashboard > Logs

---

**Última actualización:** 2025-10-02
**Versión:** 1.0
