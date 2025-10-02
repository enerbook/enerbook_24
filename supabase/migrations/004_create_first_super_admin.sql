-- ============================================================================
-- SCRIPT: Crear primer super_admin
-- Fecha: 2025-10-02
-- Ejecutar SOLO UNA VEZ después de migration 003
-- ============================================================================

-- ⚠️ IMPORTANTE: Reemplaza 'TU_USER_ID_AQUI' con el ID real del usuario
--
-- Para obtener tu user_id:
-- 1. Haz login en tu app
-- 2. Ve a Supabase Dashboard > Authentication > Users
-- 3. Copia el UUID del usuario que quieres hacer admin
--
-- O ejecuta esta query:
-- SELECT id, email FROM auth.users WHERE email = 'tu-email@example.com';

-- Verificar si ya existe un super_admin
DO $$
DECLARE
    admin_count integer;
BEGIN
    SELECT COUNT(*) INTO admin_count
    FROM administradores
    WHERE nivel_acceso = 'super_admin' AND activo = true;

    IF admin_count > 0 THEN
        RAISE NOTICE 'Ya existe al menos un super_admin activo. No se creará otro.';
        RAISE NOTICE 'Total super_admins activos: %', admin_count;
    ELSE
        RAISE NOTICE 'No se encontró ningún super_admin.';
        RAISE NOTICE 'Por favor ejecuta el INSERT manual con tu user_id.';
    END IF;
END $$;

-- ============================================================================
-- OPCIÓN 1: Crear admin desde usuario existente (RECOMENDADO)
-- ============================================================================

-- Descomenta y edita la siguiente línea con tu user_id real:

/*
INSERT INTO administradores (usuario_id, nivel_acceso, permisos, activo, created_at)
VALUES (
    'TU_USER_ID_AQUI',  -- ⚠️ Reemplazar con UUID real
    'super_admin',
    '{
        "manage_users": true,
        "manage_admins": true,
        "manage_providers": true,
        "view_commissions": true,
        "manage_commissions": true,
        "view_disputes": true,
        "view_webhooks": true
    }'::jsonb,
    true,
    NOW()
)
ON CONFLICT (usuario_id)
DO UPDATE SET
    nivel_acceso = 'super_admin',
    activo = true,
    updated_at = NOW()
RETURNING id, usuario_id, nivel_acceso, activo;
*/

-- ============================================================================
-- OPCIÓN 2: Crear admin y usuario en un solo paso
-- ============================================================================

-- Si necesitas crear tanto el usuario como el admin, usa esta función:

/*
DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Primero crea el usuario en auth.users desde el dashboard de Supabase
    -- Luego obtén su ID y úsalo aquí

    -- Ejemplo con ID conocido:
    new_user_id := 'TU_USER_ID_AQUI';

    -- Crear entrada en tabla usuarios
    INSERT INTO usuarios (id, nombre, correo_electronico)
    VALUES (
        new_user_id,
        'Super Admin',
        'admin@enerbook.mx'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Crear entrada en administradores
    INSERT INTO administradores (usuario_id, nivel_acceso, activo)
    VALUES (new_user_id, 'super_admin', true)
    ON CONFLICT (usuario_id) DO UPDATE SET
        nivel_acceso = 'super_admin',
        activo = true;

    RAISE NOTICE 'Super admin creado exitosamente con ID: %', new_user_id;
END $$;
*/

-- ============================================================================
-- VERIFICACIÓN: Consultar admins existentes
-- ============================================================================

-- Ejecuta esto para ver todos los administradores:
SELECT
    a.id,
    a.usuario_id,
    u.nombre,
    u.correo_electronico,
    a.nivel_acceso,
    a.activo,
    a.created_at
FROM administradores a
LEFT JOIN usuarios u ON u.id = a.usuario_id
ORDER BY a.created_at DESC;

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- Si el query anterior falla, verifica que el usuario existe en auth.users:
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Si necesitas desactivar un admin:
-- UPDATE administradores SET activo = false WHERE usuario_id = 'user-id-aqui';

-- Si necesitas cambiar nivel de acceso:
-- UPDATE administradores SET nivel_acceso = 'super_admin' WHERE usuario_id = 'user-id-aqui';
