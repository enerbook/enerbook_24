-- ============================================================================
-- 🚨 QUICK FIX para Error 500 en Admin Panel
-- Copia y pega este archivo COMPLETO en Supabase SQL Editor
-- ============================================================================

-- PASO 1: Habilitar RLS sin romper queries
-- ============================================================================
DO $$
BEGIN
    ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS habilitado en administradores';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'RLS ya estaba habilitado';
END $$;

-- PASO 2: Crear política temporal permisiva
-- ============================================================================
DO $$
BEGIN
    DROP POLICY IF EXISTS "temp_admins_can_read" ON administradores;

    CREATE POLICY "temp_admins_can_read" ON administradores
        FOR SELECT
        USING (auth.role() = 'authenticated');

    RAISE NOTICE '✅ Política temporal creada';
END $$;

-- PASO 3: Mostrar tus usuarios disponibles
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '📋 Usuarios disponibles en auth.users (ve la tabla de abajo):';
END $$;

SELECT
    id as user_id,
    email,
    created_at,
    '👆 Copia uno de estos UUIDs' as accion
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- PASO 4: EDITAR Y EJECUTAR ESTE INSERT
-- ============================================================================
--
-- ⚠️ INSTRUCCIONES:
-- 1. Copia el UUID de arriba (columna user_id)
-- 2. Reemplaza 'PEGAR_TU_UUID_AQUI' en la siguiente línea
-- 3. Descomenta (quita los --) las 3 líneas del INSERT
-- 4. Ejecuta de nuevo este archivo completo
--
-- Ejemplo: 'ee234787-55e6-438f-9ffa-62ecbf4ed052'
--
-- INSERT INTO administradores (usuario_id, nivel_acceso, activo)
-- VALUES ('PEGAR_TU_UUID_AQUI', 'super_admin', true)
-- ON CONFLICT (usuario_id) DO UPDATE SET nivel_acceso = 'super_admin', activo = true;

-- ============================================================================
-- PASO 5: Verificación
-- ============================================================================
-- Después de ejecutar el INSERT, verifica:

SELECT
    a.id as admin_id,
    a.usuario_id,
    u.correo_electronico,
    a.nivel_acceso,
    a.activo,
    CASE
        WHEN a.activo = true THEN '✅ Activo'
        ELSE '❌ Inactivo'
    END as estado
FROM administradores a
LEFT JOIN usuarios u ON u.id = a.usuario_id
ORDER BY a.created_at DESC;

-- ============================================================================
-- ✅ RESULTADO ESPERADO
-- ============================================================================
--
-- Después de ejecutar correctamente:
-- 1. Verás tu usuario en la tabla de arriba con estado "✅ Activo"
-- 2. El error 500 en admin panel desaparecerá
-- 3. Podrás acceder a /admin-panel sin problemas
--
-- Si algo sale mal:
-- - Verifica que el UUID esté correcto (sin espacios, guiones incluidos)
-- - Verifica que existe en auth.users
-- - Consulta MIGRATION_GUIDE.md para troubleshooting
--
-- ============================================================================
