import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import {
  CORS_HEADERS,
  HTTP_METHODS,
  HTTP_STATUS,
  STRIPE_CONFIG,
  DEEP_LINKS,
  ERROR_MESSAGES,
} from '../_shared/constants.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === HTTP_METHODS.OPTIONS) {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: STRIPE_CONFIG.apiVersion,
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request body
    const { instalador_id, email, phone } = await req.json()

    // Validate required fields
    if (!instalador_id || !email) {
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.missingStripeFields }),
        {
          status: HTTP_STATUS.BAD_REQUEST,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if proveedor already has a Stripe account
    const { data: existingProveedor, error: fetchError } = await supabaseClient
      .from('proveedores')
      .select('stripe_account_id')
      .eq('id', instalador_id)
      .single()

    if (fetchError) {
      console.error('Error fetching proveedor:', fetchError)
      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.proveedorNotFound }),
        {
          status: HTTP_STATUS.NOT_FOUND,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }

    // If already has a Stripe account, retrieve existing account and create new onboarding link
    if (existingProveedor.stripe_account_id) {
      console.log('Stripe account already exists:', existingProveedor.stripe_account_id)

      // Retrieve account to check status
      const account = await stripe.accounts.retrieve(existingProveedor.stripe_account_id)

      // Create new account link for re-onboarding or completing onboarding
      const accountLink = await stripe.accountLinks.create({
        account: existingProveedor.stripe_account_id,
        refresh_url: DEEP_LINKS.stripeRefresh,
        return_url: DEEP_LINKS.stripeSuccess,
        type: STRIPE_CONFIG.onboarding.type,
      })

      return new Response(
        JSON.stringify({
          success: true,
          account_id: existingProveedor.stripe_account_id,
          url: accountLink.url,
          account_status: account.charges_enabled ? 'active' : 'pending',
        }),
        {
          status: HTTP_STATUS.OK,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create new Stripe Connect account
    console.log('Creating new Stripe Connect account for:', email)
    const account = await stripe.accounts.create({
      type: STRIPE_CONFIG.connect.type,
      country: STRIPE_CONFIG.connect.country,
      email: email,
      capabilities: STRIPE_CONFIG.connect.capabilities,
      business_type: STRIPE_CONFIG.connect.businessType,
      settings: {
        payouts: {
          schedule: STRIPE_CONFIG.connect.payoutSchedule,
        },
      },
    })

    console.log('Stripe account created:', account.id)

    // Update proveedor with stripe_account_id
    const { error: updateError } = await supabaseClient
      .from('proveedores')
      .update({
        stripe_account_id: account.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', instalador_id)

    if (updateError) {
      console.error('Error updating proveedor:', updateError)
      // Note: Stripe account was created, but database update failed
      // This should be logged and handled manually
      return new Response(
        JSON.stringify({
          error: ERROR_MESSAGES.databaseUpdateFailed,
          account_id: account.id,
          details: updateError.message
        }),
        {
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: DEEP_LINKS.stripeRefresh,
      return_url: DEEP_LINKS.stripeSuccess,
      type: STRIPE_CONFIG.onboarding.type,
    })

    console.log('Account link created:', accountLink.url)

    return new Response(
      JSON.stringify({
        success: true,
        account_id: account.id,
        url: accountLink.url,
        message: 'Stripe Connect account created successfully'
      }),
      {
        status: HTTP_STATUS.OK,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in stripe_connect_onboard:', error)
    return new Response(
      JSON.stringify({
        error: error.message || ERROR_MESSAGES.internalServerError,
        details: error.toString()
      }),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    )
  }
})