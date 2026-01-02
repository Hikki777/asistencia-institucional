/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, UserCheck, UserX, Search, Calendar, TrendingUp, QrCode, Camera, CameraOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import client from '../api/client';
import { Html5Qrcode } from 'html5-qrcode';
import { TableSkeleton } from './LoadingSpinner';

// Usamos el cliente API compartido (con baseURL '/api' e interceptor JWT)

export default function AsistenciasPanel() {
      const [showAusentesModal, setShowAusentesModal] = useState(false);
      const [excusaInput, setExcusaInput] = useState('');
      const [personaExcusa, setPersonaExcusa] = useState(null);
      const [excusas, setExcusas] = useState([]);
    const [tomaIniciada, setTomaIniciada] = useState(false);
    const [horaInternet, setHoraInternet] = useState('');
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
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const html5QrCodeRef = useRef(null);
  const scannerActiveRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lastScannedQRRef = useRef('');
  const processingTimeoutRef = useRef(null);

  // Optimización: Filtrar listas con useMemo para evitar re-cálculos innecesarios
  const alumnosFiltrados = useMemo(() => {
    if (!searchTerm) return alumnos;
    const term = searchTerm.toLowerCase();
    return alumnos.filter(a => 
      a.nombres.toLowerCase().includes(term) ||
      a.apellidos.toLowerCase().includes(term) ||
      a.carnet.toLowerCase().includes(term)
    );
  }, [alumnos, searchTerm]);

  const docentesFiltrados = useMemo(() => {
    if (!searchTerm) return docentes;
    const term = searchTerm.toLowerCase();
    return docentes.filter(d => 
      d.nombres.toLowerCase().includes(term) ||
      d.apellidos.toLowerCase().includes(term) ||
      d.carnet.toLowerCase().includes(term)
    );
  }, [docentes, searchTerm]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Evitar llamadas sin token; el interceptor también redirige en 401
      toast.error('Sesión no iniciada. Inicia sesión para continuar.');
      window.location.href = '/login';
      return;
    }

    fetchAsistenciasHoy();
    fetchAlumnos();
    fetchDocentes();
    // Obtener excusas del día
    import('../api/excusas').then(({ excusasAPI }) => {
      excusasAPI.list({ fecha: new Date().toISOString().slice(0, 10) })
        .then(res => setExcusas(res.data.excusas || []))
        .catch(() => setExcusas([]));
    });

    // Obtener hora de internet
    fetch('https://worldtimeapi.org/api/timezone/America/El_Salvador')
      .then(res => res.json())
      .then(data => {
        if (data && data.datetime) {
          const fecha = new Date(data.datetime);
          setHoraInternet(fecha.toLocaleString('es-ES'));
        }
      });
    
    return () => {
      stopScanner();
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  const fetchAsistenciasHoy = async () => {
    setLoading(true);
    try {
      // Calcular inicio y fin del día local en formato ISO para enviar al backend
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      
      const response = await client.get('/asistencias', {
        params: {
          desde: start.toISOString(),
          hasta: end.toISOString(),
          limit: 100 // Obtener suficientes registros del día
        }
      });
      
      const asistencias = response.data.asistencias || [];
      setAsistenciasHoy(asistencias);
      
      // Calcular stats localmente si el endpoint general no los devuelve pre-calculados
      const stats = {
        total: asistencias.length,
        entradas: asistencias.filter(a => a.tipo_evento === 'entrada').length,
        salidas: asistencias.filter(a => a.tipo_evento === 'salida').length,
        puntuales: asistencias.filter(a => a.estado_puntualidad === 'puntual').length,
        tardes: asistencias.filter(a => a.estado_puntualidad === 'tarde').length
      };
      setStats(stats);
      
    } catch (error) {
      console.error('Error fetching asistencias:', error);
      toast.error('Error al cargar asistencias: ' + (error.response?.data?.error || error.message));
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
      toast.error('Error al cargar alumnos');
    }
  };

  const fetchDocentes = async () => {
    try {
      const response = await client.get('/docentes');
      setDocentes(response.data.personal || response.data.docentes || []);
    } catch (error) {
      console.error('Error fetching docentes:', error);
      toast.error('Error al cargar docentes');
    }
  };

  // Función para reproducir sonido de beep tipo escáner (optimizada con useCallback)
  const playBeepSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configurar el sonido tipo beep de supermercado
      oscillator.frequency.value = 2800; // Frecuencia alta para beep
      oscillator.type = 'square'; // Onda cuadrada para sonido más nítido
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio no disponible:', error);
    }
  }, []);

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
      toast.error(`Selecciona un ${tipoPersona}`);
      return;
    }

    // Backup para rollback
    const previousAsistencias = [...asistenciasHoy];

    try {
      // Buscar datos completos de la persona ANTES de la llamada API
      console.log('🔍 Buscando datos para modal de registro manual...');
      let personaData = null;
      
      if (tipoPersona === 'alumno') {
        const alumno = alumnos.find(a => a.id === parseInt(selectedAlumno));
        console.log('👨‍🎓 Alumno encontrado:', alumno);
        
        // Validar que el alumno esté activo
        if (!alumno) {
          toast.error('Alumno no encontrado');
          return;
        }
        if (alumno.estado === 'inactivo' || alumno.estado === 'baja') {
          toast.error(`⚠️ El alumno ${alumno.nombres} ${alumno.apellidos} está INACTIVO. No se puede registrar asistencia.`);
          return;
        }
        personaData = {
          tipo: 'Alumno',
          nombre: alumno?.nombre || alumno?.nombres || 'Desconocido',
          apellido: alumno?.apellido || alumno?.apellidos || '',
          carnet: alumno?.carnet || `ID: ${selectedAlumno}`,
          grado: alumno?.grado || 'N/A',
          seccion: alumno?.seccion || 'N/A'
        };
      } else {
        const docente = docentes.find(d => d.id === parseInt(selectedDocente));
        console.log('👨‍🏫 Docente encontrado:', docente);
        
        // Validar que el docente esté activo
        if (!docente) {
          toast.error('Docente no encontrado');
          return;
        }
        if (docente.estado === 'inactivo' || docente.estado === 'baja') {
          toast.error(`⚠️ El docente ${docente.nombres} ${docente.apellidos} está INACTIVO. No se puede registrar asistencia.`);
          return;
        }
        
        personaData = {
          tipo: 'Personal',
          nombre: docente?.nombre || docente?.nombres || 'Desconocido',
          apellido: docente?.apellido || docente?.apellidos || '',
          carnet: docente?.carnet || `ID: ${selectedDocente}`,
          cargo: docente?.cargo || 'N/A',
          departamento: docente?.departamento || 'N/A'
        };
      }

      // Crear asistencia optimista
      const optimisticAsistencia = {
        id: Date.now(), // ID temporal
        tipo_evento: tipoEvento,
        origen: 'Manual',
        created_at: new Date().toISOString(),
        alumno_id: tipoPersona === 'alumno' ? parseInt(selectedAlumno) : null,
        docente_id: tipoPersona === 'docente' ? parseInt(selectedDocente) : null,
        alumno: tipoPersona === 'alumno' ? personaData : null,
        docente: tipoPersona === 'docente' ? personaData : null
      };

      // Actualizar UI inmediatamente
      setAsistenciasHoy(prev => [optimisticAsistencia, ...prev]);

      // Limpiar formulario y mostrar modal inmediatamente
      setSelectedAlumno('');
      setSelectedDocente('');
      setSearchTerm('');

      setModalData({
        ...personaData,
        tipoEvento: tipoEvento === 'entrada' ? 'ENTRADA' : 'SALIDA',
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      setShowModal(true);

      // Cerrar modal automáticamente después de 3 segundos
      setTimeout(() => {
        setShowModal(false);
      }, 3000);

      // Reproducir sonido de confirmación inmediatamente
      playBeepSound();

      // Llamada API asíncrona
      const requestData = {
        tipo_evento: tipoEvento,
        origen: 'Manual'
      };

      // Solo enviar el campo que corresponde (no enviar null ni strings vacíos)
      if (tipoPersona === 'alumno' && optimisticAsistencia.alumno_id) {
        requestData.alumno_id = optimisticAsistencia.alumno_id;
      } else if (tipoPersona === 'docente' && optimisticAsistencia.docente_id) {
        requestData.personal_id = optimisticAsistencia.docente_id;
      }

      console.log('📤 Enviando:', requestData);

      const response = await client.post('/asistencias', requestData);

      // Reemplazar ID temporal con ID real
      setAsistenciasHoy(prev => prev.map(a => 
        a.id === optimisticAsistencia.id ? { ...a, id: response.data.id } : a
      ));

      toast.success('Asistencia registrada exitosamente');

    } catch (error) {
      // Rollback en caso de error
      setAsistenciasHoy(previousAsistencias);
      console.error('❌ Error completo:', error.response?.data || error.message);
      toast.error('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const startScanner = async () => {
    console.log('🎥 Iniciando escáner QR con html5-qrcode...');
    
    try {
      setScanMessage('Iniciando escáner...');
      setScannerActive(true);
      scannerActiveRef.current = true;
      
      // Esperar un momento para que el DOM se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar que el elemento existe
      const readerElement = document.getElementById("qr-reader");
      if (!readerElement) {
        throw new Error('Elemento qr-reader no encontrado en el DOM');
      }
      
      console.log('📦 Elemento qr-reader encontrado');
      
      // Crear instancia de Html5Qrcode
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;
      
      // Configuración de escaneo - MODO AGRESIVO
      const config = {
        fps: 30, // Más frames por segundo para mayor sensibilidad
        qrbox: { width: 250, height: 250 }, // Área más grande
        aspectRatio: 1.0,
        disableFlip: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: true,
        supportedScanTypes: []
      };
      
      // Callback cuando se detecta QR
      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        // Evitar múltiples escaneos del mismo QR usando refs
        if (isProcessingRef.current || lastScannedQRRef.current === decodedText) {
          console.log('⏭️ QR ya procesándose o recién escaneado, ignorando...');
          return;
        }

        console.log('🎉🎉🎉 ¡QR DETECTADO CON HTML5-QRCODE! 🎉🎉🎉');
        console.log('📱 Contenido:', decodedText);
        console.log('📋 Resultado completo:', decodedResult);
        
        // Marcar como procesando usando ref (inmediato, no espera render)
        isProcessingRef.current = true;
        lastScannedQRRef.current = decodedText;
        setScanMessage('✅ ¡QR DETECTADO! Procesando...');
        
        // Vibrar
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        
        // Procesar QR
        handleQRScan(decodedText).then(() => {
          setScanMessage('✅ ¡Registro exitoso! Listo para escanear otro...');
        }).catch(err => {
          console.error('❌ Error procesando:', err);
          setScanMessage(`❌ Error: ${err.message}`);
        }).finally(() => {
          // Permitir nuevo escaneo después de 3 segundos
          if (processingTimeoutRef.current) {
            clearTimeout(processingTimeoutRef.current);
          }
          processingTimeoutRef.current = setTimeout(() => {
            isProcessingRef.current = false;
            lastScannedQRRef.current = '';
            console.log('🔓 Listo para escanear nuevo QR');
          }, 3000);
        });
      };
      
      // Callback de error (opcional, no se muestra cada frame)
      const qrCodeErrorCallback = (errorMessage) => {
        // Ignorar errores normales de "no QR encontrado"
      };
      
      console.log('🚀 Iniciando cámara...');
      
      // Iniciar escaneo
      await html5QrCode.start(
        { facingMode: "environment" }, // Usar cámara trasera
        config,
        qrCodeSuccessCallback,
        qrCodeErrorCallback
      );
      
      setScanMessage('✅ Escáner activo. Coloca el QR frente a la cámara...');
      console.log('✅ Escáner HTML5-QRCode iniciado correctamente');
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Stack:', error.stack);
      setScanMessage(`❌ Error: ${error.message}`);
      setScannerActive(false);
      scannerActiveRef.current = false;
    }
  };

  /* FUNCIÓN COMENTADA TEMPORALMENTE
  const startScannerOLD = async () => {
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
      
      // Inicializar escaneo con jsQR
      let scanAttempts = 0;
      let lastScanTime = 0;
      
      // Función de escaneo con jsQR
      const scanFrame = async () => {
        if (!videoRef.current || !canvasRef.current || !scannerActiveRef.current) {
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
  */ // FIN DEL COMENTARIO

  const stopScanner = async () => {
    console.log('🛑 Deteniendo escáner...');
    
    setScannerActive(false);
    scannerActiveRef.current = false;
    
    // Detener html5-qrcode
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        console.log('✅ HTML5-QRCode detenido');
        html5QrCodeRef.current = null;
      } catch (error) {
        console.error('Error deteniendo escáner:', error);
      }
    }
    
    setScanMessage('');
    console.log('✅ Escáner detenido completamente');
  };
  
  /* FUNCIÓN STOP COMENTADA
  const stopScannerOLD = () => {
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
  */ // FIN DEL COMENTARIO stopScannerOLD

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
        requestData.alumno_id = parseInt(parsedData.id);
        console.log('👨‍🎓 Registrando alumno ID:', parsedData.id);
      } else if (parsedData.tipo === 'docente' || parsedData.tipo === 'personal') {
        // Backend espera personal_id
        requestData.personal_id = parseInt(parsedData.id);
        console.log('👨‍🏫 Registrando personal ID:', parsedData.id);
      } else {
        console.error('❌ Tipo desconocido:', parsedData.tipo);
        setScanMessage('❌ Tipo de QR desconocido');
        return;
      }
      
      console.log('📤 Enviando a backend:', requestData);
      const response = await client.post('/asistencias', requestData);
      console.log('✅ Respuesta del servidor:', response.data);

      // Reproducir sonido de beep tipo escáner
      playBeepSound();

      // Buscar datos completos de la persona
      console.log('🔍 Buscando datos de la persona...');
      console.log('📊 Alumnos disponibles:', alumnos.length);
      console.log('📊 Docentes disponibles:', docentes.length);
      console.log('🎯 Buscando ID:', parseInt(parsedData.id), 'Tipo:', parsedData.tipo);
      
      let personaData = null;
      if (parsedData.tipo === 'alumno') {
        const alumno = alumnos.find(a => a.id === parseInt(parsedData.id));
        console.log('👨‍🎓 Alumno encontrado:', alumno);
        
        // Validar que el alumno esté activo
        if (!alumno) {
          toast.error('Alumno no encontrado');
          setScanMessage('❌ Alumno no encontrado');
          return;
        }
        if (alumno.estado === 'inactivo' || alumno.estado === 'baja') {
          toast.error(`⚠️ El alumno ${alumno.nombres} ${alumno.apellidos} está INACTIVO`);
          setScanMessage(`❌ Usuario INACTIVO: ${alumno.nombres}`);
          return;
        }
        personaData = {
          tipo: 'Alumno',
          nombre: alumno?.nombre || alumno?.nombres || 'Desconocido',
          apellido: alumno?.apellido || alumno?.apellidos || '',
          carnet: alumno?.carnet || parsedData.carnet || `ID: ${parsedData.id}`,
          grado: alumno?.grado || 'N/A',
          seccion: alumno?.seccion || 'N/A'
        };
      } else {
        const docente = docentes.find(d => d.id === parseInt(parsedData.id));
        console.log('👨‍🏫 Docente encontrado:', docente);
        
        // Validar que el docente esté activo
        if (!docente) {
          toast.error('Docente no encontrado');
          setScanMessage('❌ Docente no encontrado');
          return;
        }
        if (docente.estado === 'inactivo' || docente.estado === 'baja') {
          toast.error(`⚠️ El docente ${docente.nombres} ${docente.apellidos} está INACTIVO`);
          setScanMessage(`❌ Usuario INACTIVO: ${docente.nombres}`);
          return;
        }
        
        personaData = {
          tipo: 'Personal',
          nombre: docente?.nombre || docente?.nombres || 'Desconocido',
          apellido: docente?.apellido || docente?.apellidos || '',
          carnet: docente?.carnet || parsedData.carnet || `ID: ${parsedData.id}`,
          cargo: docente?.cargo || 'N/A',
          departamento: docente?.departamento || 'N/A'
        };
      }

      console.log('📋 Datos del modal:', personaData);

      // Mostrar modal con los datos
      setModalData({
        ...personaData,
        tipoEvento: tipoEvento === 'entrada' ? 'ENTRADA' : 'SALIDA',
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      setShowModal(true);

      // Cerrar modal automáticamente después de 3 segundos
      setTimeout(() => {
        setShowModal(false);
      }, 3000);

      setScanMessage(`✅ ${tipoEvento === 'entrada' ? 'Entrada' : 'Salida'} registrada - ${parsedData.carnet || `ID: ${parsedData.id}`}`);
      
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
      {/* Título del panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Clock className="text-blue-600" size={36} />
          Panel de Asistencias
        </h2>
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Calendar size={18} className="text-blue-500" />
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
          <StatCard
            icon={<Clock />}
            title="Tarde"
            value={stats.tardes || 0}
            color="bg-red-500"
          />
          <StatCard
            icon={<UserX />}
            title="Ausentes"
            value={(() => {
              // Calcular ausentes correctamente
              const asistidos = new Set([
                ...asistenciasHoy.map(a => a.alumno_id),
                ...asistenciasHoy.map(a => a.docente_id),
                ...asistenciasHoy.map(a => a.personal_id)
              ]);
              const totalPersonas = [...alumnos, ...docentes].filter(p => p.id).length;
              const ausentes = [...alumnos, ...docentes].filter(p => !asistidos.has(p.id)).length;
              return ausentes;
            })()}
            color="bg-gray-500 text-white"
          />
        </div>
      )}

      {/* Botón de iniciar/finalizar centrado a la izquierda, debajo del dashboard y encima de escanear QR */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {!tomaIniciada ? (
            <button
              className="min-w-[220px] text-lg bg-green-600 hover:bg-green-700 font-bold py-3 px-6 rounded-xl shadow transition text-white"
              onClick={() => {
                setTomaIniciada(true);
                setScannerActive(false);
                setScanMessage('');
              }}
            >
              Iniciar toma de asistencias
            </button>
          ) : (
            <button
              className="min-w-[220px] text-lg bg-orange-600 hover:bg-orange-700 font-bold py-3 px-6 rounded-xl shadow transition text-white"
              onClick={() => {
                setShowAusentesModal(true);
              }}
            >
              Finalizar toma de asistencias
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTipoEvento('entrada')}
            className={`min-w-[120px] text-lg font-bold px-4 py-2 rounded-xl shadow transition-colors ${
              tipoEvento === 'entrada'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${!tomaIniciada ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!tomaIniciada}
          >
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setTipoEvento('salida')}
            className={`min-w-[120px] text-lg font-bold px-4 py-2 rounded-xl shadow transition-colors ${
              tipoEvento === 'salida'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${!tomaIniciada ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!tomaIniciada}
          >
            Salida
          </button>
        </div>
      </div>

      {/* Sección de Captura de Asistencias - Dividido en 2 columnas */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!tomaIniciada ? 'pointer-events-none opacity-50' : ''}`}> 
        {/* Columna Izquierda: Scanner QR */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <QrCode className="text-blue-600" size={24} />
              Escanear QR
            </h3>
            {/* Botón para activar/desactivar el escáner QR */}
            <button
              className={`ml-2 px-4 py-2 rounded-lg font-semibold transition-colors ${scannerActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              onClick={() => {
                if (!scannerActive) {
                  startScanner();
                } else {
                  stopScanner();
                  setScanMessage('Escáner de código QR desactivado');
                }
                setScannerActive(!scannerActive);
              }}
              disabled={!tomaIniciada}
            >
              {scannerActive ? 'Desactivar' : 'Activar'}
            </button>
          </div>
          {/* Scanner QR */}
          {scannerActive && tomaIniciada ? (
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="relative max-w-md mx-auto">
                {/* Contenedor para html5-qrcode */}
                <div id="qr-reader" className="w-full rounded-lg overflow-hidden" style={{ maxWidth: '400px', maxHeight: '400px' }}></div>
              </div>
              {scanMessage && (
                <div className={`mt-4 text-center text-lg font-bold py-3 px-4 rounded-lg ${
                  scanMessage.includes('✅') ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                  scanMessage.includes('❌') ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                }`}>
                  {scanMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <QrCode size={80} className="mb-4" />
              <p className="text-lg font-medium">Escáner de código QR desactivado</p>
              <p className="text-sm mt-2">Presiona "Activar" para comenzar</p>
            </div>
          )}
        </motion.div>

        {/* Columna Derecha: Registro Manual */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <UserCheck className="text-green-600" size={24} />
            Registro Manual
          </h3>

          <form onSubmit={handleRegistrarAsistencia} className="space-y-4">
            {/* Tipo detectado automáticamente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Detectado
              </label>
              <div className={`w-full border rounded-lg px-3 py-2 font-semibold text-center ${
                tipoPersona === 'alumno' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' 
                  : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
              }`}>
                {tipoPersona === 'alumno' ? '🎓 Alumno' : '👨‍🏫 Docente'}
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
                  {/* Mostrar resultados combinados (optimizado con useMemo) */}
                  {/* Alumnos */}
                  {alumnosFiltrados.map((alumno) => (
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
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {alumno.carnet} - {alumno.grado} - {alumno.jornada}
                        </div>
                      </button>
                    ))}
                  
                  {/* Docentes (optimizado con useMemo) */}
                  {docentesFiltrados.map((docente) => (
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
                        <div className="text-xs text-gray-600 dark:text-gray-400">
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
              className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors ${!tomaIniciada ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!tomaIniciada}
            >
              Registrar {tipoEvento === 'entrada' ? 'Entrada' : 'Salida'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Asistencias del Día - Historial Unificado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Clock className="text-blue-600" size={24} />
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
          <TableSkeleton rows={5} columns={7} />
        ) : asistenciasHoy.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay asistencias registradas hoy
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-3 py-2">Hora</th>
                  <th className="text-left px-3 py-2">Carnet</th>
                  <th className="text-left px-3 py-2">Nombre Completo</th>
                  <th className="text-center px-3 py-2">Tipo / Grado</th>
                  <th className="text-center px-3 py-2">Evento</th>
                  <th className="text-center px-3 py-2">Origen</th>
                  <th className="text-center px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {asistenciasHoy.map((asistencia) => {
                  const persona = asistencia.alumno || asistencia.docente || asistencia.personal;
                  const esAlumno = !!asistencia.alumno;
                  // Para personal, mostrar el cargo directamente (Directora, Docente, etc.)
                  const tipoYGrado = esAlumno 
                    ? { tipo: 'Alumno', detalle: persona?.grado }
                    : { tipo: persona?.cargo || 'Personal', detalle: null };
                  
                  return (
                    <motion.tr
                      key={asistencia.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-3 py-2 font-medium text-gray-700">
                        {formatTime(asistencia.timestamp || asistencia.created_at)}
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400 font-medium">
                        {persona?.carnet}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                        {persona?.nombres} {persona?.apellidos}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            esAlumno
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {tipoYGrado.tipo}
                          </span>
                          {tipoYGrado.detalle && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                              {tipoYGrado.detalle}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          asistencia.tipo_evento === 'entrada'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {asistencia.tipo_evento === 'entrada' ? 'ENTRADA' : 'SALIDA'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          asistencia.origen === 'QR'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {asistencia.origen === 'QR' ? '📱 QR' : '✍️ Manual'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {asistencia.estado_puntualidad && (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            asistencia.estado_puntualidad === 'puntual'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {asistencia.estado_puntualidad === 'puntual' ? '✓ Puntual' : '⚠ Tarde'}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal de confirmación de asistencia */}
      {showModal && modalData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icono de éxito */}
            <div className="flex justify-center mb-4">
              <div className={`rounded-full p-4 ${modalData.tipoEvento === 'ENTRADA' ? 'bg-green-100' : 'bg-orange-100'}`}>
                {modalData.tipoEvento === 'ENTRADA' ? (
                  <UserCheck className={`text-green-600 w-16 h-16`} />
                ) : (
                  <UserX className={`text-orange-600 w-16 h-16`} />
                )}
              </div>
            </div>

            {/* Tipo de evento */}
            <h3 className={`text-3xl font-bold text-center mb-6 ${modalData.tipoEvento === 'ENTRADA' ? 'text-green-600' : 'text-orange-600'}`}>
              {modalData.tipoEvento}
            </h3>

            {/* Información de la persona - Orden según formularios */}
            <div className="space-y-4 text-center">
              {/* 1. Tipo */}
              <div>
                <p className="text-gray-500 text-sm">Tipo</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{modalData.tipo}</p>
              </div>

              {/* 2. Carnet */}
              <div>
                <p className="text-gray-500 text-sm">Carnet</p>
                <p className="text-xl font-semibold text-blue-600">{modalData.carnet}</p>
              </div>

              {/* 3 y 4. Nombres y Apellidos */}
              <div>
                <p className="text-gray-500 text-sm">Nombre Completo</p>
                <p className="text-2xl font-bold text-gray-900">{modalData.nombre} {modalData.apellido}</p>
              </div>

              {/* 5. Grado/Sección (para Alumnos) */}
              {modalData.grado && (
                <div className="flex justify-center gap-8">
                  <div>
                    <p className="text-gray-500 text-sm">Grado</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{modalData.grado}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Sección</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{modalData.seccion}</p>
                  </div>
                </div>
              )}

              {/* 5. Cargo y Departamento (para Personal) */}
              {modalData.cargo && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Cargo</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{modalData.cargo}</p>
                  </div>
                  {modalData.departamento && modalData.departamento !== 'N/A' && (
                    <div>
                      <p className="text-gray-500 text-sm">Departamento</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{modalData.departamento}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 6. Hora de registro */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-500 text-sm">Hora de registro</p>
                <p className="text-2xl font-bold text-gray-900">{modalData.hora}</p>
              </div>
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      )}



      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* Modal de Ausentes al finalizar */}
      {showAusentesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header Modal */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <UserX className="text-orange-500" />
                Resumen de Inasistencias
              </h3>
              <button
                onClick={() => setShowAusentesModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  ℹ️ Revise la lista de personas que no registraron su asistencia hoy. Puede ingresar una justificación si corresponde.
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Persona</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo/Grado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Justificación</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(() => {
                        const asistidosIds = new Set([
                          ...asistenciasHoy.map(a => a.alumno_id),
                          ...asistenciasHoy.map(a => a.docente_id),
                          ...asistenciasHoy.map(a => a.personal_id)
                        ]);
                        const todos = [...alumnos, ...docentes];
                        const ausentes = todos.filter(p => !asistidosIds.has(p.id));
                        
                        if (ausentes.length === 0) {
                          return (
                            <tr>
                              <td colSpan="3" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                <UserCheck className="mx-auto mb-2 text-green-500" size={24} />
                                ¡Excelente! Todos han registrado asistencia hoy.
                              </td>
                            </tr>
                          );
                        }

                        return ausentes.map((persona) => (
                          <tr key={persona.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {persona.nombres} {persona.apellidos}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                {persona.carnet}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {persona.grado || persona.cargo || 'Personal'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                placeholder="Escribir justificación..."
                                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                                onChange={(e) => {
                                  // Aquí podríamos guardar en un estado local temporal 'justificaciones' 
                                  // setJustificaciones(prev => ({...prev, [persona.id]: e.target.value}))
                                }}
                              />
                            </td>
                          </tr>
                        ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => setShowAusentesModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition font-medium"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  setTomaIniciada(false);
                  setScannerActive(false);
                  setScanMessage('');
                  setShowAusentesModal(false);
                  toast.success('Toma de asistencias finalizada correctamente');
                }}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-bold shadow-lg hover:translate-y-0.5"
              >
                Confirmar y Finalizar
              </button>
            </div>
          </motion.div>
        </div>
      )}
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

