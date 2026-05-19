import { supabaseAdmin } from './supabase.js';

export async function connectDb() {
  const { error } = await supabaseAdmin.from('events').select('id').limit(1);
  if (error) {
    throw new Error(`No se pudo conectar a Supabase. Verifica schema.sql y variables: ${error.message}`);
  }
  console.log('Supabase conectado');
}
