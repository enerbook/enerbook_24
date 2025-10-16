import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    const body = await req.json()

    // Extract and clean values (trim whitespace)
    const proyecto_id = body.proyecto_id?.toString().trim()
    const cliente_id = body.cliente_id?.toString().trim()
    const instalador_input = body.instalador_id?.toString().trim()
    const payment_method = body.payment_method?.toString().trim()
    const total_amount = body.total_amount
    const platform_fee = body.platform_fee
    const installer_amount = body.installer_amount
    const stripe_payment_intent_id = body.stripe_payment_intent_id?.toString().trim()
    const stripe_customer_id = body.stripe_customer_id?.toString().trim()
    const stripe_status = body.status?.toString().trim()

    // Map Stripe status to our database status
    const statusMap: Record<string, string> = {
      'requires_payment_method': 'processing',
      'requires_confirmation': 'processing',
      'requires_action': 'requires_action',
      'processing': 'processing',
      'requires_capture': 'processing',
      'canceled': 'canceled',
      'succeeded': 'succeeded',
    }

    const status = statusMap[stripe_status] || 'processing'

    // Validate required fields
    if (!proyecto_id || !cliente_id || !instalador_input || !total_amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if instalador_input is a UUID or stripe_account_id
    let instalador_id = instalador_input

    // If it starts with "acct_", it's a stripe_account_id, lookup the UUID
    if (instalador_input.startsWith('acct_')) {
      const { data: instalador, error: instaladorError } = await supabaseClient
        .from('proveedores')
        .select('id')
        .eq('stripe_account_id', instalador_input)
        .single()

      if (instaladorError || !instalador) {
        console.error('Error finding instalador:', instaladorError)
        return new Response(
          JSON.stringify({
            error: 'Instalador not found with stripe_account_id: ' + instalador_input,
            details: instaladorError?.message
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      instalador_id = instalador.id
    }

    // Insert payment record
    const { data, error } = await supabaseClient
      .from('pagos')
      .insert({
        proyecto_id,
        cliente_id,
        instalador_id,
        payment_method,
        total_amount,
        platform_fee,
        installer_amount,
        stripe_payment_intent_id,
        stripe_customer_id,
        status,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting payment:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})