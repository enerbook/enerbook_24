-- ============================================================================
-- ENERBOOK DATABASE SCHEMA
-- Generado automáticamente desde Supabase
-- Fecha: 2025-10-29
-- Proyecto: enerbook_24
-- Base de datos: PostgreSQL 17.6
-- ============================================================================

-- ============================================================================
-- EXTENSIONES INSTALADAS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
COMMENT ON EXTENSION "pgcrypto" IS 'cryptographic functions';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;
COMMENT ON EXTENSION "pg_stat_statements" IS 'track planning and execution statistics of all SQL statements executed';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA graphql;
COMMENT ON EXTENSION "pg_graphql" IS 'pg_graphql: GraphQL support';

-- ============================================================================
-- TIPOS ENUMERADOS (ENUMS)
-- ============================================================================

-- Estados de proyectos
CREATE TYPE payment_method AS ENUM ('upfront', 'milestones');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'paid');

-- ============================================================================
-- TABLAS PRINCIPALES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLA: usuarios
-- Descripción: Almacena información de clientes registrados
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    nombre TEXT NOT NULL DEFAULT ''::text,
    correo_electronico TEXT NOT NULL DEFAULT ''::text,
    telefono TEXT,
    fecha_nacimiento DATE,
    rfc TEXT,
    genero TEXT,
    stripe_account_id TEXT
);

COMMENT ON TABLE usuarios IS 'Información de clientes registrados en la plataforma';

-- ----------------------------------------------------------------------------
-- TABLA: proveedores (instaladores)
-- Descripción: Información de instaladores solares
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    nombre TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    direccion TEXT,
    activo BOOLEAN DEFAULT true,
    auth_user_id UUID REFERENCES auth.users(id),
    acepta_financiamiento_externo BOOLEAN DEFAULT false,
    comision_financiamiento_pct NUMERIC CHECK (comision_financiamiento_pct >= 0 AND comision_financiamiento_pct <= 100) DEFAULT 6.0,
    stripe_account_id TEXT UNIQUE,
    stripe_account_type TEXT CHECK (stripe_account_type IN ('express', 'standard', 'custom')),
    stripe_onboarding_completed BOOLEAN DEFAULT false,
    stripe_charges_enabled BOOLEAN DEFAULT false,
    stripe_payouts_enabled BOOLEAN DEFAULT false,
    stripe_requirements JSONB,
    stripe_onboarding_url TEXT,
    fecha_stripe_verificacion TIMESTAMPTZ,
    nombre_empresa TEXT,
    nombre_contacto TEXT
);

COMMENT ON TABLE proveedores IS 'Instaladores solares registrados en la plataforma';

-- ----------------------------------------------------------------------------
-- TABLA: certificaciones
-- Descripción: Certificaciones de instaladores
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificaciones (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    proveedores_id UUID REFERENCES proveedores(id),
    nombre TEXT NOT NULL,
    numero TEXT,
    fecha_emision DATE,
    fecha_vencimiento DATE,
    archivo_url TEXT
);

-- ----------------------------------------------------------------------------
-- TABLA: irradiacion_cache
-- Descripción: Cache de datos de irradiación solar de NASA
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS irradiacion_cache (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    lat_grid NUMERIC NOT NULL,
    lng_grid NUMERIC NOT NULL,
    radio_km INTEGER DEFAULT 5,
    datos_nasa_mensuales JSONB NOT NULL,
    irradiacion_promedio_min NUMERIC,
    irradiacion_promedio_max NUMERIC,
    irradiacion_promedio_anual NUMERIC,
    fecha_obtencion TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    vigente_hasta TIMESTAMPTZ,
    hash_ubicacion TEXT NOT NULL UNIQUE,
    region_nombre TEXT
);

COMMENT ON TABLE irradiacion_cache IS 'Cache de datos de irradiación solar obtenidos de NASA API';

-- ----------------------------------------------------------------------------
-- TABLA: cotizaciones_inicial
-- Descripción: Cotizaciones iniciales generadas por clientes
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cotizaciones_inicial (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    usuarios_id UUID REFERENCES usuarios(id),
    recibo_cfe JSONB,
    consumo_kwh_historico JSONB,
    resumen_energetico JSONB,
    sizing_results JSONB,
    irradiacion_cache_id UUID REFERENCES irradiacion_cache(id)
);

COMMENT ON TABLE cotizaciones_inicial IS 'Cotizaciones iniciales generadas por análisis de recibo CFE';

-- ----------------------------------------------------------------------------
-- TABLA: cotizaciones_leads_temp
-- Descripción: Cotizaciones temporales para usuarios no registrados (leads)
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cotizaciones_leads_temp (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    temp_lead_id TEXT NOT NULL UNIQUE,
    recibo_cfe JSONB,
    consumo_kwh_historico JSONB,
    resumen_energetico JSONB,
    sizing_results JSONB,
    irradiacion_cache_id UUID REFERENCES irradiacion_cache(id),
    project_title TEXT,
    project_description TEXT
);

COMMENT ON TABLE cotizaciones_leads_temp IS 'Cotizaciones temporales para usuarios anónimos, se eliminan después de 7 días';

-- ----------------------------------------------------------------------------
-- TABLA: proyectos
-- Descripción: Proyectos solares creados por clientes
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proyectos (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    cotizaciones_inicial_id UUID REFERENCES cotizaciones_inicial(id),
    estado TEXT DEFAULT 'abierto'::text CHECK (estado IN ('abierto', 'cerrado', 'adjudicado', 'cotizacion', 'en_progreso', 'completado', 'cancelado', 'en_espera')),
    descripcion TEXT,
    fecha_limite TIMESTAMPTZ,
    titulo TEXT NOT NULL,
    usuarios_id UUID REFERENCES usuarios(id),
    payment_status TEXT DEFAULT 'pending'::text,
    payment_method payment_method
);

COMMENT ON TABLE proyectos IS 'Proyectos solares publicados por clientes para recibir cotizaciones';

-- ----------------------------------------------------------------------------
-- TABLA: cotizaciones_final
-- Descripción: Cotizaciones detalladas enviadas por instaladores
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cotizaciones_final (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    proyectos_id UUID REFERENCES proyectos(id),
    proveedores_id UUID REFERENCES proveedores(id),
    paneles JSONB,
    inversores JSONB,
    estructura JSONB,
    sistema_electrico JSONB,
    precio_final JSONB,
    estado TEXT DEFAULT 'pendiente'::text CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
    notas_proveedor TEXT,
    opciones_pago JSONB,
    UNIQUE(proyectos_id, proveedores_id)
);

COMMENT ON TABLE cotizaciones_final IS 'Cotizaciones detalladas enviadas por instaladores a proyectos específicos';

-- ----------------------------------------------------------------------------
-- TABLA: contratos
-- Descripción: Contratos firmados entre clientes e instaladores
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contratos (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    cotizaciones_final_id UUID UNIQUE REFERENCES cotizaciones_final(id),
    usuarios_id UUID REFERENCES usuarios(id),
    proveedores_id UUID REFERENCES proveedores(id),
    numero_contrato TEXT NOT NULL UNIQUE,
    precio_total_sistema NUMERIC NOT NULL,
    tipo_pago_seleccionado TEXT NOT NULL CHECK (tipo_pago_seleccionado IN ('upfront', 'milestones', 'financing')),
    configuracion_pago JSONB NOT NULL,
    estado TEXT DEFAULT 'activo'::text CHECK (estado IN ('activo', 'completado', 'cancelado')),
    fecha_firma TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    fecha_inicio_instalacion TIMESTAMPTZ,
    fecha_completado TIMESTAMPTZ,
    archivo_contrato_url TEXT,
    documentos_adicionales JSONB,
    stripe_payment_intent_id TEXT,
    stripe_client_secret TEXT,
    estado_pago TEXT DEFAULT 'pendiente'::text CHECK (estado_pago IN ('pendiente', 'processing', 'succeeded', 'canceled', 'requires_action')),
    stripe_application_fee_amount NUMERIC,
    stripe_transfer_id TEXT,
    proyectos_id UUID REFERENCES proyectos(id)
);

COMMENT ON TABLE contratos IS 'Contratos firmados entre clientes e instaladores con configuración de pago';

-- ----------------------------------------------------------------------------
-- TABLA: transacciones_financiamiento
-- Descripción: Transacciones de financiamiento externo
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transacciones_financiamiento (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    contratos_id UUID UNIQUE REFERENCES contratos(id),
    proveedor_financiero TEXT NOT NULL,
    monto_financiado NUMERIC NOT NULL,
    tasa_interes NUMERIC NOT NULL,
    plazo_meses INTEGER NOT NULL,
    pago_mensual NUMERIC NOT NULL,
    service_fee_porcentaje NUMERIC NOT NULL DEFAULT 6.0,
    service_fee_monto NUMERIC NOT NULL,
    service_fee_pagado_cliente BOOLEAN DEFAULT false,
    fecha_pago_service_fee TIMESTAMPTZ,
    stripe_service_fee_payment_intent_id TEXT,
    stripe_service_fee_client_secret TEXT,
    estado TEXT DEFAULT 'pendiente'::text CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'desembolsado')),
    fecha_aprobacion TIMESTAMPTZ,
    fecha_desembolso TIMESTAMPTZ,
    fecha_primer_pago_cliente TIMESTAMPTZ,
    numero_credito TEXT,
    documentos_credito JSONB
);

COMMENT ON TABLE transacciones_financiamiento IS 'Gestión de financiamiento externo para proyectos solares';

-- ----------------------------------------------------------------------------
-- TABLA: comisiones_enerbook
-- Descripción: Comisiones de la plataforma por transacciones
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comisiones_enerbook (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    contratos_id UUID REFERENCES contratos(id),
    tipo_comision TEXT NOT NULL CHECK (tipo_comision IN ('upfront_withhold', 'milestone_prorrateado', 'service_fee_cliente')),
    pagador TEXT NOT NULL CHECK (pagador IN ('cliente', 'proveedor')),
    monto_base NUMERIC NOT NULL,
    porcentaje_comision NUMERIC NOT NULL,
    monto_comision NUMERIC NOT NULL,
    milestone_id UUID,
    financiamiento_id UUID REFERENCES transacciones_financiamiento(id),
    estado TEXT DEFAULT 'pendiente'::text CHECK (estado IN ('pendiente', 'cobrado', 'reembolsado')),
    fecha_cobro TIMESTAMPTZ,
    fecha_pago_proveedor TIMESTAMPTZ,
    descripcion TEXT,
    referencia_pago TEXT,
    stripe_application_fee_id TEXT,
    stripe_transfer_id TEXT,
    stripe_charge_id TEXT,
    stripe_refund_id TEXT
);

COMMENT ON TABLE comisiones_enerbook IS 'Registro de comisiones cobradas por la plataforma';

-- ----------------------------------------------------------------------------
-- TABLA: resenas
-- Descripción: Reseñas de clientes sobre instaladores
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resenas (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    contratos_id UUID UNIQUE REFERENCES contratos(id),
    puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    usuarios_id UUID REFERENCES usuarios(id),
    puntuacion_calidad INTEGER CHECK (puntuacion_calidad >= 1 AND puntuacion_calidad <= 5),
    puntuacion_tiempo INTEGER CHECK (puntuacion_tiempo >= 1 AND puntuacion_tiempo <= 5),
    puntuacion_comunicacion INTEGER CHECK (puntuacion_comunicacion >= 1 AND puntuacion_comunicacion <= 5),
    recomendaria BOOLEAN,
    fotos_instalacion JSONB
);

COMMENT ON TABLE resenas IS 'Reseñas y calificaciones de clientes sobre instaladores';

-- ----------------------------------------------------------------------------
-- TABLA: stripe_webhooks_log
-- Descripción: Log de eventos de webhooks de Stripe
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stripe_webhooks_log (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    stripe_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT false,
    processing_attempts INTEGER DEFAULT 0,
    error_message TEXT,
    event_data JSONB NOT NULL,
    related_contract_id UUID REFERENCES contratos(id),
    related_milestone_id UUID
);

-- ----------------------------------------------------------------------------
-- TABLA: stripe_disputes
-- Descripción: Registro de disputas de Stripe
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stripe_disputes (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    stripe_dispute_id TEXT NOT NULL UNIQUE,
    stripe_charge_id TEXT NOT NULL,
    contratos_id UUID REFERENCES contratos(id),
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'mxn'::text,
    reason TEXT,
    status TEXT,
    evidence_due_by TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- TABLA: administradores
-- Descripción: Usuarios administradores del sistema
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS administradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE REFERENCES usuarios(id) NOT NULL,
    nivel_acceso TEXT DEFAULT 'admin'::text CHECK (nivel_acceso IN ('admin', 'super_admin')),
    permisos JSONB DEFAULT '{}'::jsonb,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES usuarios(id)
);

COMMENT ON TABLE administradores IS 'Tabla para gestionar usuarios administradores del sistema';
COMMENT ON COLUMN administradores.nivel_acceso IS 'Nivel de acceso: admin (acceso básico) o super_admin (acceso completo)';
COMMENT ON COLUMN administradores.permisos IS 'Permisos específicos en formato JSON para granularidad fina';

-- ----------------------------------------------------------------------------
-- TABLA: admin_audit_log
-- Descripción: Registro de auditoría de acciones de administradores
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    admin_id UUID NOT NULL REFERENCES administradores(usuario_id),
    action_type TEXT NOT NULL CHECK (action_type IN ('create_admin', 'update_admin', 'deactivate_admin', 'view_sensitive_data', 'modify_commission', 'deactivate_provider', 'view_disputes')),
    target_table TEXT NOT NULL,
    target_id UUID,
    action_details JSONB,
    ip_address INET,
    user_agent TEXT
);

-- ----------------------------------------------------------------------------
-- TABLA: landing_stats
-- Descripción: Estadísticas para el landing page
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS landing_stats (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    proyectos_realizados INTEGER DEFAULT 0,
    reduccion_promedio_recibos NUMERIC DEFAULT 85.00,
    energia_producida_anual NUMERIC DEFAULT 311334.00,
    estados_cobertura INTEGER DEFAULT 2,
    activo BOOLEAN DEFAULT true,
    notas TEXT
);

COMMENT ON TABLE landing_stats IS 'Estadísticas dinámicas para el landing page de Enerbook';
COMMENT ON COLUMN landing_stats.proyectos_realizados IS 'Total de proyectos solares completados';
COMMENT ON COLUMN landing_stats.reduccion_promedio_recibos IS 'Porcentaje promedio de reducción en recibos CFE (0-100)';
COMMENT ON COLUMN landing_stats.energia_producida_anual IS 'Total de energía producida anualmente en kWh';
COMMENT ON COLUMN landing_stats.estados_cobertura IS 'Número de estados mexicanos con cobertura';
COMMENT ON COLUMN landing_stats.activo IS 'Indica si este registro es el activo para mostrar en landing';

-- ----------------------------------------------------------------------------
-- TABLA: payments
-- Descripción: Sistema de pagos con Stripe
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES proyectos(id),
    cliente_id UUID REFERENCES auth.users(id),
    instalador_id UUID REFERENCES proveedores(id),
    payment_method payment_method DEFAULT 'upfront'::payment_method,
    total_amount NUMERIC NOT NULL,
    platform_fee NUMERIC NOT NULL,
    installer_amount NUMERIC NOT NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    status payment_status DEFAULT 'pending'::payment_status,
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- TABLA: installer_transfers
-- Descripción: Transferencias a instaladores vía Stripe Connect
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS installer_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id),
    instalador_id UUID REFERENCES proveedores(id),
    stripe_transfer_id TEXT UNIQUE,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending'::text,
    transferred_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- TABLA: installer_milestone_templates
-- Descripción: Plantillas de milestones para instaladores
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS installer_milestone_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instalador_id UUID REFERENCES auth.users(id),
    template_name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    milestones JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- TABLA: payment_milestones
-- Descripción: Milestones de pago para instalaciones
-- RLS: Habilitado
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id),
    milestone_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    percentage NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    status milestone_status DEFAULT 'pending'::milestone_status,
    stripe_payment_intent_id TEXT UNIQUE,
    completed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(payment_id, milestone_number)
);

-- ============================================================================
-- VISTAS MATERIALIZADAS
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS landing_stats_computed AS
SELECT
    1 AS id,
    (SELECT COUNT(*)::integer FROM contratos WHERE estado = 'completado') AS proyectos_realizados,
    (
        SELECT COALESCE(
            AVG(
                CASE
                    WHEN ((cot.sizing_results->'results'->>'yearly_prod')::numeric > 0)
                    THEN (
                        ((cot.sizing_results->'results'->>'yearly_prod')::numeric /
                        NULLIF((cot.sizing_results->'inputs'->>'kWh_year_assumed')::numeric, 0)) * 100
                    )
                    ELSE 0
                END
            )::numeric(5,2),
            85.00
        )
        FROM contratos c
        JOIN cotizaciones_final cf ON cf.id = c.cotizaciones_final_id
        JOIN proyectos p ON p.id = cf.proyectos_id
        JOIN cotizaciones_inicial cot ON cot.id = p.cotizaciones_inicial_id
        WHERE c.estado = 'completado' AND cot.sizing_results IS NOT NULL
    ) AS reduccion_promedio_recibos,
    (
        SELECT COALESCE(
            SUM((cot.sizing_results->'results'->>'yearly_prod')::numeric),
            0
        )
        FROM contratos c
        JOIN cotizaciones_final cf ON cf.id = c.cotizaciones_final_id
        JOIN proyectos p ON p.id = cf.proyectos_id
        JOIN cotizaciones_inicial cot ON cot.id = p.cotizaciones_inicial_id
        WHERE c.estado = 'completado' AND cot.sizing_results IS NOT NULL
    ) AS energia_producida_anual,
    (
        SELECT COALESCE(COUNT(DISTINCT region_nombre)::integer, 2)
        FROM irradiacion_cache
        WHERE region_nombre IS NOT NULL
    ) AS estados_cobertura,
    now() AS computed_at;

CREATE UNIQUE INDEX IF NOT EXISTS landing_stats_computed_id_idx ON landing_stats_computed(id);

COMMENT ON MATERIALIZED VIEW landing_stats_computed IS 'Vista materializada con cálculos en tiempo real de estadísticas del landing';

-- ============================================================================
-- RESUMEN DE ARQUITECTURA
-- ============================================================================

/*
FLUJO PRINCIPAL DE DATOS:

1. LEADS (Usuarios no registrados):
   - cotizaciones_leads_temp (temporal, 7 días)
   - irradiacion_cache (datos NASA)

2. CLIENTES REGISTRADOS:
   - usuarios
   - cotizaciones_inicial
   - proyectos (abiertos para recibir cotizaciones)

3. INSTALADORES:
   - proveedores (con integración Stripe Connect)
   - certificaciones
   - cotizaciones_final (propuestas a proyectos)

4. CONTRATOS Y PAGOS:
   - contratos (firmados entre cliente-instalador)
   - payments (Stripe Payment Intents)
   - payment_milestones (pagos por etapas)
   - installer_transfers (transferencias a instaladores)

5. FINANCIAMIENTO:
   - transacciones_financiamiento (financiamiento externo)
   - comisiones_enerbook (service fees)

6. REVISIONES Y CALIDAD:
   - resenas (calificaciones de clientes)

7. ADMINISTRACIÓN:
   - administradores (admin/super_admin)
   - admin_audit_log (registro de acciones)
   - comisiones_enerbook (gestión de comisiones)

8. STRIPE:
   - stripe_webhooks_log (eventos de Stripe)
   - stripe_disputes (disputas)

9. LANDING PAGE:
   - landing_stats (estadísticas actuales)
   - landing_stats_computed (vista materializada con cálculos)

RELACIONES CLAVE:
- cotizaciones_inicial → proyectos → cotizaciones_final → contratos
- usuarios ← contratos → proveedores
- contratos → payments → payment_milestones
- contratos → transacciones_financiamiento → comisiones_enerbook
- contratos → resenas

SEGURIDAD:
- RLS habilitado en todas las tablas
- Políticas específicas por rol (cliente, instalador, admin)
- Funciones SECURITY DEFINER para operaciones sensibles
- Auditoría completa de acciones administrativas
*/
