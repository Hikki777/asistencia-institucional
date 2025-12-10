import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, FileSpreadsheet, Users, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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

export default function ReportesPanel() {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    personaTipo: '',
    grado: '',
    tipoEvento: ''
  });
  
  const [generando, setGenerando] = useState(false);
  const [grados, setGrados] = useState([]);

  useEffect(() => {
    fetchAlumnos();
    
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    
    setFiltros(prev => ({
      ...prev,
      fechaInicio: haceUnMes.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0]
    }));
  }, []);

  const fetchAlumnos = async () => {
    try {
      const response = await client.get('/alumnos');
      const alumnosData = response.data.alumnos || [];
      
      // Extraer grados únicos
      const gradosUnicos = [...new Set(alumnosData.map(a => a.grado))].filter(Boolean);
      setGrados(gradosUnicos);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    }
  };

  const handleGenerarReporte = async (formato) => {
    setGenerando(true);
    
    try {
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== '')
      );
      
      console.log('📊 Generando reporte:', formato, filtrosLimpios);
      
      const response = await client.post(
        `/reportes/${formato}`,
        filtrosLimpios,
        { 
          responseType: 'blob',
          timeout: 60000 // 60 segundos
        }
      );
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
      link.setAttribute('download', `reporte_asistencias_${timestamp}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Reporte descargado exitosamente');
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert(`Error al generar el reporte: ${error.response?.data?.error || error.message}`);
    } finally {
      setGenerando(false);
    }
  };

  const limpiarFiltros = () => {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    
    setFiltros({
      fechaInicio: haceUnMes.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0],
      personaTipo: '',
      grado: '',
      tipoEvento: ''
    });
  };

  const establecerRangoRapido = (dias) => {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - dias);
    
    setFiltros(prev => ({
      ...prev,
      fechaInicio: inicio.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes de Asistencias</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Genera reportes personalizados en PDF o Excel</p>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="text-blue-600 w-10 h-10" />
        </div>
      </div>

      {/* Filtros */}
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-blue-600 w-5 h-5" />
          <h2 className="text-xl font-semibold text-gray-900">Filtros</h2>
        </div>

        {/* Rangos rápidos */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rangos rápidos:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => establecerRangoRapido(7)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => establecerRangoRapido(15)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
            >
              Últimos 15 días
            </button>
            <button
              onClick={() => establecerRangoRapido(30)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
            >
              Último mes
            </button>
            <button
              onClick={() => establecerRangoRapido(90)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
            >
              Últimos 3 meses
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tipo de Persona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              Tipo de Persona
            </label>
            <select
              value={filtros.personaTipo}
              onChange={(e) => setFiltros({ ...filtros, personaTipo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="alumno">Alumnos</option>
              <option value="docente">Personal/Docentes</option>
            </select>
          </div>

          {/* Grado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              Grado
            </label>
            <select
              value={filtros.grado}
              onChange={(e) => setFiltros({ ...filtros, grado: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {grados.map(grado => (
                <option key={grado} value={grado}>{grado}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Evento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Tipo de Evento
            </label>
            <select
              value={filtros.tipoEvento}
              onChange={(e) => setFiltros({ ...filtros, tipoEvento: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="entrada">Entradas</option>
              <option value="salida">Salidas</option>
            </select>
          </div>

          {/* Botón limpiar */}
          <div className="flex items-end">
            <button
              onClick={limpiarFiltros}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Botones de descarga */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          <Download className="inline w-5 h-5 mr-2" />
          Generar Reporte
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PDF */}
          <button
            onClick={() => handleGenerarReporte('pdf')}
            disabled={generando}
            className={`
              flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition
              ${generando 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:scale-105'
              }
            `}
          >
            <FileText className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold text-lg">Descargar PDF</div>
              <div className="text-sm opacity-90">Formato profesional para impresión</div>
            </div>
          </button>

          {/* Excel */}
          <button
            onClick={() => handleGenerarReporte('excel')}
            disabled={generando}
            className={`
              flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition
              ${generando 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:scale-105'
              }
            `}
          >
            <FileSpreadsheet className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold text-lg">Descargar Excel</div>
              <div className="text-sm opacity-90">Para análisis y edición de datos</div>
            </div>
          </button>
        </div>

        {generando && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Generando reporte, por favor espera...</p>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Información sobre reportes</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>PDF:</strong> Formato profesional con datos institucionales, filtros aplicados, estadísticas completas y tabla detallada</li>
                <li><strong>Excel:</strong> Dos hojas: "Información" (datos institucionales + resumen) y "Asistencias" (datos detallados)</li>
                <li>Ambos formatos incluyen: nombre de institución, dirección, teléfono y fecha de generación</li>
                <li>Estadísticas: Total, entradas, salidas, puntuales, tardíos, por QR y manuales</li>
                <li>Los filtros aplicados se muestran claramente en ambos reportes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

