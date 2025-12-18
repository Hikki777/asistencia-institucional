// Test de conexión directa a Supabase
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 segundos timeout
});

async function testConnection() {
  try {
    console.log('🔄 Intentando conectar a Supabase...');
    console.log('URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Ocultar password
    
    await client.connect();
    console.log('✅ Conexión exitosa!');
    
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Hora del servidor:', result.rows[0].now);
    
    await client.end();
    console.log('✅ Prueba completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Código de error:', error.code);
    process.exit(1);
  }
}

testConnection();
