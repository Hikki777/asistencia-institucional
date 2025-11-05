const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🧪 Probando autenticación...\n');

  try {
    // 1. Test login
    console.log('1️⃣  Intentando login...');
    const loginResp = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.edu',
      password: 'admin'
    });
    
    console.log('   ✅ Login exitoso');
    console.log('   📧 Usuario:', loginResp.data.user.email);
    console.log('   🔑 Rol:', loginResp.data.user.rol);
    const token = loginResp.data.accessToken;
    console.log('   🎫 Token recibido:', token.substring(0, 50) + '...\n');

    // 2. Test /auth/me con token
    console.log('2️⃣  Consultando perfil (/auth/me)...');
    const meResp = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Perfil obtenido');
    console.log('   📧 Email:', meResp.data.email);
    console.log('   🔑 Rol:', meResp.data.rol);
    console.log('   📅 Creado:', new Date(meResp.data.creado_en).toLocaleString('es-ES'), '\n');

    // 3. Test alumnos con token
    console.log('3️⃣  Listando alumnos (ruta protegida)...');
    const alumnosResp = await axios.get(`${BASE_URL}/alumnos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Alumnos:', alumnosResp.data.total);
    console.log('   📋 Mostrando:', alumnosResp.data.count, '\n');

    // 4. Test diagnóstico con token
    console.log('4️⃣  Ejecutando diagnóstico (ruta protegida)...');
    const diagResp = await axios.get(`${BASE_URL}/diagnostics/qrs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Diagnóstico ejecutado');
    console.log('   📊 QRs totales:', diagResp.data.total_qrs);
    console.log('   ⚠️  Faltantes:', diagResp.data.missing);
    console.log('   ❌ Corruptos:', diagResp.data.corrupt, '\n');

    // 5. Test sin token (debe fallar)
    console.log('5️⃣  Intentando acceder sin token (debe fallar)...');
    try {
      await axios.get(`${BASE_URL}/alumnos`);
      console.log('   ❌ ERROR: Debió rechazar sin token');
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('   ✅ Correctamente rechazado: 401 Unauthorized');
        console.log('   💬 Mensaje:', err.response.data.error, '\n');
      } else {
        throw err;
      }
    }

    console.log('═══════════════════════════════════════');
    console.log('🎉 TODAS LAS PRUEBAS DE AUTH PASARON ✅');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBAS:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Mensaje:', error.message);
    }
    process.exit(1);
  }
}

testAuth();
