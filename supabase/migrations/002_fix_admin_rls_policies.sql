-- ============================================================================
-- MIGRATION: Fix RLS Policies for Admin Tables (Security Critical)
-- Fecha: 2025-10-02
-- Objetivo: Restringir acceso a tablas administrativas solo a admins verificados
-- ============================================================================

-- ============================================================================
-- 1. COMISIONES ENERBOOK - Solo admins pueden ver
-- ============================================================================

DROP POLICY IF EXISTS "Admin can view commissions" ON comisiones_enerbook;

CREATE POLICY "Only verified admins can view commissions" ON comisiones_enerbook
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM administradores
            WHERE administradores.usuario_id = auth.uid()
              AND administradores.activo = true
        )
    );

-- Solo admins pueden insertar comisiones
CREATE POLICY "Only verified admins can insert commissions" ON comisiones_enerbook
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM administradores
            WHERE administradores.usuario_id = auth.uid()
              AND administradores.activo = true
        )
    );

-- Solo admins pueden actualizar comisiones
CREATE POLICY "Only verified admins can update commissions" ON comisiones_enerbook
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM administradores
            WHERE administradores.usuario_id = auth.uid()
              AND administradores.activo = true
        )
    );

-- ============================================================================
-- 2. STRIPE WEBHOOKS LOG - Solo admins pueden ver
-- ============================================================================

DROP POLICY IF EXISTS "Admin can view webhooks" ON stripe_webhooks_log;

CREATE POLICY "Only verified admins can view webhooks" ON stripe_webhooks_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM administradores
            WHERE administradores.usuario_id = auth.uid()
              AND administradores.activo = true
        )
    );

-- ============================================================================
-- 3. STRIPE DISPUTES - Solo admins pueden ver
-- ============================================================================

DROP POLICY IF EXISTS "Admin can view disputes" ON stripe_disputes;

CREATE POLICY "Only verified admins can view disputes" ON stripe_disputes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM administradores
            WHERE administradores.usuario_id = auth.uid()
              AND administradores.activo = true
        )
    );

-- ============================================================================
-- 4. ADMINISTRADORES - Control de acceso granular
-- ============================================================================

-- Habilitar RLS en tabla administradores (estaba deshabilitado)
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;

-- Solo super_admins pueden ver todos los administradores
CREATE POLICY "Super admins can view all admins" ON administradores
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM administradores a
            WHERE a.usuario_id = auth.uid()
              AND a.activo = true
              AND a.nivel_acceso = 'super_admin'
        )
    );

-- Los admins normales solo pueden ver su propio perfil
CREATE POLICY "Admins can view own profile" ON administradores
    FOR SELECT
    USING (
        usuario_id = auth.uid()
        AND activo = true
    );

-- Solo super_admins pueden crear nuevos administradores
CREATE POLICY "Only super admins can create admins" ON administradores
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM administradores a
            WHERE a.usuario_id = auth.uid()
              AND a.activo = true
              AND a.nivel_acceso = 'super_admin'
        )
    );

-- Solo super_admins pueden actualizar administradores
CREATE POLICY "Only super admins can update admins" ON administradores
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM administradores a
            WHERE a.usuario_id = auth.uid()
              AND a.activo = true
              AND a.nivel_acceso = 'super_admin'
        )
    );

-- Solo super_admins pueden desactivar administradores
CREATE POLICY "Only super admins can delete admins" ON administradores
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM administradores a
            WHERE a.usuario_id = auth.uid()
              AND a.activo = true
              AND a.nivel_acceso = 'super_admin'
        )
        -- Prevenir que un super_admin se elimine a sí mismo
        AND usuario_id != auth.uid()
    );

-- ============================================================================
-- 5. PROVEEDORES - Mejorar políticas existentes
-- ============================================================================

-- Actualizar política de UPDATE para ser más restrictiva
DROP POLICY IF EXISTS "Providers can update own data" ON proveedores;

CREATE POLICY "Providers can update own data" ON proveedores
    FOR UPDATE
    USING (
        auth.uid() = auth_user_id
        AND activo = true
    )
    WITH CHECK (
        auth.uid() = auth_user_id
        -- Prevenir que un proveedor se active/desactive a sí mismo
        AND (
            activo = (SELECT activo FROM proveedores WHERE id = proveedores.id)
            OR EXISTS (
                SELECT 1 FROM administradores
                WHERE usuario_id = auth.uid() AND activo = true
            )
        )
    );

-- Solo admins pueden desactivar proveedores
CREATE POLICY "Only admins can deactivate providers" ON proveedores
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM administradores
            WHERE usuario_id = auth.uid()
              AND activo = true
        )
    )
    WITH CHECK (true);

-- ============================================================================
-- 6. ÍNDICES PARA PERFORMANCE DE RLS
-- ============================================================================

-- Índice para mejorar verificación de admin en RLS policies
CREATE INDEX IF NOT EXISTS idx_administradores_usuario_activo
ON administradores(usuario_id, activo)
WHERE activo = true;

-- Índice para verificación rápida de super_admin
CREATE INDEX IF NOT EXISTS idx_administradores_super_admin
ON administradores(usuario_id, nivel_acceso)
WHERE activo = true AND nivel_acceso = 'super_admin';

-- ============================================================================
-- 7. FUNCIÓN HELPER PARA VERIFICAR PERMISOS
-- ============================================================================

-- Función para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM administradores
        WHERE usuario_id = auth.uid()
          AND activo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario actual es super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM administradores
        WHERE usuario_id = auth.uid()
          AND activo = true
          AND nivel_acceso = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. AUDITORÍA - Tabla de logs para acciones administrativas
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at          timestamp with time zone DEFAULT now() NOT NULL,
    admin_id            uuid REFERENCES administradores(usuario_id) NOT NULL,
    action_type         text NOT NULL CHECK (action_type IN (
        'create_admin',
        'update_admin',
        'deactivate_admin',
        'view_sensitive_data',
        'modify_commission',
        'deactivate_provider',
        'view_disputes'
    )),
    target_table        text NOT NULL,
    target_id           uuid,
    action_details      jsonb,
    ip_address          inet,
    user_agent          text
);

-- RLS para audit log (solo admins pueden ver sus propios logs, super_admins ven todo)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view own audit logs" ON admin_audit_log
    FOR SELECT
    USING (
        admin_id = auth.uid()
        OR is_super_admin()
    );

-- Solo el sistema puede insertar logs (via trigger o función backend)
-- No permitir INSERT/UPDATE/DELETE manual

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_date
ON admin_audit_log(admin_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_action_type
ON admin_audit_log(action_type, created_at DESC);

-- ============================================================================
-- VERIFICACIÓN Y NOTIFICACIONES
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 002 completed: Admin RLS policies secured';
    RAISE NOTICE '📊 Policies created for:';
    RAISE NOTICE '   - comisiones_enerbook (SELECT/INSERT/UPDATE)';
    RAISE NOTICE '   - stripe_webhooks_log (SELECT)';
    RAISE NOTICE '   - stripe_disputes (SELECT)';
    RAISE NOTICE '   - administradores (SELECT/INSERT/UPDATE/DELETE)';
    RAISE NOTICE '   - proveedores (UPDATE mejorado)';
    RAISE NOTICE '🔐 Helper functions created: is_admin(), is_super_admin()';
    RAISE NOTICE '📋 Audit log table created: admin_audit_log';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ACCIÓN REQUERIDA:';
    RAISE NOTICE '   1. Crear al menos un super_admin en la tabla administradores';
    RAISE NOTICE '   2. Verificar que el super_admin puede acceder a comisiones';
    RAISE NOTICE '   3. Implementar logging de auditoría en backend';
END $$;

-- ============================================================================
-- NOTAS DE SEGURIDAD:
-- ============================================================================
--
-- IMPORTANTE: Después de aplicar esta migración:
--
-- 1. Crear primer super_admin:
--    INSERT INTO administradores (usuario_id, nivel_acceso, activo)
--    VALUES ('tu-user-id-uuid', 'super_admin', true);
--
-- 2. Verificar acceso:
--    SELECT * FROM comisiones_enerbook; -- Debe funcionar solo para admins
--
-- 3. Implementar logging en backend para acciones sensibles
--
-- 4. Configurar alertas para:
--    - Creación de nuevos administradores
--    - Intentos de acceso denegados
--    - Modificaciones de comisiones
-- ============================================================================
