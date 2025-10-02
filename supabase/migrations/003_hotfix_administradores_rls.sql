-- ============================================================================
-- HOTFIX: Habilitar RLS en administradores sin romper queries existentes
-- Fecha: 2025-10-02
-- Objetivo: Permitir queries actuales mientras se implementa seguridad completa
-- ============================================================================

-- Solo habilitar RLS si no está habilitado
DO $$
BEGIN
    -- Verificar si RLS ya está habilitado
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'administradores'
        AND rowsecurity = true
    ) THEN
        -- Habilitar RLS
        ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;

        RAISE NOTICE 'RLS habilitado en tabla administradores';
    ELSE
        RAISE NOTICE 'RLS ya está habilitado en tabla administradores';
    END IF;
END $$;

-- ============================================================================
-- Política temporal permisiva para no romper queries actuales
-- Esta es una política TEMPORAL que será reemplazada por 002_fix_admin_rls_policies.sql
-- ============================================================================

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "temp_admins_can_read" ON administradores;

-- Política temporal: permitir lectura a usuarios autenticados
-- IMPORTANTE: Esta política es permisiva por diseño para no romper la app
-- Debe ser reemplazada por las políticas más restrictivas de migration 002
CREATE POLICY "temp_admins_can_read" ON administradores
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
--
-- Esta es una migración de HOTFIX temporal.
--
-- ANTES de aplicar migration 002 (fix_admin_rls_policies.sql):
-- 1. Crear al menos un usuario super_admin:
--
--    INSERT INTO administradores (usuario_id, nivel_acceso, activo)
--    VALUES ('tu-user-id-aqui', 'super_admin', true);
--
-- 2. Verificar que el usuario puede hacer login
--
-- 3. Entonces aplicar migration 002 que tiene políticas más restrictivas
--
-- ORDEN DE APLICACIÓN:
-- ✅ 001_fix_leads_temp_rls_security.sql (ya aplicada)
-- ✅ 003_hotfix_administradores_rls.sql (esta migración - PRIMERO)
-- ⏳ 002_fix_admin_rls_policies.sql (aplicar DESPUÉS de crear super_admin)
--
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Hotfix aplicado: RLS habilitado en administradores';
    RAISE NOTICE '⚠️  ACCIÓN REQUERIDA ANTES DE MIGRATION 002:';
    RAISE NOTICE '   1. Crear super_admin con: INSERT INTO administradores...';
    RAISE NOTICE '   2. Verificar login funciona';
    RAISE NOTICE '   3. Aplicar migration 002 para seguridad completa';
END $$;
