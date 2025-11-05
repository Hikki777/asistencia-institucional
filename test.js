#!/usr/bin/env node

/**
 * Script de prueba básica del sistema
 * Ejecutar: node test.js
 * Requiere: servidor ejecutándose en http://localhost:5000
 * 
 * IMPORTANTE: No importar prismaClient para evitar desconexiones
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TIMEOUT = 10000; // 10 segundos

const tests = [];
let authToken = null; // Token JWT para autenticación

// Crear instancia de axios sin Prisma
const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  validateStatus: () => true // No lanzar errores en status >=400
});

// Interceptor para agregar token a las peticiones protegidas
api.interceptors.request.use((config) => {
  if (authToken && !config.url.includes('/auth/login')) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

async function test(nombre, fn) {
  try {
    console.log(`\n📋 ${nombre}...`);
    await fn();
    console.log(`✅ PASSED`);
    tests.push({ nombre, status: 'PASSED' });
  } catch (error) {
    const msg = error.response?.data?.error || error.message || String(error) || 'Error desconocido';
    console.error(`❌ FAILED: ${msg}`);
    if (error.response?.status) console.error(`   └─ HTTP ${error.response.status}`);
    tests.push({ nombre, status: 'FAILED', error: msg });
  }
}

async function runTests() {
  console.log('\n🧪 INICIANDO PRUEBAS DEL SISTEMA\n');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms\n`);

  // Test 0: Login y obtener token
  await test('0️⃣  Autenticación (Login)', async () => {
    const res = await api.post('/auth/login', {
      email: 'admin@test.edu',
      password: 'admin'
    });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}: ${res.data.error || 'Login falló'}`);
    if (!res.data.accessToken) throw new Error('No se recibió token');
    authToken = res.data.accessToken;
    console.log(`   └─ Token obtenido: ${authToken.substring(0, 20)}...`);
    console.log(`   └─ Usuario: ${res.data.user.email} (${res.data.user.rol})`);
  });

  // Test 1: Health Check
  await test('1️⃣  Health Check', async () => {
    console.log(`   └─ Conectando a ${BASE_URL}/health...`);
    const res = await api.get('/health');
    console.log(`   └─ Respuesta: ${res.status}, ${JSON.stringify(res.data).substring(0, 100)}`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (res.data.status !== 'ok') throw new Error('Status no es ok');
    console.log(`   └─ Uptime: ${Math.round(res.data.uptime)}s`);
  });

  // Test 2: Inicializar institución
  await test('2️⃣  Inicializar Institución', async () => {
    const minPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const res = await api.post('/institucion/init', {
      nombre: 'Colegio de Prueba QR',
      horario_inicio: '07:00',
      margen_puntualidad_min: 5,
      logo_base64: minPng,
      admin_email: 'admin@test.edu',
      admin_password: 'Test123!'
    });

    if (res.status === 400 && res.data.error?.includes('ya está inicializada')) {
      console.log(`   └─ Ya estaba inicializada (ignorado)`);
      return; // No es un error, ya existe
    }

    if (res.status !== 201 && res.status !== 200) throw new Error(`HTTP ${res.status}: ${res.data.error}`);
    if (!res.data.success) throw new Error('success no es true');
    console.log(`   └─ Admin: ${res.data.admin.email} (${res.data.admin.rol})`);
  });

  // Test 3: Obtener institución
  await test('3️⃣  Obtener Institución', async () => {
    const res = await api.get('/institucion');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    console.log(`   └─ Nombre: ${res.data.nombre}`);
    console.log(`   └─ Inicializado: ${res.data.inicializado}`);
  });

  // Test 4: Crear alumno
  let alumnoIdParaQR = null;
  await test('4️⃣  Crear Alumno', async () => {
    const res = await api.post('/alumnos', {
      carnet: `A${Date.now()}`,
      nombres: 'Juan',
      apellidos: 'Pérez García',
      grado: '6to',
      jornada: 'Matutina'
    });
    if (res.status !== 201) throw new Error(`HTTP ${res.status}: ${res.data.error || JSON.stringify(res.data)}`);
    
    // Guardar ID para usar en pruebas posteriores
    alumnoIdParaQR = res.data.data?.id || res.data.id;
    if (!alumnoIdParaQR) throw new Error('No se encontró ID del alumno: ' + JSON.stringify(res.data));
    
    console.log(`   └─ Alumno creado: ${res.data.data?.carnet || 'SIN CARNET'}`);
    console.log(`   └─ ID: ${alumnoIdParaQR}`);
  });

  // Test 5: Listar alumnos
  await test('5️⃣  Listar Alumnos', async () => {
    const res = await api.get('/alumnos');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    console.log(`   └─ Total de alumnos: ${res.data.total}`);
    if (res.data.data && res.data.data.length > 0) {
      console.log(`   └─ Primer alumno: ${res.data.data[0].nombres}`);
    }
  });

  // Test 6: Generar QR
  await test('6️⃣  Generar QR', async () => {
    if (!alumnoIdParaQR) {
      throw new Error('No hay ID de alumno disponible (Test 4 falló)');
    }

    const res = await api.post('/qr/generar', {
      persona_tipo: 'alumno',
      persona_id: alumnoIdParaQR
    });

    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`HTTP ${res.status}: ${res.data.error || JSON.stringify(res.data)}`);
    }
    
    console.log(`   └─ QR creado correctamente`);
    console.log(`   └─ Token: ${(res.data.data?.token || 'SIN TOKEN').substring(0, 30)}...`);
  });

  // Test 7: Listar QR
  await test('7️⃣  Listar QR', async () => {
    const res = await api.get('/qr/listar/todos');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    console.log(`   └─ Total QR: ${res.data.total}`);
  });

  // Test 8: Ejecutar diagnóstico
  await test('8️⃣  Ejecutar Diagnóstico', async () => {
    const res = await api.get('/diagnostics/qrs');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    console.log(`   └─ Total QR: ${res.data.total_qrs}`);
    console.log(`   └─ QR faltantes: ${res.data.missing_qrs.length}`);
    console.log(`   └─ QR corruptos: ${res.data.corrupt_qrs.length}`);
  });

  // Resumen final
  console.log('\n\n📊 RESUMEN DE PRUEBAS:');
  console.log('═════════════════════════════════════════');
  tests.forEach(t => {
    const icon = t.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${t.nombre}`);
  });

  const passed = tests.filter(t => t.status === 'PASSED').length;
  const total = tests.length;
  const percentage = Math.round((passed / total) * 100);

  console.log('═════════════════════════════════════════');
  console.log(`\n🎯 Resultado: ${passed}/${total} pruebas pasaron (${percentage}%)\n`);

  if (passed === total) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON! ¡Sistema operativo! 🎉\n');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisa los errores arriba.\n');
  }
}

runTests().catch(error => {
  console.error('\n❌ ERROR FATAL:', error.message);
  console.error('\n💡 Asegúrate de que:');
  console.error('   1. El servidor está corriendo: npm run dev');
  console.error('   2. El puerto 5000 está disponible');
  console.error('   3. Las variables de entorno están configuradas en .env');
});
