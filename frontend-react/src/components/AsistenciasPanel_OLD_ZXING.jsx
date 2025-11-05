/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, UserCheck, UserX, Search, Calendar, TrendingUp, QrCode, Camera, CameraOff } from 'lucide-react';
import axios from 'axios';
import jsQR from 'jsqr';

const API_URL = 'http://localhost:5000/api';
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function AsistenciasPanel() {
  const [asistenciasHoy, setAsistenciasHoy] = useState([]);
  const [stats, setStats] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [tipoPersona, setTipoPersona] = useState('alumno');
  const [selectedAlumno, setSelectedAlumno] = useState('');
  const [selectedDocente, setSelectedDocente] = useState('');
  const [tipoEvento, setTipoEvento] = useState('entrada');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const codeReaderRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const scannerActiveRef = useRef(false); // Ref para evitar problemas de closure

  useEffect(() => {
    fetchAsistenciasHoy();
    fetchAlumnos();
    fetchDocentes();
    
    return () => {
      stopScanner();
    };
  }, []);

  const fetchAsistenciasHoy = async () => {
    setLoading(true);
    try {
      const response = await client.get('/asistencias/hoy');
      setAsistenciasHoy(response.data.asistencias || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching asistencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const response = await client.get('/alumnos');
      setAlumnos(response.data.alumnos || []);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

  const fetchDocentes = async () => {
    try {
      const response = await client.get('/docentes');
      setDocentes(response.data.docentes || []);
    } catch (error) {
      console.error('Error fetching docentes:', error);
    }
  };

  const handleRegistrarAsistencia = async (e) => {
    e.preventDefault();
    
    const personaId = tipoPersona === 'alumno' ? selectedAlumno : selectedDocente;
    
    console.log('🔍 Debug registro:', {
      tipoPersona,
      selectedAlumno,
      selectedDocente,
      personaId,
      tipoEvento
    });
    
    if (!personaId) {
      alert(`Selecciona un ${tipoPersona}`);
      return;
    }

    try {
      const requestData = {
        tipo_evento: tipoEvento,
        origen: 'Manual'
      };

      // Solo enviar el campo que corresponde (no enviar null ni strings vacíos)
      if (tipoPersona === 'alumno' && selectedAlumno) {
        requestData.alumno_id = parseInt(selectedAlumno);
      } else if (tipoPersona === 'docente' && selectedDocente) {
        requestData.docente_id = parseInt(selectedDocente);
      }

      console.log('📤 Enviando:', requestData);

      await client.post('/asistencias', requestData);
      
      alert(`${tipoEvento === 'entrada' ? 'Entrada' : 'Salida'} registrada correctamente`);
      setSelectedAlumno('');
      setSelectedDocente('');
      setSearchTerm('');
      fetchAsistenciasHoy();
    } catch (error) {
      console.error('❌ Error completo:', error.response?.data || error.message);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const startScanner = async () => {
    console.log('🎥 Iniciando escáner QR con jsQR...');
    
    try {
      setScannerActive(true);
      scannerActiveRef.current = true;
      setScanMessage('Solicitando acceso a la cámara...');
      
      // Configuración de cámara
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Stream de cámara obtenido');
      
      streamRef.current = stream;
      
      if (!videoRef.current) {
        throw new Error('Video element no disponible');
      }
      
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('autoplay', 'true');
      
      // Esperar a que el video esté listo
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
        
        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeout);
          console.log('✅ Video listo:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          videoRef.current.play().then(resolve).catch(reject);
        };
      });
      
      setScanMessage('✅ Cámara activa. Coloca el QR frente a la cámara...');
      
      // Inicializar lector ZXing con hints optimizados
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;
      
      let scanAttempts = 0;
      let lastScanTime = 0;
      let isProcessing = false;
      
      // Función de escaneo mejorada
      const scanFrame = async () => {
        if (!videoRef.current || !canvasRef.current || !scannerActiveRef.current || isProcessing) {
          return;
        }
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
          return;
        }
        
        try {
          scanAttempts++;
          
          // Configurar canvas con dimensiones exactas del video
          const width = video.videoWidth;
          const height = video.videoHeight;
          
          if (width === 0 || height === 0) return;
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          
          // Dibujar frame actual
          ctx.drawImage(video, 0, 0, width, height);
          
          // Log cada 30 intentos
          if (scanAttempts % 30 === 0) {
            console.log(`🔍 Intento ${scanAttempts} - ${width}x${height}`);
          }
          
          // Intentar decodificar desde el canvas
          try {
            const result = await codeReader.decodeFromCanvas(canvas);
            
            if (result && result.getText()) {
              isProcessing = true;
              const now = Date.now();
              
              // Debounce: evitar lecturas duplicadas
              if (now - lastScanTime < 3000) {
                isProcessing = false;
                return;
              }
              
              lastScanTime = now;
              const qrData = result.getText();
              
              console.log('🎉🎉🎉 ¡QR DETECTADO! 🎉🎉🎉');
              console.log('📱 Intento #:', scanAttempts);
              console.log('📱 Contenido:', qrData);
              console.log('� Formato:', result.getBarcodeFormat());
              
              setScanMessage('✅ ¡QR DETECTADO! Procesando...');
              
              // Vibrar si está disponible
              if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
              }
              
              // Procesar el QR
              try {
                await handleQRScan(qrData);
                setScanMessage('✅ ¡Registro exitoso! Listo para escanear otro...');
              } catch (err) {
                console.error('❌ Error procesando:', err);
                setScanMessage(`❌ Error: ${err.message}`);
              }
              
              // Pausa de 2 segundos antes de continuar
              await new Promise(resolve => setTimeout(resolve, 2000));
              setScanMessage('✅ Cámara activa. Coloca el QR frente a la cámara...');
              isProcessing = false;
            }
          } catch (decodeError) {
            // Ignorar NotFoundException (es normal cuando no hay QR)
            if (decodeError.name !== 'NotFoundException') {
              if (scanAttempts % 100 === 0) {
                console.warn('⚠️ Decode warning:', decodeError.name);
              }
            }
          }
        } catch (error) {
          console.error('❌ Error en scanFrame:', error);
        }
      };
      
      // Iniciar escaneo cada 150ms (más agresivo)
      console.log('🚀 Iniciando escaneo cada 150ms');
      scanIntervalRef.current = setInterval(scanFrame, 150);
      
      console.log('✅ Escáner QR iniciado correctamente');
      
    } catch (error) {
      console.error('❌ Error iniciando escáner:', error);
      setScanMessage(`❌ Error: ${error.message}`);
      stopScanner();
      
      if (error.name === 'NotAllowedError') {
        alert('⚠️ Permisos de cámara denegados. Permite el acceso a la cámara.');
      } else if (error.name === 'NotFoundError') {
        alert('⚠️ No se encontró cámara. Verifica tu webcam.');
      }
    }
  };

  const stopScanner = () => {
    console.log('🛑 Deteniendo escáner...');
    
    // Detener el intervalo de escaneo
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
      console.log('✅ Intervalo de escaneo detenido');
    }
    
    // Limpiar el lector
    if (codeReaderRef.current) {
      codeReaderRef.current = null;
      console.log('✅ CodeReader limpiado');
    }
    
    // Detener todos los tracks del stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('✅ Track detenido:', track.kind, track.label);
      });
      streamRef.current = null;
    }
    
    // Limpiar el video element
    if (videoRef.current) {
      if (videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop();
          console.log('✅ Track del video detenido:', track.kind);
        });
      }
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    
    setScannerActive(false);
    scannerActiveRef.current = false; // Actualizar la ref también
    setScanMessage('');
    console.log('✅ Escáner detenido completamente');
  };

  const handleQRScan = async (qrData) => {
    try {
      console.log('🔍 handleQRScan recibido:', qrData);
      
      // Parsear QR JSON: {"tipo":"alumno","id":1,"carnet":"A001"}
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
        console.log('✅ QR parseado:', parsedData);
      } catch (e) {
        console.log('⚠️ No es JSON, intentando formato antiguo...');
        // Intentar formato antiguo: ALUMNO-{id} o DOCENTE-{id}
        const alumnoMatch = qrData.match(/ALUMNO-(\d+)/);
        const docenteMatch = qrData.match(/DOCENTE-(\d+)/);
        
        if (alumnoMatch) {
          parsedData = { tipo: 'alumno', id: parseInt(alumnoMatch[1]) };
        } else if (docenteMatch) {
          parsedData = { tipo: 'docente', id: parseInt(docenteMatch[1]) };
        } else {
          console.error('❌ Formato de QR no reconocido');
          setScanMessage('❌ QR inválido');
          return;
        }
      }

      if (!parsedData.tipo || !parsedData.id) {
        console.error('❌ Datos incompletos:', parsedData);
        setScanMessage('❌ QR incompleto');
        return;
      }

      const requestData = {
        tipo_evento: tipoEvento,
        origen: 'QR'
      };

      if (parsedData.tipo === 'alumno') {
        requestData.alumno_id = parsedData.id;
        console.log('👨‍🎓 Registrando alumno ID:', parsedData.id);
      } else if (parsedData.tipo === 'docente') {
        // CORRECCIÓN: usar personal_id en lugar de docente_id
        requestData.personal_id = parsedData.id;
        console.log('👨‍🏫 Registrando personal ID:', parsedData.id);
      } else {
        console.error('❌ Tipo desconocido:', parsedData.tipo);
        setScanMessage('❌ Tipo de QR desconocido');
        return;
      }
      
      console.log('📤 Enviando a backend:', requestData);
      const response = await client.post('/asistencias', requestData);
      console.log('✅ Respuesta del servidor:', response.data);

      setScanMessage(`✅ ${tipoEvento === 'entrada' ? 'Entrada' : 'Salida'} registrada - ${parsedData.carnet || `ID: ${parsedData.id}`}`);
      
      // Reproducir sonido de éxito si está disponible
      if (window.Audio) {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiJ0/LPgDQGIHHF8N+TQgwTYLnq66lXFApGnt/yu20iAjmG0fPOgjUHIXLF7+CfUQ8cYbzq7asaGQpGn9/yuG4iAjmJ0fLNgzQHHnLC7+GYTxIWYbvq7KwZGwlGnt/ytW8iAzqH0fPMhDMHHnLC7+GYTxEWYrzq7KwaGQpGnN/zt28iAzqH0fPMgzMHHnPB7+OYThIWYbvq7KwYGwlGnt/ytW8hAzqK0PLNgzMHHnLB7+GZThIVYrzr7KwZGwlGnN/yt28hAzqH0PLMhDMHHnLB7+GYThIWYbvp7KwYGwlGnt/ytW8iAzqH0fPMgzQGHnPB7+GYTxIVYbzq7KwaGQlGnN/yt28hAzqH0PLMhDMHHnPB7+GaTxEXYr7q7KwaGQlGnt/ytW8hAzqH0PLMgzMHHnLB7+GYTxIVYbvq7KsZGQlGnt/xsm8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KwaGQlGn9/xtG8hAzqH0PLMhDMHHnLB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMHHnPB7+GZTxEWYrzq7KsZGQlGnt/ytG8hAzqH0fPMhDMH'); 
          audio.play();
        } catch (audioError) {
          // Ignorar errores de audio
          console.log('Audio no disponible');
        }
      }
      
      setTimeout(() => setScanMessage('✅ Cámara lista. Escaneando códigos QR...'), 2000);
      fetchAsistenciasHoy();
    } catch (error) {
      console.error('❌ Error en handleQRScan:', error);
      console.error('❌ Detalles:', error.response?.data);
      setScanMessage('❌ Error: ' + (error.response?.data?.error || error.message));
      setTimeout(() => setScanMessage('✅ Cámara lista. Escaneando códigos QR...'), 3000);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Clock className="text-blue-600" size={36} />
          Panel de Asistencias
        </h2>
        <div className="text-sm text-gray-600">
          <Calendar size={16} className="inline mr-1" />
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </motion.div>

      {/* Estadísticas del Día */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp />}
            title="Total Registros"
            value={stats.total || 0}
            color="bg-blue-500"
          />
          <StatCard
            icon={<UserCheck />}
            title="Entradas"
            value={stats.entradas || 0}
            color="bg-green-500"
          />
          <StatCard
            icon={<UserX />}
            title="Salidas"
            value={stats.salidas || 0}
            color="bg-orange-500"
          />
          <StatCard
            icon={<Clock />}
            title="Puntuales"
            value={stats.puntuales || 0}
            color="bg-purple-500"
          />
        </div>
      )}

      {/* Formulario de Registro Manual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Registrar Asistencia
          </h3>
          <button
            type="button"
            onClick={() => {
              console.log('🔘 Botón clickeado. scannerActive:', scannerActive);
              if (scannerActive) {
                stopScanner();
              } else {
                startScanner();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              scannerActive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {scannerActive ? <CameraOff size={20} /> : <Camera size={20} />}
            {scannerActive ? 'Detener QR' : 'Escanear QR'}
          </button>
        </div>

        {/* Scanner QR */}
        {scannerActive && (
          <div className="mb-6 bg-gray-900 rounded-lg p-6">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: '600px', minHeight: '400px' }}
                autoPlay
                playsInline
                muted
              />
              {/* Canvas oculto para captura de frames */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {/* Guía visual para centrar el QR */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="border-4 border-green-400 w-72 h-72 rounded-2xl shadow-2xl animate-pulse" />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Centra el código QR aquí
                  </div>
                  {/* Esquinas del marco */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                </div>
              </div>
            </div>
            {scanMessage && (
              <div className={`mt-4 text-center text-lg font-bold py-3 px-4 rounded-lg ${
                scanMessage.includes('✅') ? 'bg-green-100 text-green-800' :
                scanMessage.includes('❌') ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {scanMessage}
              </div>
            )}
            <div className="mt-3 flex items-center justify-center gap-4">
              <label className="text-sm font-medium text-gray-700">Tipo de evento:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTipoEvento('entrada')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    tipoEvento === 'entrada'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setTipoEvento('salida')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    tipoEvento === 'salida'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Salida
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulario Manual */}
        {!scannerActive && (
          <form onSubmit={handleRegistrarAsistencia} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Evento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evento
                </label>
                <select
                  value={tipoEvento}
                  onChange={(e) => setTipoEvento(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </div>

              {/* Tipo detectado automáticamente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo Detectado
                </label>
                <div className={`w-full border rounded-lg px-3 py-2 font-semibold text-center ${
                  tipoPersona === 'alumno' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-green-50 text-green-700 border-green-300'
                }`}>
                  {tipoPersona === 'alumno' ? '🎓 Alumno' : '👨‍🏫 Docente'}
                </div>
              </div>
            </div>

            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-1" />
                Buscar por nombre o carnet (detecta automáticamente)
              </label>
              <input
                type="text"
                placeholder={`Buscar alumno o docente...`}
                value={searchTerm}
                onChange={(e) => {
                  const term = e.target.value;
                  setSearchTerm(term);
                  
                  // Auto-detectar tipo buscando en ambas listas
                  if (term.length > 0) {
                    const foundAlumno = alumnos.find(a =>
                      a.nombres.toLowerCase().includes(term.toLowerCase()) ||
                      a.apellidos.toLowerCase().includes(term.toLowerCase()) ||
                      a.carnet.toLowerCase().includes(term.toLowerCase())
                    );
                    
                    const foundDocente = docentes.find(d =>
                      d.nombres.toLowerCase().includes(term.toLowerCase()) ||
                      d.apellidos.toLowerCase().includes(term.toLowerCase()) ||
                      d.carnet.toLowerCase().includes(term.toLowerCase())
                    );

                    // Priorizar por orden de aparición
                    if (foundAlumno && !foundDocente) {
                      setTipoPersona('alumno');
                    } else if (foundDocente && !foundAlumno) {
                      setTipoPersona('docente');
                    }
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              
              {searchTerm && (
                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {/* Mostrar resultados combinados */}
                  {/* Alumnos */}
                  {alumnos
                    .filter(a =>
                      a.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.carnet.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((alumno) => (
                      <button
                        key={`alumno-${alumno.id}`}
                        type="button"
                        onClick={() => {
                          setTipoPersona('alumno');
                          setSelectedAlumno(alumno.id);
                          setSelectedDocente('');
                          setSearchTerm(`${alumno.nombres} ${alumno.apellidos} (${alumno.carnet})`);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 transition border-l-4 border-blue-500"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-blue-600">🎓 ALUMNO</span>
                          <div className="font-medium">{alumno.nombres} {alumno.apellidos}</div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {alumno.carnet} - {alumno.grado} - {alumno.jornada}
                        </div>
                      </button>
                    ))}
                  
                  {/* Docentes */}
                  {docentes
                    .filter(d =>
                      d.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      d.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      d.carnet.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((docente) => (
                      <button
                        key={`docente-${docente.id}`}
                        type="button"
                        onClick={() => {
                          setTipoPersona('docente');
                          setSelectedDocente(docente.id);
                          setSelectedAlumno('');
                          setSearchTerm(`${docente.nombres} ${docente.apellidos} (${docente.carnet})`);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-green-50 transition border-l-4 border-green-500"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-green-600">👨‍🏫 DOCENTE</span>
                          <div className="font-medium">{docente.nombres} {docente.apellidos}</div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {docente.carnet} - {docente.grado || 'Docente'} - {docente.jornada}
                        </div>
                      </button>
                    ))}
                  
                  {/* Sin resultados */}
                  {alumnos.filter(a =>
                      a.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.carnet.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 &&
                    docentes.filter(d =>
                      d.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      d.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      d.carnet.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 && (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No se encontraron resultados
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Registrar {tipoEvento === 'entrada' ? 'Entrada' : 'Salida'}
            </button>
          </form>
        )}
      </motion.div>

      {/* Tabla de Asistencias del Día */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Asistencias de Hoy
          </h3>
          <button
            onClick={fetchAsistenciasHoy}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : asistenciasHoy.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay asistencias registradas hoy
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left px-4 py-2">Hora</th>
                  <th className="text-left px-4 py-2">Carnet</th>
                  <th className="text-left px-4 py-2">Nombre</th>
                  <th className="text-left px-4 py-2">Tipo</th>
                  <th className="text-left px-4 py-2">Grado</th>
                  <th className="text-center px-4 py-2">Evento</th>
                  <th className="text-center px-4 py-2">Estado</th>
                  <th className="text-center px-4 py-2">Origen</th>
                </tr>
              </thead>
              <tbody>
                {asistenciasHoy.map((asistencia) => {
                  const persona = asistencia.alumno || asistencia.docente;
                  const tipoPersona = asistencia.alumno ? 'Alumno' : 'Docente';
                  
                  return (
                    <motion.tr
                      key={asistencia.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 font-medium">
                        {formatTime(asistencia.timestamp)}
                      </td>
                      <td className="px-4 py-2">{persona?.carnet}</td>
                      <td className="px-4 py-2">
                        {persona?.nombres} {persona?.apellidos}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`text-xs font-semibold ${
                          tipoPersona === 'Alumno' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {tipoPersona}
                        </span>
                      </td>
                      <td className="px-4 py-2">{persona?.grado}</td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            asistencia.tipo_evento === 'entrada'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {asistencia.tipo_evento}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {asistencia.estado_puntualidad && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              asistencia.estado_puntualidad === 'puntual'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {asistencia.estado_puntualidad}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-600 text-xs">
                        {asistencia.origen}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${color} text-white rounded-lg shadow-lg p-6`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </motion.div>
  );
}
