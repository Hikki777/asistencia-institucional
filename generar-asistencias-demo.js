#!/usr/bin/env node
/**
 * Script para generar datos de prueba de asistencias
 * Genera asistencias aleatorias para los últimos 7 días
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function generarAsistenciasPrueba() {
  console.log('\n📊 Generando datos de prueba de asistencias...\n');

  try {
    // 1. Login para obtener token
    console.log('1. Obteniendo token de autenticación...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.edu',
      password: 'admin'
    });
    const token = loginRes.data.accessToken;
    console.log('✅ Token obtenido');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Obtener lista de alumnos
    console.log('\n2. Obteniendo lista de alumnos...');
    const alumnosRes = await axios.get(`${API_URL}/alumnos`, { headers });
    const alumnos = alumnosRes.data.alumnos;
    console.log(`✅ ${alumnos.length} alumnos encontrados`);

    if (alumnos.length === 0) {
      console.log('❌ No hay alumnos. Crea alumnos primero.');
      return;
    }

    // 3. Generar asistencias para los últimos 7 días
    console.log('\n3. Generando asistencias...');
    let contador = 0;

    for (let dia = 0; dia < 7; dia++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - dia);
      fecha.setHours(7, 0, 0, 0); // Hora de entrada base

      // Seleccionar algunos alumnos aleatorios (60-90% de asistencia)
      const numAsistentes = Math.floor(alumnos.length * (0.6 + Math.random() * 0.3));
      const alumnosSeleccionados = alumnos
        .sort(() => Math.random() - 0.5)
        .slice(0, numAsistentes);

      for (const alumno of alumnosSeleccionados) {
        // Entrada (con variación de tiempo)
        const horaEntrada = new Date(fecha);
        horaEntrada.setMinutes(Math.floor(Math.random() * 60)); // 7:00 - 8:00
        
        try {
          await axios.post(`${API_URL}/asistencias`, {
            alumno_id: alumno.id,
            tipo_evento: 'entrada',
            origen: 'Demo',
            timestamp: horaEntrada.toISOString()
          }, { headers });
          contador++;

          // Salida (70% probabilidad)
          if (Math.random() > 0.3) {
            const horaSalida = new Date(fecha);
            horaSalida.setHours(14 + Math.floor(Math.random() * 3)); // 14:00 - 17:00
            horaSalida.setMinutes(Math.floor(Math.random() * 60));

            await axios.post(`${API_URL}/asistencias`, {
              alumno_id: alumno.id,
              tipo_evento: 'salida',
              origen: 'Demo',
              timestamp: horaSalida.toISOString()
            }, { headers });
            contador++;
          }
        } catch (error) {
          // Ignorar errores individuales
        }
      }

      console.log(`   ✓ Día ${7 - dia}: ${alumnosSeleccionados.length} alumnos`);
    }

    console.log(`\n✅ Generación completada!`);
    console.log(`   Total de registros: ${contador}`);
    console.log(`\n📊 Ve al Dashboard para ver los gráficos: http://localhost:5173\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   Respuesta:', error.response.data);
    }
  }
}

generarAsistenciasPrueba();
