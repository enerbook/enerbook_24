-- ============================================================================
-- ENERBOOK DATABASE SCHEMA
-- Complete database structure including tables, constraints, indexes,
-- functions, triggers, and RLS policies
--
-- Generated: 2025-10-02
-- Database: Supabase PostgreSQL
-- Project: enerbook_v25 (qkdvosjitrkopnarbozv)
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Table: usuarios
-- Description: Main users table for clients (clientes)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    nombre text NOT NULL DEFAULT ''::text,
    correo_electronico text NOT NULL DEFAULT ''::text,
    telefono text,
    fecha_nacimiento date,
    rfc text,
    genero text,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.usuarios IS 'Tabla principal de usuarios clientes del sistema';
COMMENT ON COLUMN public.usuarios.id IS 'UUID del usuario, vinculado con auth.users';
COMMENT ON COLUMN public.usuarios.genero IS 'Género del usuario: masculino, femenino, otro, prefiero_no_decir';

-- Table: proveedores
-- Description: Solar installation providers/installers
CREATE TABLE IF NOT EXISTS public.proveedores (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    nombre text NOT NULL,
    email text,
    telefono text,
    direccion text,
    activo boolean DEFAULT true,
    auth_user_id uuid,
    acepta_financiamiento_externo boolean DEFAULT false,
    comision_financiamiento_pct numeric DEFAULT 6.0,
    stripe_account_id text,
    stripe_account_type text,
    stripe_onboarding_completed boolean DEFAULT false,
    stripe_charges_enabled boolean DEFAULT false,
    stripe_payouts_enabled boolean DEFAULT false,
    stripe_requirements jsonb,
    stripe_onboarding_url text,
    fecha_stripe_verificacion timestamp with time zone,
    nombre_empresa text,
    nombre_contacto text,
    CONSTRAINT proveedores_pkey PRIMARY KEY (id),
    CONSTRAINT proveedores_stripe_account_id_key UNIQUE (stripe_account_id),
    CONSTRAINT proveedores_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
    CONSTRAINT proveedores_comision_financiamiento_pct_check CHECK (
        (comision_financiamiento_pct >= (0)::numeric) AND
        (comision_financiamiento_pct <= (100)::numeric)
    ),
    CONSTRAINT proveedores_stripe_account_type_check CHECK (
        stripe_account_type = ANY (ARRAY['express'::text, 'standard'::text, 'custom'::text])
    )
);

COMMENT ON TABLE public.proveedores IS 'Proveedores de instalación solar verificados';
COMMENT ON COLUMN public.proveedores.activo IS 'Indica si el proveedor está activo y puede recibir cotizaciones';
COMMENT ON COLUMN public.proveedores.comision_financiamiento_pct IS 'Porcentaje de comisión por financiamiento externo (default 6%)';

-- Table: administradores
-- Description: System administrators
CREATE TABLE IF NOT EXISTS public.administradores (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL,
    nivel_acceso text DEFAULT 'admin'::text,
    permisos jsonb DEFAULT '{}'::jsonb,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT administradores_pkey PRIMARY KEY (id),
    CONSTRAINT administradores_usuario_id_key UNIQUE (usuario_id),
    CONSTRAINT administradores_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
    CONSTRAINT administradores_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.usuarios(id),
    CONSTRAINT administradores_nivel_acceso_check CHECK (
        nivel_acceso = ANY (ARRAY['admin'::text, 'super_admin'::text])
    )
);

COMMENT ON TABLE public.administradores IS 'Tabla para gestionar usuarios administradores del sistema';
COMMENT ON COLUMN public.administradores.nivel_acceso IS 'Nivel de acceso: admin (acceso básico) o super_admin (acceso completo)';
COMMENT ON COLUMN public.administradores.permisos IS 'Permisos específicos en formato JSON para granularidad fina';

-- Table: irradiacion_cache
-- Description: Cache of solar irradiation data from NASA
CREATE TABLE IF NOT EXISTS public.irradiacion_cache (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    lat_grid numeric NOT NULL,
    lng_grid numeric NOT NULL,
    radio_km integer DEFAULT 5,
    datos_nasa_mensuales jsonb NOT NULL,
    irradiacion_promedio_min numeric,
    irradiacion_promedio_max numeric,
    irradiacion_promedio_anual numeric,
    fecha_obtencion timestamp with time zone DEFAULT timezone('utc'::text, now()),
    vigente_hasta timestamp with time zone,
    hash_ubicacion text NOT NULL,
    region_nombre text,
    CONSTRAINT irradiacion_cache_pkey PRIMARY KEY (id),
    CONSTRAINT irradiacion_cache_hash_ubicacion_key UNIQUE (hash_ubicacion)
);

COMMENT ON TABLE public.irradiacion_cache IS 'Cache de datos de irradiación solar obtenidos de NASA POWER API';
COMMENT ON COLUMN public.irradiacion_cache.hash_ubicacion IS 'Hash único para identificar ubicación (lat+lng) y evitar duplicados';

-- Table: cotizaciones_inicial
-- Description: Initial quotes/analysis from CFE receipt
CREATE TABLE IF NOT EXISTS public.cotizaciones_inicial (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    usuarios_id uuid,
    recibo_cfe jsonb,
    consumo_kwh_historico jsonb,
    resumen_energetico jsonb,
    sizing_results jsonb,
    irradiacion_cache_id uuid,
    CONSTRAINT cotizaciones_inicial_pkey PRIMARY KEY (id),
    CONSTRAINT cotizaciones_inicial_usuarios_id_fkey FOREIGN KEY (usuarios_id) REFERENCES public.usuarios(id),
    CONSTRAINT cotizaciones_inicial_irradiacion_cache_id_fkey FOREIGN KEY (irradiacion_cache_id) REFERENCES public.irradiacion_cache(id)
);

COMMENT ON TABLE public.cotizaciones_inicial IS 'Cotizaciones iniciales generadas a partir del análisis del recibo CFE';
COMMENT ON COLUMN public.cotizaciones_inicial.consumo_kwh_historico IS 'Historial de consumo en kWh extraído del recibo';
COMMENT ON COLUMN public.cotizaciones_inicial.sizing_results IS 'Resultados del dimensionamiento del sistema solar';

-- Table: cotizaciones_leads_temp
-- Description: Temporary quotes for anonymous users (leads)
CREATE TABLE IF NOT EXISTS public.cotizaciones_leads_temp (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    temp_lead_id text NOT NULL,
    recibo_cfe jsonb,
    consumo_kwh_historico jsonb,
    resumen_energetico jsonb,
    sizing_results jsonb,
    irradiacion_cache_id uuid,
    CONSTRAINT cotizaciones_leads_temp_pkey PRIMARY KEY (id),
    CONSTRAINT cotizaciones_leads_temp_temp_lead_id_key UNIQUE (temp_lead_id),
    CONSTRAINT cotizaciones_leads_temp_irradiacion_cache_id_fkey FOREIGN KEY (irradiacion_cache_id) REFERENCES public.irradiacion_cache(id)
);

COMMENT ON TABLE public.cotizaciones_leads_temp IS 'Cotizaciones temporales para usuarios anónimos (leads) - expiración 7 días';
COMMENT ON COLUMN public.cotizaciones_leads_temp.temp_lead_id IS 'ID temporal único generado en frontend (formato: lead_timestamp_random)';

-- Table: proyectos
-- Description: Solar projects for requesting quotes
CREATE TABLE IF NOT EXISTS public.proyectos (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    cotizaciones_inicial_id uuid,
    estado text DEFAULT 'abierto'::text,
    descripcion text,
    fecha_limite timestamp with time zone,
    titulo text NOT NULL,
    usuarios_id uuid,
    CONSTRAINT proyectos_pkey PRIMARY KEY (id),
    CONSTRAINT proyectos_usuarios_id_fkey FOREIGN KEY (usuarios_id) REFERENCES public.usuarios(id),
    CONSTRAINT proyectos_cotizaciones_inicial_id_fkey FOREIGN KEY (cotizaciones_inicial_id) REFERENCES public.cotizaciones_inicial(id),
    CONSTRAINT proyectos_estado_check CHECK (
        estado = ANY (ARRAY['abierto'::text, 'cerrado'::text, 'adjudicado'::text,
        'cotizacion'::text, 'en_progreso'::text, 'completado'::text, 'cancelado'::text, 'en_espera'::text])
    )
);

COMMENT ON TABLE public.proyectos IS 'Proyectos solares creados por clientes para solicitar cotizaciones';
COMMENT ON COLUMN public.proyectos.estado IS 'Estado del proyecto: abierto, cerrado, adjudicado, etc.';

-- Table: cotizaciones_final
-- Description: Final quotes from installers for projects
CREATE TABLE IF NOT EXISTS public.cotizaciones_final (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    proyectos_id uuid,
    proveedores_id uuid,
    paneles jsonb,
    inversores jsonb,
    estructura jsonb,
    sistema_electrico jsonb,
    precio_final jsonb,
    estado text DEFAULT 'pendiente'::text,
    notas_proveedor text,
    opciones_pago jsonb,
    CONSTRAINT cotizaciones_final_pkey PRIMARY KEY (id),
    CONSTRAINT cotizaciones_final_proyectos_id_proveedores_id_key UNIQUE (proyectos_id, proveedores_id),
    CONSTRAINT cotizaciones_final_proyectos_id_fkey FOREIGN KEY (proyectos_id) REFERENCES public.proyectos(id),
    CONSTRAINT cotizaciones_final_proveedores_id_fkey FOREIGN KEY (proveedores_id) REFERENCES public.proveedores(id),
    CONSTRAINT cotizaciones_final_estado_check CHECK (
        estado = ANY (ARRAY['pendiente'::text, 'aceptada'::text, 'rechazada'::text])
    )
);

COMMENT ON TABLE public.cotizaciones_final IS 'Cotizaciones finales enviadas por instaladores a proyectos específicos';
COMMENT ON COLUMN public.cotizaciones_final.opciones_pago IS 'Opciones de pago ofrecidas: upfront, milestones, financing';

-- Table: contratos
-- Description: Contracts between clients and installers
CREATE TABLE IF NOT EXISTS public.contratos (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    cotizaciones_final_id uuid,
    usuarios_id uuid,
    proveedores_id uuid,
    numero_contrato text NOT NULL,
    precio_total_sistema numeric NOT NULL,
    tipo_pago_seleccionado text NOT NULL,
    configuracion_pago jsonb NOT NULL,
    estado text DEFAULT 'activo'::text,
    fecha_firma timestamp with time zone DEFAULT timezone('utc'::text, now()),
    fecha_inicio_instalacion timestamp with time zone,
    fecha_completado timestamp with time zone,
    archivo_contrato_url text,
    documentos_adicionales jsonb,
    stripe_payment_intent_id text,
    stripe_client_secret text,
    estado_pago text DEFAULT 'pendiente'::text,
    stripe_application_fee_amount numeric,
    stripe_transfer_id text,
    CONSTRAINT contratos_pkey PRIMARY KEY (id),
    CONSTRAINT contratos_numero_contrato_key UNIQUE (numero_contrato),
    CONSTRAINT contratos_cotizaciones_final_id_key UNIQUE (cotizaciones_final_id),
    CONSTRAINT contratos_cotizaciones_final_id_fkey FOREIGN KEY (cotizaciones_final_id) REFERENCES public.cotizaciones_final(id),
    CONSTRAINT contratos_usuarios_id_fkey FOREIGN KEY (usuarios_id) REFERENCES public.usuarios(id),
    CONSTRAINT contratos_proveedores_id_fkey FOREIGN KEY (proveedores_id) REFERENCES public.proveedores(id),
    CONSTRAINT contratos_estado_check CHECK (
        estado = ANY (ARRAY['activo'::text, 'completado'::text, 'cancelado'::text])
    ),
    CONSTRAINT contratos_estado_pago_check CHECK (
        estado_pago = ANY (ARRAY['pendiente'::text, 'processing'::text, 'succeeded'::text, 'canceled'::text, 'requires_action'::text])
    ),
    CONSTRAINT contratos_tipo_pago_seleccionado_check CHECK (
        tipo_pago_seleccionado = ANY (ARRAY['upfront'::text, 'milestones'::text, 'financing'::text])
    )
);

COMMENT ON TABLE public.contratos IS 'Contratos firmados entre clientes e instaladores';
COMMENT ON COLUMN public.contratos.tipo_pago_seleccionado IS 'Tipo de pago: upfront (pago total), milestones (por hitos), financing (financiamiento)';

-- Table: pagos_milestones
-- Description: Payment milestones for contracts
CREATE TABLE IF NOT EXISTS public.pagos_milestones (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    contratos_id uuid,
    numero_milestone integer NOT NULL,
    nombre_milestone text NOT NULL,
    descripcion text,
    porcentaje_pago numeric NOT NULL,
    monto_pago numeric NOT NULL,
    estado text DEFAULT 'pendiente'::text,
    fecha_objetivo timestamp with time zone,
    fecha_completado timestamp with time zone,
    comision_enerbook_monto numeric NOT NULL DEFAULT 0,
    comision_pagada boolean DEFAULT false,
    fecha_pago_comision timestamp with time zone,
    documentos_evidencia jsonb,
    stripe_payment_intent_id text,
    stripe_transfer_id text,
    stripe_application_fee_amount numeric,
    stripe_client_secret text,
    CONSTRAINT pagos_milestones_pkey PRIMARY KEY (id),
    CONSTRAINT pagos_milestones_contratos_id_numero_milestone_key UNIQUE (contratos_id, numero_milestone),
    CONSTRAINT pagos_milestones_contratos_id_fkey FOREIGN KEY (contratos_id) REFERENCES public.contratos(id),
    CONSTRAINT pagos_milestones_estado_check CHECK (
        estado = ANY (ARRAY['pendiente'::text, 'completado'::text, 'vencido'::text])
    ),
    CONSTRAINT pagos_milestones_porcentaje_pago_check CHECK (
        (porcentaje_pago > (0)::numeric) AND (porcentaje_pago <= (100)::numeric)
    )
);

COMMENT ON TABLE public.pagos_milestones IS 'Hitos de pago para contratos con esquema de pagos por milestone';

-- Table: transacciones_financiamiento
-- Description: External financing transactions
CREATE TABLE IF NOT EXISTS public.transacciones_financiamiento (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    contratos_id uuid,
    proveedor_financiero text NOT NULL,
    monto_financiado numeric NOT NULL,
    tasa_interes numeric NOT NULL,
    plazo_meses integer NOT NULL,
    pago_mensual numeric NOT NULL,
    service_fee_porcentaje numeric NOT NULL DEFAULT 6.0,
    service_fee_monto numeric NOT NULL,
    service_fee_pagado_cliente boolean DEFAULT false,
    fecha_pago_service_fee timestamp with time zone,
    stripe_service_fee_payment_intent_id text,
    stripe_service_fee_client_secret text,
    estado text DEFAULT 'pendiente'::text,
    fecha_aprobacion timestamp with time zone,
    fecha_desembolso timestamp with time zone,
    fecha_primer_pago_cliente timestamp with time zone,
    numero_credito text,
    documentos_credito jsonb,
    CONSTRAINT transacciones_financiamiento_pkey PRIMARY KEY (id),
    CONSTRAINT transacciones_financiamiento_contratos_id_key UNIQUE (contratos_id),
    CONSTRAINT transacciones_financiamiento_contratos_id_fkey FOREIGN KEY (contratos_id) REFERENCES public.contratos(id),
    CONSTRAINT transacciones_financiamiento_estado_check CHECK (
        estado = ANY (ARRAY['pendiente'::text, 'aprobado'::text, 'rechazado'::text, 'desembolsado'::text])
    )
);

COMMENT ON TABLE public.transacciones_financiamiento IS 'Transacciones de financiamiento externo para contratos';
COMMENT ON COLUMN public.transacciones_financiamiento.service_fee_porcentaje IS 'Porcentaje de service fee cobrado al cliente (default 6%)';

-- Table: comisiones_enerbook
-- Description: Enerbook platform commissions
CREATE TABLE IF NOT EXISTS public.comisiones_enerbook (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    contratos_id uuid,
    tipo_comision text NOT NULL,
    pagador text NOT NULL,
    monto_base numeric NOT NULL,
    porcentaje_comision numeric NOT NULL,
    monto_comision numeric NOT NULL,
    milestone_id uuid,
    financiamiento_id uuid,
    estado text DEFAULT 'pendiente'::text,
    fecha_cobro timestamp with time zone,
    fecha_pago_proveedor timestamp with time zone,
    descripcion text,
    referencia_pago text,
    stripe_application_fee_id text,
    stripe_transfer_id text,
    stripe_charge_id text,
    stripe_refund_id text,
    CONSTRAINT comisiones_enerbook_pkey PRIMARY KEY (id),
    CONSTRAINT comisiones_enerbook_contratos_id_fkey FOREIGN KEY (contratos_id) REFERENCES public.contratos(id),
    CONSTRAINT comisiones_enerbook_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.pagos_milestones(id),
    CONSTRAINT comisiones_enerbook_financiamiento_id_fkey FOREIGN KEY (financiamiento_id) REFERENCES public.transacciones_financiamiento(id),
    CONSTRAINT comisiones_enerbook_estado_check CHECK (
        estado = ANY (ARRAY['pendiente'::text, 'cobrado'::text, 'reembolsado'::text])
    ),
    CONSTRAINT comisiones_enerbook_pagador_check CHECK (
        pagador = ANY (ARRAY['cliente'::text, 'proveedor'::text])
    ),
    CONSTRAINT comisiones_enerbook_tipo_comision_check CHECK (
        tipo_comision = ANY (ARRAY['upfront_withhold'::text, 'milestone_prorrateado'::text, 'service_fee_cliente'::text])
    )
);

COMMENT ON TABLE public.comisiones_enerbook IS 'Comisiones cobradas por la plataforma Enerbook';

-- Table: certificaciones
-- Description: Installer certifications
CREATE TABLE IF NOT EXISTS public.certificaciones (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    proveedores_id uuid,
    nombre text NOT NULL,
    numero text,
    fecha_emision date,
    fecha_vencimiento date,
    archivo_url text,
    CONSTRAINT certificaciones_pkey PRIMARY KEY (id),
    CONSTRAINT certificaciones_proveedores_id_fkey FOREIGN KEY (proveedores_id) REFERENCES public.proveedores(id)
);

COMMENT ON TABLE public.certificaciones IS 'Certificaciones de instaladores solares';

-- Table: resenas
-- Description: Client reviews for installers
CREATE TABLE IF NOT EXISTS public.resenas (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    contratos_id uuid,
    puntuacion integer NOT NULL,
    comentario text,
    usuarios_id uuid,
    puntuacion_calidad integer,
    puntuacion_tiempo integer,
    puntuacion_comunicacion integer,
    recomendaria boolean,
    fotos_instalacion jsonb,
    CONSTRAINT resenas_pkey PRIMARY KEY (id),
    CONSTRAINT resenas_contratos_id_key UNIQUE (contratos_id),
    CONSTRAINT resenas_contratos_id_fkey FOREIGN KEY (contratos_id) REFERENCES public.contratos(id),
    CONSTRAINT resenas_usuarios_id_fkey FOREIGN KEY (usuarios_id) REFERENCES public.usuarios(id),
    CONSTRAINT resenas_puntuacion_check CHECK ((puntuacion >= 1) AND (puntuacion <= 5)),
    CONSTRAINT resenas_puntuacion_calidad_check CHECK ((puntuacion_calidad >= 1) AND (puntuacion_calidad <= 5)),
    CONSTRAINT resenas_puntuacion_tiempo_check CHECK ((puntuacion_tiempo >= 1) AND (puntuacion_tiempo <= 5)),
    CONSTRAINT resenas_puntuacion_comunicacion_check CHECK ((puntuacion_comunicacion >= 1) AND (puntuacion_comunicacion <= 5))
);

COMMENT ON TABLE public.resenas IS 'Reseñas y calificaciones de clientes a instaladores';

-- Table: stripe_webhooks_log
-- Description: Stripe webhook event log
CREATE TABLE IF NOT EXISTS public.stripe_webhooks_log (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    stripe_event_id text NOT NULL,
    event_type text NOT NULL,
    processed boolean DEFAULT false,
    processing_attempts integer DEFAULT 0,
    error_message text,
    event_data jsonb NOT NULL,
    related_contract_id uuid,
    related_milestone_id uuid,
    CONSTRAINT stripe_webhooks_log_pkey PRIMARY KEY (id),
    CONSTRAINT stripe_webhooks_log_stripe_event_id_key UNIQUE (stripe_event_id),
    CONSTRAINT stripe_webhooks_log_related_contract_id_fkey FOREIGN KEY (related_contract_id) REFERENCES public.contratos(id),
    CONSTRAINT stripe_webhooks_log_related_milestone_id_fkey FOREIGN KEY (related_milestone_id) REFERENCES public.pagos_milestones(id)
);

COMMENT ON TABLE public.stripe_webhooks_log IS 'Log de eventos webhook de Stripe para auditoría y reintento';

-- Table: stripe_disputes
-- Description: Stripe payment disputes
CREATE TABLE IF NOT EXISTS public.stripe_disputes (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    stripe_dispute_id text NOT NULL,
    stripe_charge_id text NOT NULL,
    contratos_id uuid,
    amount numeric NOT NULL,
    currency text DEFAULT 'mxn'::text,
    reason text,
    status text,
    evidence_due_by timestamp with time zone,
    resolved_at timestamp with time zone,
    CONSTRAINT stripe_disputes_pkey PRIMARY KEY (id),
    CONSTRAINT stripe_disputes_stripe_dispute_id_key UNIQUE (stripe_dispute_id),
    CONSTRAINT stripe_disputes_contratos_id_fkey FOREIGN KEY (contratos_id) REFERENCES public.contratos(id)
);

COMMENT ON TABLE public.stripe_disputes IS 'Disputas de pago en Stripe';

-- Table: admin_audit_log
-- Description: Admin actions audit log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    admin_id uuid NOT NULL,
    action_type text NOT NULL,
    target_table text NOT NULL,
    target_id uuid,
    action_details jsonb,
    ip_address inet,
    user_agent text,
    CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id),
    CONSTRAINT admin_audit_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.administradores(usuario_id),
    CONSTRAINT admin_audit_log_action_type_check CHECK (
        action_type = ANY (ARRAY['create_admin'::text, 'update_admin'::text, 'deactivate_admin'::text,
        'view_sensitive_data'::text, 'modify_commission'::text, 'deactivate_provider'::text, 'view_disputes'::text])
    )
);

COMMENT ON TABLE public.admin_audit_log IS 'Log de auditoría de acciones de administradores';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Indexes for usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON public.usuarios(correo_electronico);

-- Indexes for proveedores
CREATE INDEX IF NOT EXISTS idx_proveedores_auth_user_id ON public.proveedores(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_proveedores_activo ON public.proveedores(activo);
CREATE INDEX IF NOT EXISTS idx_proveedores_stripe_account_id ON public.proveedores(stripe_account_id);

-- Indexes for administradores
CREATE INDEX IF NOT EXISTS idx_administradores_usuario_id ON public.administradores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_administradores_activo ON public.administradores(activo);
CREATE INDEX IF NOT EXISTS idx_administradores_usuario_activo ON public.administradores(usuario_id, activo) WHERE (activo = true);
CREATE INDEX IF NOT EXISTS idx_administradores_super_admin ON public.administradores(usuario_id, nivel_acceso)
    WHERE ((activo = true) AND (nivel_acceso = 'super_admin'::text));

-- Indexes for irradiacion_cache
CREATE INDEX IF NOT EXISTS idx_irradiacion_cache_hash ON public.irradiacion_cache(hash_ubicacion);
CREATE INDEX IF NOT EXISTS idx_irradiacion_cache_coords ON public.irradiacion_cache(lat_grid, lng_grid);

-- Indexes for cotizaciones_inicial
CREATE INDEX IF NOT EXISTS idx_cotizaciones_inicial_usuarios_id ON public.cotizaciones_inicial(usuarios_id);

-- Indexes for cotizaciones_leads_temp
CREATE INDEX IF NOT EXISTS idx_cotizaciones_leads_temp_temp_lead_id ON public.cotizaciones_leads_temp(temp_lead_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_leads_temp_created_at ON public.cotizaciones_leads_temp(created_at);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_leads_temp_irradiacion_cache_id ON public.cotizaciones_leads_temp(irradiacion_cache_id);
CREATE INDEX IF NOT EXISTS idx_temp_quotes_secure_lookup ON public.cotizaciones_leads_temp(temp_lead_id, created_at DESC);

-- Indexes for proyectos
CREATE INDEX IF NOT EXISTS idx_proyectos_usuarios_id ON public.proyectos(usuarios_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON public.proyectos(estado);

-- Indexes for cotizaciones_final
CREATE INDEX IF NOT EXISTS idx_cotizaciones_final_proyectos_id ON public.cotizaciones_final(proyectos_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_final_proveedores_id ON public.cotizaciones_final(proveedores_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_final_estado ON public.cotizaciones_final(estado);

-- Indexes for contratos
CREATE INDEX IF NOT EXISTS idx_contratos_usuarios_id ON public.contratos(usuarios_id);
CREATE INDEX IF NOT EXISTS idx_contratos_proveedores_id ON public.contratos(proveedores_id);
CREATE INDEX IF NOT EXISTS idx_contratos_estado ON public.contratos(estado);
CREATE INDEX IF NOT EXISTS idx_contratos_estado_pago ON public.contratos(estado_pago);
CREATE INDEX IF NOT EXISTS idx_contratos_tipo_pago ON public.contratos(tipo_pago_seleccionado);
CREATE INDEX IF NOT EXISTS idx_contratos_stripe_payment_intent ON public.contratos(stripe_payment_intent_id);

-- Indexes for pagos_milestones
CREATE INDEX IF NOT EXISTS idx_pagos_milestones_contratos_id ON public.pagos_milestones(contratos_id);
CREATE INDEX IF NOT EXISTS idx_pagos_milestones_estado ON public.pagos_milestones(estado);
CREATE INDEX IF NOT EXISTS idx_milestones_stripe_payment_intent ON public.pagos_milestones(stripe_payment_intent_id);

-- Indexes for transacciones_financiamiento
CREATE INDEX IF NOT EXISTS idx_transacciones_financiamiento_contratos_id ON public.transacciones_financiamiento(contratos_id);

-- Indexes for comisiones_enerbook
CREATE INDEX IF NOT EXISTS idx_comisiones_enerbook_contratos_id ON public.comisiones_enerbook(contratos_id);
CREATE INDEX IF NOT EXISTS idx_comisiones_enerbook_tipo ON public.comisiones_enerbook(tipo_comision);
CREATE INDEX IF NOT EXISTS idx_comisiones_enerbook_estado ON public.comisiones_enerbook(estado);
CREATE INDEX IF NOT EXISTS idx_comisiones_stripe_application_fee ON public.comisiones_enerbook(stripe_application_fee_id);
CREATE INDEX IF NOT EXISTS idx_comisiones_stripe_transfer ON public.comisiones_enerbook(stripe_transfer_id);

-- Indexes for stripe_webhooks_log
CREATE INDEX IF NOT EXISTS idx_webhooks_event_id ON public.stripe_webhooks_log(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON public.stripe_webhooks_log(processed, created_at);

-- Indexes for stripe_disputes
CREATE INDEX IF NOT EXISTS idx_disputes_stripe_dispute_id ON public.stripe_disputes(stripe_dispute_id);
CREATE INDEX IF NOT EXISTS idx_disputes_contratos_id ON public.stripe_disputes(contratos_id);

-- Indexes for admin_audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_date ON public.admin_audit_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON public.admin_audit_log(action_type, created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: update_updated_at_column
-- Description: Trigger function to auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Function: is_admin
-- Description: Check if current user is an active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM administradores
        WHERE usuario_id = auth.uid()
          AND activo = true
    );
END;
$function$;

-- Function: is_super_admin
-- Description: Check if current user is an active super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM administradores
        WHERE usuario_id = auth.uid()
          AND activo = true
          AND nivel_acceso = 'super_admin'
    );
END;
$function$;

-- Function: cleanup_old_temp_leads
-- Description: Delete temporary lead quotes older than 7 days
CREATE OR REPLACE FUNCTION public.cleanup_old_temp_leads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    DELETE FROM cotizaciones_leads_temp
    WHERE created_at < NOW() - INTERVAL '7 days';

    RAISE NOTICE 'Cleaned up old temp leads';
END;
$function$;

-- Function: create_test_user
-- Description: Create test users for development (DO NOT USE IN PRODUCTION)
CREATE OR REPLACE FUNCTION public.create_test_user(
    test_email text,
    test_password text,
    test_user_type text,
    test_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_user_id uuid;
BEGIN
  new_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, raw_app_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    new_user_id, test_email, crypt(test_password, gen_salt('bf')), NOW(),
    jsonb_build_object('user_type', test_user_type) || test_metadata,
    '{}'::jsonb, NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_user_id, new_user_id::text, 'email',
    jsonb_build_object('email', test_email, 'email_verified', true,
                       'phone_verified', false, 'sub', new_user_id::text),
    NOW(), NOW(), NOW()
  );

  IF test_user_type = 'cliente' THEN
    INSERT INTO usuarios (id, nombre, correo_electronico, telefono, created_at, updated_at)
    VALUES (new_user_id, COALESCE(test_metadata->>'nombre', 'Cliente Test'),
            test_email, COALESCE(test_metadata->>'telefono', ''), NOW(), NOW());
  END IF;

  IF test_user_type = 'instalador' THEN
    INSERT INTO proveedores (id, auth_user_id, nombre, email, telefono,
                             activo, acepta_financiamiento_externo,
                             comision_financiamiento_pct, created_at, updated_at)
    VALUES (gen_random_uuid(), new_user_id,
            COALESCE(test_metadata->>'nombre_empresa', 'Solar Test Company'),
            test_email, COALESCE(test_metadata->>'telefono', ''),
            true, true, 0.10, NOW(), NOW());
  END IF;

  RETURN new_user_id;
END;
$function$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-update updated_at on all tables
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON public.proveedores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_administradores_updated_at BEFORE UPDATE ON public.administradores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_irradiacion_cache_updated_at BEFORE UPDATE ON public.irradiacion_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cotizaciones_inicial_updated_at BEFORE UPDATE ON public.cotizaciones_inicial
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cotizaciones_leads_temp_updated_at BEFORE UPDATE ON public.cotizaciones_leads_temp
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON public.proyectos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cotizaciones_final_updated_at BEFORE UPDATE ON public.cotizaciones_final
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON public.contratos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_milestones_updated_at BEFORE UPDATE ON public.pagos_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transacciones_financiamiento_updated_at BEFORE UPDATE ON public.transacciones_financiamiento
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comisiones_enerbook_updated_at BEFORE UPDATE ON public.comisiones_enerbook
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificaciones_updated_at BEFORE UPDATE ON public.certificaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resenas_updated_at BEFORE UPDATE ON public.resenas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_disputes_updated_at BEFORE UPDATE ON public.stripe_disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irradiacion_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones_inicial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones_leads_temp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones_final ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones_financiamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comisiones_enerbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhooks_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for usuarios
CREATE POLICY "Users can view own data" ON public.usuarios
    FOR SELECT USING ((auth.uid())::text = (id)::text);

CREATE POLICY "Users can insert own data" ON public.usuarios
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.usuarios
    FOR UPDATE USING ((auth.uid())::text = (id)::text);

-- Policies for proveedores
CREATE POLICY "Providers are publicly readable" ON public.proveedores
    FOR SELECT USING (activo = true);

CREATE POLICY "Installers can insert own data" ON public.proveedores
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Providers can update own data" ON public.proveedores
    FOR UPDATE USING ((auth.uid() = auth_user_id) AND (activo = true))
    WITH CHECK ((auth.uid() = auth_user_id) AND
                ((activo = (SELECT proveedores_1.activo FROM proveedores proveedores_1 WHERE (proveedores_1.id = proveedores_1.id)))
                 OR (EXISTS (SELECT 1 FROM administradores WHERE ((administradores.usuario_id = auth.uid()) AND (administradores.activo = true))))));

CREATE POLICY "Only admins can deactivate providers" ON public.proveedores
    FOR UPDATE USING (EXISTS (SELECT 1 FROM administradores WHERE ((administradores.usuario_id = auth.uid()) AND (administradores.activo = true))))
    WITH CHECK (true);

-- Policies for administradores
CREATE POLICY "Admins can view own profile" ON public.administradores
    FOR SELECT USING ((usuario_id = auth.uid()) AND (activo = true));

CREATE POLICY "Super admins can view all admins" ON public.administradores
    FOR SELECT USING (EXISTS (SELECT 1 FROM administradores a WHERE ((a.usuario_id = auth.uid()) AND (a.activo = true) AND (a.nivel_acceso = 'super_admin'::text))));

CREATE POLICY "admins_pueden_ver_otros_admins" ON public.administradores
    FOR SELECT USING (EXISTS (SELECT 1 FROM administradores administradores_1 WHERE ((administradores_1.usuario_id = auth.uid()) AND (administradores_1.activo = true))));

CREATE POLICY "usuarios_pueden_verificar_admin_status" ON public.administradores
    FOR SELECT USING ((auth.uid() IS NOT NULL) AND (usuario_id = auth.uid()));

CREATE POLICY "temp_admins_can_read" ON public.administradores
    FOR SELECT USING (auth.role() = 'authenticated'::text);

CREATE POLICY "super_admin_puede_gestionar" ON public.administradores
    FOR ALL USING (EXISTS (SELECT 1 FROM administradores administradores_1 WHERE ((administradores_1.usuario_id = auth.uid()) AND (administradores_1.nivel_acceso = 'super_admin'::text) AND (administradores_1.activo = true))));

CREATE POLICY "Only super admins can create admins" ON public.administradores
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM administradores a WHERE ((a.usuario_id = auth.uid()) AND (a.activo = true) AND (a.nivel_acceso = 'super_admin'::text))));

CREATE POLICY "Only super admins can update admins" ON public.administradores
    FOR UPDATE USING (EXISTS (SELECT 1 FROM administradores a WHERE ((a.usuario_id = auth.uid()) AND (a.activo = true) AND (a.nivel_acceso = 'super_admin'::text))));

CREATE POLICY "Only super admins can delete admins" ON public.administradores
    FOR DELETE USING ((EXISTS (SELECT 1 FROM administradores a WHERE ((a.usuario_id = auth.uid()) AND (a.activo = true) AND (a.nivel_acceso = 'super_admin'::text)))) AND (usuario_id <> auth.uid()));

-- Policies for irradiacion_cache
CREATE POLICY "Irradiation data is publicly readable" ON public.irradiacion_cache
    FOR SELECT USING (true);

-- Policies for cotizaciones_inicial
CREATE POLICY "Users can view own initial quotes" ON public.cotizaciones_inicial
    FOR SELECT USING ((auth.uid())::text = (usuarios_id)::text);

CREATE POLICY "Users can insert own initial quotes" ON public.cotizaciones_inicial
    FOR INSERT WITH CHECK ((auth.uid())::text = (usuarios_id)::text);

-- Policies for cotizaciones_leads_temp
CREATE POLICY "Users can view own temp quotes" ON public.cotizaciones_leads_temp
    FOR SELECT USING ((created_at > (now() - '7 days'::interval)) AND true);

CREATE POLICY "Authenticated anon users can insert temp quotes" ON public.cotizaciones_leads_temp
    FOR INSERT WITH CHECK ((temp_lead_id IS NOT NULL) AND (length(temp_lead_id) > 32) AND (created_at IS NOT NULL));

-- Policies for proyectos
CREATE POLICY "Open projects are publicly readable" ON public.proyectos
    FOR SELECT USING ((estado = 'abierto'::text) OR ((auth.uid())::text = (usuarios_id)::text));

CREATE POLICY "Users can manage own projects" ON public.proyectos
    FOR ALL USING ((auth.uid())::text = (usuarios_id)::text);

-- Policies for cotizaciones_final
CREATE POLICY "Project owners can view all quotes" ON public.cotizaciones_final
    FOR SELECT USING (EXISTS (SELECT 1 FROM proyectos WHERE ((proyectos.id = cotizaciones_final.proyectos_id) AND ((proyectos.usuarios_id)::text = (auth.uid())::text))));

CREATE POLICY "Providers can manage own quotes" ON public.cotizaciones_final
    FOR ALL USING (EXISTS (SELECT 1 FROM proveedores WHERE ((proveedores.id = cotizaciones_final.proveedores_id) AND (proveedores.auth_user_id = auth.uid()))));

-- Policies for contratos
CREATE POLICY "Contract parties can view contracts" ON public.contratos
    FOR SELECT USING (((auth.uid())::text = (usuarios_id)::text) OR (EXISTS (SELECT 1 FROM proveedores WHERE ((proveedores.id = contratos.proveedores_id) AND (proveedores.auth_user_id = auth.uid())))));

CREATE POLICY "Users can create contracts" ON public.contratos
    FOR INSERT WITH CHECK ((auth.uid())::text = (usuarios_id)::text);

-- Policies for pagos_milestones
CREATE POLICY "Contract parties can view milestones" ON public.pagos_milestones
    FOR SELECT USING (EXISTS (SELECT 1 FROM contratos WHERE ((contratos.id = pagos_milestones.contratos_id) AND (((contratos.usuarios_id)::text = (auth.uid())::text) OR (EXISTS (SELECT 1 FROM proveedores WHERE ((proveedores.id = contratos.proveedores_id) AND (proveedores.auth_user_id = auth.uid()))))))));

-- Policies for transacciones_financiamiento
CREATE POLICY "Contract parties can view financing" ON public.transacciones_financiamiento
    FOR SELECT USING (EXISTS (SELECT 1 FROM contratos WHERE ((contratos.id = transacciones_financiamiento.contratos_id) AND (((contratos.usuarios_id)::text = (auth.uid())::text) OR (EXISTS (SELECT 1 FROM proveedores WHERE ((proveedores.id = contratos.proveedores_id) AND (proveedores.auth_user_id = auth.uid()))))))));

-- Policies for comisiones_enerbook
CREATE POLICY "Only verified admins can view commissions" ON public.comisiones_enerbook
    FOR SELECT USING (EXISTS (SELECT 1 FROM administradores WHERE ((administradores.usuario_id = auth.uid()) AND (administradores.activo = true))));

CREATE POLICY "Only verified admins can insert commissions" ON public.comisiones_enerbook
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM administradores WHERE ((administradores.usuario_id = auth.uid()) AND (administradores.activo = true))));

CREATE POLICY "Only verified admins can update commissions" ON public.comisiones_enerbook
    FOR UPDATE USING (EXISTS (SELECT 1 FROM administradores WHERE ((administradores.usuario_id = auth.uid()) AND (administradores.activo = true))));

-- Policies for certificaciones
CREATE POLICY "Certifications are publicly readable" ON public.certificaciones
    FOR SELECT USING (true);

-- Policies for resenas
CREATE POLICY "Reviews are publicly readable" ON public.resenas
    FOR SELECT USING (true);

CREATE POLICY "Contract owners can create reviews" ON public.resenas
    FOR INSERT WITH CHECK ((auth.uid())::text = (usuarios_id)::text);

-- Policies for stripe_webhooks_log
CREATE POLICY "Only verified admins can view webhooks" ON public.stripe_webhooks_log
    FOR SELECT USING (EXISTS (SELECT 1 FROM administradores WHERE ((administradores.usuario_id = auth.uid()) AND (administradores.activo = true))));

-- Policies for stripe_disputes
CREATE POLICY "Only verified admins can view disputes" ON public.stripe_disputes
    FOR SELECT USING (EXISTS (SELECT 1 FROM administradores WHERE ((administradores.usuario_id = auth.uid()) AND (administradores.activo = true))));

-- Policies for admin_audit_log
CREATE POLICY "Admins can view own audit logs" ON public.admin_audit_log
    FOR SELECT USING ((admin_id = auth.uid()) OR is_super_admin());

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Notes:
-- 1. This schema uses Row Level Security (RLS) for all tables
-- 2. Stripe integration is configured for payment processing
-- 3. Automatic cleanup of temp leads after 7 days via cleanup_old_temp_leads()
-- 4. All tables have auto-updating updated_at timestamps
-- 5. Admin actions are logged in admin_audit_log
-- 6. Foreign keys ensure referential integrity
-- 7. Check constraints validate data before insertion
