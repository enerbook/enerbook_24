/**
 * Shared Constants for Supabase Edge Functions
 * Centralized configuration for HTTP, Stripe, and error handling
 */

// HTTP Configuration
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const HTTP_METHODS = {
  OPTIONS: 'OPTIONS',
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Stripe Configuration
export const STRIPE_CONFIG = {
  apiVersion: '2023-10-16' as const,
  accountPrefix: 'acct_',
  connect: {
    type: 'standard' as const,
    country: 'MX',
    businessType: 'individual' as const,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    payoutSchedule: {
      interval: 'manual' as const,
    },
  },
  onboarding: {
    type: 'account_onboarding' as const,
  },
};

// Payment Status Mapping (Stripe -> Internal)
export const STRIPE_STATUS_MAP: Record<string, string> = {
  'requires_payment_method': 'processing',
  'requires_confirmation': 'processing',
  'requires_action': 'processing',
  'processing': 'processing',
  'requires_capture': 'processing',
  'canceled': 'failed',
  'succeeded': 'completed',
};

// Deep Links
export const DEEP_LINKS = {
  stripeRefresh: 'enerbook://stripe-refresh',
  stripeSuccess: 'enerbook://stripe-success',
};

// Error Messages
export const ERROR_MESSAGES = {
  // Payment record errors
  missingRequiredFields: 'Missing required fields',
  instaladorNotFound: 'Instalador not found with stripe_account_id',
  paymentRecordCreationFailed: 'Failed to create payment record',

  // Stripe onboard errors
  missingStripeFields: 'Missing required fields: instalador_id, email',
  proveedorNotFound: 'Proveedor not found',
  databaseUpdateFailed: 'Failed to update database',

  // Generic errors
  internalServerError: 'Internal server error',
};

// Database Tables
export const DB_TABLES = {
  instaladores: 'instaladores',
  pagos: 'pagos',
};

// Database Columns
export const DB_COLUMNS = {
  instaladores: {
    id: 'id',
    stripeAccountId: 'stripe_account_id',
    stripeOnboardingComplete: 'stripe_onboarding_complete',
  },
  pagos: {
    proyectoId: 'proyecto_id',
    instaladorId: 'instalador_id',
    clienteId: 'cliente_id',
    stripePaymentIntentId: 'stripe_payment_intent_id',
    amount: 'amount',
    status: 'status',
    createdAt: 'created_at',
  },
};