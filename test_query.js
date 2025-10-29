const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testQuery() {
  const { data, error } = await supabase
    .from('contratos')
    .select(`
      id,
      numero_contrato,
      usuarios_id,
      cotizaciones_final_id,
      usuarios:usuarios_id (nombre, correo_electronico),
      cotizaciones_final:cotizaciones_final_id (
        proyectos_id,
        proyectos:proyectos_id (titulo)
      )
    `)
    .eq('id', 'a3b40c2d-1eb8-4d89-b6bb-9edf5d8df057')
    .single();
  
  console.log('Query result:', JSON.stringify({ data, error }, null, 2));
}

testQuery();
