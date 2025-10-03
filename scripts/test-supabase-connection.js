/**
 * Script de prueba para verificar conexión a Supabase
 *
 * Uso: node test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 Verificando conexión a Supabase...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('   EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

console.log('✅ Variables de entorno configuradas');
console.log('   URL:', supabaseUrl);
console.log('   Key:', supabaseAnonKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('📡 Intentando consultar landing_stats...\n');

    const { data, error } = await supabase
      .from('landing_stats')
      .select('proyectos_realizados, reduccion_promedio_recibos, energia_producida_anual, estados_cobertura, notas')
      .eq('activo', true)
      .single();

    if (error) {
      console.error('❌ Error al consultar Supabase:');
      console.error('   Código:', error.code);
      console.error('   Mensaje:', error.message);
      console.error('   Detalles:', error.details);
      console.error('   Hint:', error.hint);
      return;
    }

    if (data) {
      console.log('✅ Conexión exitosa! Datos recibidos:\n');
      console.log('   Proyectos realizados:', data.proyectos_realizados);
      console.log('   Reducción promedio:', data.reduccion_promedio_recibos + '%');
      console.log('   Energía producida:', data.energia_producida_anual, 'kWh');
      console.log('   Estados con cobertura:', data.estados_cobertura);
      console.log('   Notas:', data.notas);
      console.log('\n✅ TODO FUNCIONA CORRECTAMENTE\n');
    } else {
      console.warn('⚠️  No se encontraron datos (pero la conexión funciona)');
    }

  } catch (err) {
    console.error('❌ Excepción al conectar:');
    console.error('   ', err.message);
  }
}

testConnection();
