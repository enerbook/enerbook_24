-- ============================================================================
-- ESQUEMA SUPABASE - SISTEMA DE COTIZACIONES SOLARES CON LÓGICA DE PAGOS
-- Solo estructura de tablas y relaciones
-- ============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- TABLA: usuarios
-- Descripción: Almacena información de los usuarios del sistema
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id                  uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at          timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at          timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre              text NOT NULL DEFAULT '',
    correo_electronico  text NOT NULL DEFAULT '',
    telefono            text,
    fecha_nacimiento    date,
    rfc                 text
);

-- RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver y modificar sus propios datos
CREATE POLICY "Users can view own data" ON usuarios
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON usuarios
    FOR UPDATE USING (auth.uid()::text = id::text);

-- ----------------------------------------------------------------------------
-- TABLA: irradiacion_cache
-- Descripción: Cache de datos de irradiación solar por ubicación geográfica
-- ----------------------------------------------------------------------------
CREATE TABLE irradiacion_cache (
    id                          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at                  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at                  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    lat_grid                    numeric NOT NULL,
    lng_grid                    numeric NOT NULL,
    radio_km                    integer DEFAULT 5,
    datos_nasa_mensuales        jsonb NOT NULL,
    irradiacion_promedio_min    numeric,
    irradiacion_promedio_max    numeric,
    irradiacion_promedio_anual  numeric,
    fecha_obtencion             timestamp with time zone DEFAULT timezone('utc'::text, now()),
    vigente_hasta               timestamp with time zone,
    hash_ubicacion              text NOT NULL UNIQUE,
    region_nombre               text
);

-- RLS
ALTER TABLE irradiacion_cache ENABLE ROW LEVEL SECURITY;

-- Política: Datos de irradiación son públicos para lectura
CREATE POLICY "Irradiation data is publicly readable" ON irradiacion_cache
    FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- TABLA: cotizaciones_inicial
-- Descripción: Cotizaciones iniciales basadas en consumo histórico del usuario
-- ----------------------------------------------------------------------------
CREATE TABLE cotizaciones_inicial (
    id                      uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    usuarios_id             uuid REFERENCES usuarios(id) ON DELETE CASCADE,
    recibo_cfe              jsonb,
    consumo_kwh_historico   jsonb,
    resumen_energetico      jsonb,
    sizing_results          jsonb,
    irradiacion_cache_id    uuid REFERENCES irradiacion_cache(id)
);

-- RLS
ALTER TABLE cotizaciones_inicial ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias cotizaciones iniciales
CREATE POLICY "Users can view own initial quotes" ON cotizaciones_inicial
    FOR SELECT USING (auth.uid()::text = usuarios_id::text);

CREATE POLICY "Users can insert own initial quotes" ON cotizaciones_inicial
    FOR INSERT WITH CHECK (auth.uid()::text = usuarios_id::text);

-- ----------------------------------------------------------------------------
-- TABLA: cotizaciones_leads_temp
-- Descripción: Cotizaciones temporales generadas por OCR antes del registro del usuario
-- ----------------------------------------------------------------------------
CREATE TABLE cotizaciones_leads_temp (
    id                      uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    temp_lead_id            text NOT NULL UNIQUE,
    recibo_cfe              jsonb,
    consumo_kwh_historico   jsonb,
    resumen_energetico      jsonb,
    sizing_results          jsonb,
    irradiacion_cache_id    uuid REFERENCES irradiacion_cache(id)
);

-- RLS
ALTER TABLE cotizaciones_leads_temp ENABLE ROW LEVEL SECURITY;

-- Política: Los temp quotes son públicos para lectura (sin autenticación requerida)
CREATE POLICY "Temp quotes are publicly readable" ON cotizaciones_leads_temp
    FOR SELECT USING (true);

-- Política: Inserción pública para el proceso de OCR
CREATE POLICY "Public can insert temp quotes" ON cotizaciones_leads_temp
    FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- TABLA: proveedores
-- Descripción: Información de proveedores de sistemas solares
-- ----------------------------------------------------------------------------
CREATE TABLE proveedores (
    id                              uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at                      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at                      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre                          text NOT NULL,
    email                           text,
    telefono                        text,
    direccion                       text,
    activo                          boolean DEFAULT true,
    auth_user_id                    uuid REFERENCES auth.users(id),
    -- Configuración de pagos
    acepta_financiamiento_externo   boolean DEFAULT false,
    comision_financiamiento_pct     numeric DEFAULT 6.0 CHECK (comision_financiamiento_pct >= 0 AND comision_financiamiento_pct <= 100),
    -- Stripe Connect Integration
    stripe_account_id               text UNIQUE,
    stripe_account_type             text CHECK (stripe_account_type IN ('express', 'standard', 'custom')),
    stripe_onboarding_completed     boolean DEFAULT false,
    stripe_charges_enabled          boolean DEFAULT false,
    stripe_payouts_enabled          boolean DEFAULT false,
    stripe_requirements             jsonb,
    stripe_onboarding_url           text,
    fecha_stripe_verificacion       timestamp with time zone
);

-- RLS
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

-- Política: Los proveedores son públicos para lectura
CREATE POLICY "Providers are publicly readable" ON proveedores
    FOR SELECT USING (activo = true);

-- Política: Solo el proveedor puede actualizar sus datos
CREATE POLICY "Providers can update own data" ON proveedores
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- ----------------------------------------------------------------------------
-- TABLA: certificaciones
-- Descripción: Certificaciones asociadas a los proveedores
-- ----------------------------------------------------------------------------
CREATE TABLE certificaciones (
    id              uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    proveedores_id  uuid REFERENCES proveedores(id) ON DELETE CASCADE,
    nombre          text NOT NULL,
    numero          text,
    fecha_emision   date,
    fecha_vencimiento date,
    archivo_url     text
);

-- RLS
ALTER TABLE certificaciones ENABLE ROW LEVEL SECURITY;

-- Política: Las certificaciones son públicas para lectura
CREATE POLICY "Certifications are publicly readable" ON certificaciones
    FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- TABLA: proyectos
-- Descripción: Proyectos posteados públicamente para que múltiples proveedores puedan cotizar
-- ----------------------------------------------------------------------------
CREATE TABLE proyectos (
    id                      uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    cotizaciones_inicial_id uuid REFERENCES cotizaciones_inicial(id) ON DELETE CASCADE,
    estado                  text DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado', 'adjudicado')),
    descripcion             text,
    fecha_limite            timestamp with time zone,
    titulo                  text NOT NULL,
    usuarios_id             uuid REFERENCES usuarios(id) ON DELETE CASCADE
);

-- RLS
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;

-- Política: Los proyectos abiertos son públicos para lectura
CREATE POLICY "Open projects are publicly readable" ON proyectos
    FOR SELECT USING (estado = 'abierto' OR auth.uid()::text = usuarios_id::text);

-- Política: Solo el dueño puede crear/actualizar proyectos
CREATE POLICY "Users can manage own projects" ON proyectos
    FOR ALL USING (auth.uid()::text = usuarios_id::text);

-- ----------------------------------------------------------------------------
-- TABLA: cotizaciones_final
-- Descripción: Cotizaciones detalladas de múltiples proveedores para un mismo proyecto
-- ----------------------------------------------------------------------------
CREATE TABLE cotizaciones_final (
    id                  uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at          timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at          timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    proyectos_id        uuid REFERENCES proyectos(id) ON DELETE CASCADE,
    proveedores_id      uuid REFERENCES proveedores(id) ON DELETE CASCADE,
    paneles             jsonb,
    inversores          jsonb,
    estructura          jsonb,
    sistema_electrico   jsonb,
    precio_final        jsonb,
    estado              text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
    notas_proveedor     text,
    -- Opciones de pago que ofrece el proveedor
    opciones_pago       jsonb, -- Array: [{"tipo":"upfront","precio":100000}, {"tipo":"milestones","config":[...]}, {"tipo":"financing","disponible":true}]
    
    UNIQUE (proyectos_id, proveedores_id)
);

-- RLS
ALTER TABLE cotizaciones_final ENABLE ROW LEVEL SECURITY;

-- Política: Los dueños de proyectos pueden ver todas las cotizaciones de sus proyectos
CREATE POLICY "Project owners can view all quotes" ON cotizaciones_final
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM proyectos 
            WHERE proyectos.id = cotizaciones_final.proyectos_id 
            AND proyectos.usuarios_id::text = auth.uid()::text
        )
    );

-- Política: Los proveedores pueden ver y gestionar sus propias cotizaciones
CREATE POLICY "Providers can manage own quotes" ON cotizaciones_final
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM proveedores 
            WHERE proveedores.id = cotizaciones_final.proveedores_id 
            AND proveedores.auth_user_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- TABLA: contratos
-- Descripción: Contratos generados cuando se acepta una cotización
-- ----------------------------------------------------------------------------
CREATE TABLE contratos (
    id                          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at                  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at                  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    cotizaciones_final_id       uuid REFERENCES cotizaciones_final(id) ON DELETE CASCADE UNIQUE,
    usuarios_id                 uuid REFERENCES usuarios(id) ON DELETE CASCADE,
    proveedores_id              uuid REFERENCES proveedores(id) ON DELETE CASCADE,
    
    -- Información del contrato
    numero_contrato             text NOT NULL UNIQUE,
    precio_total_sistema        numeric NOT NULL,
    tipo_pago_seleccionado      text NOT NULL CHECK (tipo_pago_seleccionado IN ('upfront', 'milestones', 'financing')),
    
    -- Configuración específica del pago elegido (se guarda como JSON)
    configuracion_pago          jsonb NOT NULL,
    
    -- Estado del contrato
    estado                      text DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
    fecha_firma                 timestamp with time zone DEFAULT timezone('utc'::text, now()),
    fecha_inicio_instalacion    timestamp with time zone,
    fecha_completado            timestamp with time zone,
    
    -- Documentos
    archivo_contrato_url        text,
    documentos_adicionales      jsonb,
    
    -- Stripe Payment Intent Tracking
    stripe_payment_intent_id    text,
    stripe_client_secret        text,
    estado_pago                 text DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'processing', 'succeeded', 'canceled', 'requires_action')),
    stripe_application_fee_amount numeric,
    stripe_transfer_id          text
);

-- RLS
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

-- Política: Solo las partes involucradas pueden ver el contrato
CREATE POLICY "Contract parties can view contracts" ON contratos
    FOR SELECT USING (
        auth.uid()::text = usuarios_id::text OR 
        EXISTS (
            SELECT 1 FROM proveedores 
            WHERE proveedores.id = contratos.proveedores_id 
            AND proveedores.auth_user_id = auth.uid()
        )
    );

-- Política: Solo el usuario puede crear contratos
CREATE POLICY "Users can create contracts" ON contratos
    FOR INSERT WITH CHECK (auth.uid()::text = usuarios_id::text);

-- ----------------------------------------------------------------------------
-- TABLA: pagos_milestones
-- Descripción: Pagos por hitos para contratos con tipo_pago = 'milestones'
-- ----------------------------------------------------------------------------
CREATE TABLE pagos_milestones (
    id                      uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    contratos_id            uuid REFERENCES contratos(id) ON DELETE CASCADE,
    
    -- Información del milestone
    numero_milestone        integer NOT NULL,
    nombre_milestone        text NOT NULL, -- "Acepta oferta", "Inicio instalación", "Entrega"
    descripcion             text,
    porcentaje_pago         numeric NOT NULL CHECK (porcentaje_pago > 0 AND porcentaje_pago <= 100),
    monto_pago              numeric NOT NULL,
    
    -- Estado y fechas
    estado                  text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'vencido')),
    fecha_objetivo          timestamp with time zone,
    fecha_completado        timestamp with time zone,
    
    -- Comisión Enerbook para este milestone
    comision_enerbook_monto numeric NOT NULL DEFAULT 0,
    comision_pagada         boolean DEFAULT false,
    fecha_pago_comision     timestamp with time zone,
    
    -- Evidencia
    documentos_evidencia    jsonb,
    
    -- Stripe Individual Payment Intents
    stripe_payment_intent_id text,
    stripe_transfer_id      text,
    stripe_application_fee_amount numeric,
    stripe_client_secret    text,
    
    UNIQUE (contratos_id, numero_milestone)
);

-- RLS
ALTER TABLE pagos_milestones ENABLE ROW LEVEL SECURITY;

-- Política: Solo las partes del contrato pueden ver los milestones
CREATE POLICY "Contract parties can view milestones" ON pagos_milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contratos 
            WHERE contratos.id = pagos_milestones.contratos_id 
            AND (
                contratos.usuarios_id::text = auth.uid()::text OR 
                EXISTS (
                    SELECT 1 FROM proveedores 
                    WHERE proveedores.id = contratos.proveedores_id 
                    AND proveedores.auth_user_id = auth.uid()
                )
            )
        )
    );

-- ----------------------------------------------------------------------------
-- TABLA: transacciones_financiamiento
-- Descripción: Financiamiento externo para contratos con tipo_pago = 'financing'
-- ----------------------------------------------------------------------------
CREATE TABLE transacciones_financiamiento (
    id                          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at                  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at                  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    contratos_id                uuid REFERENCES contratos(id) ON DELETE CASCADE UNIQUE,
    
    -- Información del financiamiento
    proveedor_financiero        text NOT NULL, -- Nombre del lender/banco
    monto_financiado            numeric NOT NULL, -- Monto que financia el lender al proveedor
    tasa_interes               numeric NOT NULL,
    plazo_meses                integer NOT NULL,
    pago_mensual               numeric NOT NULL, -- Lo que paga el cliente mensualmente al lender
    
    -- Service/Booking fee de Enerbook (LO PAGA EL CLIENTE)
    service_fee_porcentaje     numeric NOT NULL DEFAULT 6.0, -- 4-8% según imagen
    service_fee_monto          numeric NOT NULL, -- Fee que paga el cliente a Enerbook
    service_fee_pagado_cliente boolean DEFAULT false, -- Cliente pagó el service fee
    fecha_pago_service_fee     timestamp with time zone,
    
    -- Stripe Service Fee Payment
    stripe_service_fee_payment_intent_id text,
    stripe_service_fee_client_secret text,
    
    -- Estado del financiamiento
    estado                     text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'desembolsado')),
    fecha_aprobacion           timestamp with time zone,
    fecha_desembolso           timestamp with time zone, -- Cuando el lender paga al proveedor
    fecha_primer_pago_cliente  timestamp with time zone, -- Primer pago del cliente al lender
    
    -- Información del crédito
    numero_credito             text,
    documentos_credito         jsonb
);

-- RLS
ALTER TABLE transacciones_financiamiento ENABLE ROW LEVEL SECURITY;

-- Política: Solo las partes del contrato pueden ver el financiamiento
CREATE POLICY "Contract parties can view financing" ON transacciones_financiamiento
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contratos 
            WHERE contratos.id = transacciones_financiamiento.contratos_id 
            AND (
                contratos.usuarios_id::text = auth.uid()::text OR 
                EXISTS (
                    SELECT 1 FROM proveedores 
                    WHERE proveedores.id = contratos.proveedores_id 
                    AND proveedores.auth_user_id = auth.uid()
                )
            )
        )
    );

-- ----------------------------------------------------------------------------
-- TABLA: comisiones_enerbook
-- Descripción: Registro de todas las comisiones cobradas por Enerbook
-- ----------------------------------------------------------------------------
CREATE TABLE comisiones_enerbook (
    id                      uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    contratos_id            uuid REFERENCES contratos(id) ON DELETE CASCADE,
    
    -- Tipo de comisión según modelo de pago
    tipo_comision           text NOT NULL CHECK (tipo_comision IN ('upfront_withhold', 'milestone_prorrateado', 'service_fee_cliente')),
    
    -- Quién paga la comisión
    pagador                 text NOT NULL CHECK (pagador IN ('cliente', 'proveedor')),
    
    -- Montos
    monto_base              numeric NOT NULL,
    porcentaje_comision     numeric NOT NULL,
    monto_comision          numeric NOT NULL,
    
    -- Referencias a milestone o financiamiento específico
    milestone_id            uuid REFERENCES pagos_milestones(id),
    financiamiento_id       uuid REFERENCES transacciones_financiamiento(id),
    
    -- Estado del cobro
    estado                  text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'cobrado', 'reembolsado')),
    fecha_cobro             timestamp with time zone,
    fecha_pago_proveedor    timestamp with time zone, -- Solo si pagador = 'proveedor'
    
    -- Detalles
    descripcion             text,
    referencia_pago         text,
    
    -- Stripe Fee Tracking
    stripe_application_fee_id text,
    stripe_transfer_id      text,
    stripe_charge_id        text,
    stripe_refund_id        text
);

-- RLS
ALTER TABLE comisiones_enerbook ENABLE ROW LEVEL SECURITY;

-- Política: Solo administradores pueden ver comisiones
CREATE POLICY "Admin can view commissions" ON comisiones_enerbook
    FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- TABLA: resenas
-- Descripción: Reseñas del proveedor para el contrato completado
-- ----------------------------------------------------------------------------
CREATE TABLE resenas (
    id                          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at                  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at                  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    contratos_id                uuid REFERENCES contratos(id) ON DELETE CASCADE UNIQUE,
    puntuacion                  integer NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario                  text,
    usuarios_id                 uuid REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Puntuaciones específicas
    puntuacion_calidad          integer CHECK (puntuacion_calidad >= 1 AND puntuacion_calidad <= 5),
    puntuacion_tiempo           integer CHECK (puntuacion_tiempo >= 1 AND puntuacion_tiempo <= 5),
    puntuacion_comunicacion     integer CHECK (puntuacion_comunicacion >= 1 AND puntuacion_comunicacion <= 5),
    recomendaria                boolean,
    fotos_instalacion           jsonb
);

-- RLS
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

-- Política: Las reseñas son públicas para lectura
CREATE POLICY "Reviews are publicly readable" ON resenas
    FOR SELECT USING (true);

-- Política: Solo el dueño del contrato puede crear reseñas
CREATE POLICY "Contract owners can create reviews" ON resenas
    FOR INSERT WITH CHECK (auth.uid()::text = usuarios_id::text);

-- ============================================================================
-- TRIGGERS PARA updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_irradiacion_cache_updated_at BEFORE UPDATE ON irradiacion_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cotizaciones_inicial_updated_at BEFORE UPDATE ON cotizaciones_inicial FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cotizaciones_leads_temp_updated_at BEFORE UPDATE ON cotizaciones_leads_temp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON proveedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificaciones_updated_at BEFORE UPDATE ON certificaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cotizaciones_final_updated_at BEFORE UPDATE ON cotizaciones_final FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagos_milestones_updated_at BEFORE UPDATE ON pagos_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transacciones_financiamiento_updated_at BEFORE UPDATE ON transacciones_financiamiento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comisiones_enerbook_updated_at BEFORE UPDATE ON comisiones_enerbook FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resenas_updated_at BEFORE UPDATE ON resenas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- TABLA: stripe_webhooks_log
-- Descripción: Log de webhooks de Stripe para auditoria y reintento
-- ----------------------------------------------------------------------------
CREATE TABLE stripe_webhooks_log (
    id                      uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    stripe_event_id         text NOT NULL UNIQUE,
    event_type              text NOT NULL,
    processed               boolean DEFAULT false,
    processing_attempts     integer DEFAULT 0,
    error_message           text,
    event_data              jsonb NOT NULL,
    related_contract_id     uuid REFERENCES contratos(id),
    related_milestone_id    uuid REFERENCES pagos_milestones(id)
);

-- RLS
ALTER TABLE stripe_webhooks_log ENABLE ROW LEVEL SECURITY;

-- Política: Solo administradores pueden ver webhooks
CREATE POLICY "Admin can view webhooks" ON stripe_webhooks_log
    FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- TABLA: stripe_disputes
-- Descripción: Disputas de Stripe para tracking de chargebacks
-- ----------------------------------------------------------------------------
CREATE TABLE stripe_disputes (
    id                      uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at              timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    stripe_dispute_id       text NOT NULL UNIQUE,
    stripe_charge_id        text NOT NULL,
    contratos_id            uuid REFERENCES contratos(id),
    amount                  numeric NOT NULL,
    currency                text DEFAULT 'mxn',
    reason                  text,
    status                  text,
    evidence_due_by         timestamp with time zone,
    resolved_at             timestamp with time zone
);

-- RLS
ALTER TABLE stripe_disputes ENABLE ROW LEVEL SECURITY;

-- Política: Solo administradores pueden ver disputas
CREATE POLICY "Admin can view disputes" ON stripe_disputes
    FOR SELECT USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_stripe_disputes_updated_at BEFORE UPDATE ON stripe_disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================================================

-- Índices originales
CREATE INDEX idx_cotizaciones_inicial_usuarios_id ON cotizaciones_inicial(usuarios_id);
CREATE INDEX idx_cotizaciones_leads_temp_temp_lead_id ON cotizaciones_leads_temp(temp_lead_id);
CREATE INDEX idx_cotizaciones_leads_temp_created_at ON cotizaciones_leads_temp(created_at);
CREATE INDEX idx_cotizaciones_leads_temp_irradiacion_cache_id ON cotizaciones_leads_temp(irradiacion_cache_id);
CREATE INDEX idx_proyectos_usuarios_id ON proyectos(usuarios_id);
CREATE INDEX idx_proyectos_estado ON proyectos(estado);
CREATE INDEX idx_cotizaciones_final_proyectos_id ON cotizaciones_final(proyectos_id);
CREATE INDEX idx_cotizaciones_final_proveedores_id ON cotizaciones_final(proveedores_id);
CREATE INDEX idx_cotizaciones_final_estado ON cotizaciones_final(estado);
CREATE INDEX idx_irradiacion_cache_hash ON irradiacion_cache(hash_ubicacion);

-- Índices para nuevas tablas de pagos
CREATE INDEX idx_contratos_usuarios_id ON contratos(usuarios_id);
CREATE INDEX idx_contratos_proveedores_id ON contratos(proveedores_id);
CREATE INDEX idx_contratos_estado ON contratos(estado);
CREATE INDEX idx_contratos_tipo_pago ON contratos(tipo_pago_seleccionado);
CREATE INDEX idx_pagos_milestones_contratos_id ON pagos_milestones(contratos_id);
CREATE INDEX idx_pagos_milestones_estado ON pagos_milestones(estado);
CREATE INDEX idx_transacciones_financiamiento_contratos_id ON transacciones_financiamiento(contratos_id);
CREATE INDEX idx_comisiones_enerbook_contratos_id ON comisiones_enerbook(contratos_id);
CREATE INDEX idx_comisiones_enerbook_tipo ON comisiones_enerbook(tipo_comision);
CREATE INDEX idx_comisiones_enerbook_estado ON comisiones_enerbook(estado);

-- Índices para Stripe Connect
CREATE INDEX idx_proveedores_stripe_account_id ON proveedores(stripe_account_id);
CREATE INDEX idx_contratos_stripe_payment_intent ON contratos(stripe_payment_intent_id);
CREATE INDEX idx_contratos_estado_pago ON contratos(estado_pago);
CREATE INDEX idx_milestones_stripe_payment_intent ON pagos_milestones(stripe_payment_intent_id);
CREATE INDEX idx_webhooks_event_id ON stripe_webhooks_log(stripe_event_id);
CREATE INDEX idx_webhooks_processed ON stripe_webhooks_log(processed, created_at);
CREATE INDEX idx_disputes_stripe_dispute_id ON stripe_disputes(stripe_dispute_id);
CREATE INDEX idx_disputes_contratos_id ON stripe_disputes(contratos_id);
CREATE INDEX idx_comisiones_stripe_application_fee ON comisiones_enerbook(stripe_application_fee_id);
CREATE INDEX idx_comisiones_stripe_transfer ON comisiones_enerbook(stripe_transfer_id);

-- ============================================================================
-- RELACIONES Y FLUJO DEL SISTEMA:
--
-- irradiacion_cache → cotizaciones_leads_temp (1:N) - Temp quotes antes de registro
-- cotizaciones_leads_temp → cotizaciones_inicial (1:1) - Migración tras registro
-- usuarios → cotizaciones_inicial (1:N)
-- irradiacion_cache → cotizaciones_inicial (1:N)
-- cotizaciones_inicial → proyectos (1:1)
-- usuarios → proyectos (1:N)
-- proyectos → cotizaciones_final (1:N) - MÚLTIPLES PROVEEDORES POR PROYECTO
-- proveedores → cotizaciones_final (1:N)
-- proveedores → certificaciones (1:N)
-- cotizaciones_final → contratos (1:1) - La cotización seleccionada genera contrato
-- contratos → pagos_milestones (1:N) - Si tipo_pago = 'milestones'
-- contratos → transacciones_financiamiento (1:1) - Si tipo_pago = 'financing'
-- contratos → comisiones_enerbook (1:N) - Registro de todas las comisiones
-- contratos → resenas (1:1) - Solo contratos completados se reseñan
-- pagos_milestones → comisiones_enerbook (1:N) - Comisiones por milestone
-- transacciones_financiamiento → comisiones_enerbook (1:1) - Booking fee
-- 
-- FLUJO DEL SISTEMA:
-- 0. Usuario sube recibo CFE → OCR procesa → Se guarda en cotizaciones_leads_temp
-- 1. Usuario se registra → Se migra temp quote a cotizaciones_inicial
-- 2. Se crea proyecto público basado en cotización inicial
-- 3. Múltiples proveedores envían cotizaciones finales con opciones_pago
-- 4. Usuario selecciona una cotización y tipo de pago específico
-- 5. Se genera contrato con configuracion_pago seleccionada
-- 6. Según tipo_pago se crean registros en:
--    - pagos_milestones (si milestones)
--    - transacciones_financiamiento (si financing)
-- 7. Se van registrando comisiones_enerbook según el modelo
-- 8. Al completar se puede crear reseña
-- 
-- MODELOS DE COMISIÓN (manejados en backend):
-- 1. upfront: Enerbook retiene % del pago único (PROVEEDOR paga comisión vía retención)
-- 2. milestones: Comisión prorrateada por cada hito completado (PROVEEDOR paga comisión vía retención)
-- 3. financing: Service fee pagado por CLIENTE al aceptar financiamiento (4-8% del total)
--
-- FLUJO DE FINANCIAMIENTO:
-- - Cliente elige financiamiento y acepta pagar service fee a Enerbook
-- - Lender aprueba crédito y desembolsa monto_financiado al proveedor
-- - Cliente paga service fee a Enerbook (checkout inmediato)
-- - Cliente paga cuotas mensuales al lender directamente
-- ============================================================================