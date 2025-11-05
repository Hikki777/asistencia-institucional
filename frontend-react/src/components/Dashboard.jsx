import React, { useState, useEffect } from 'react';
import { Activity, Users, QrCode, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { healthAPI, diagnosticsAPI, alumnosAPI } from '../api/endpoints';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Dashboard() {
  const [stats, setStats] = useState({
    status: 'unknown',
    alumnos: 0,
    docentes: 0,
    qrs: 0,
    issues: 0,
  });
  const [institucion, setInstitucion] = useState(null);
  const [asistenciasStats, setAsistenciasStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstitucion();
    fetchStats();
    fetchAsistenciasStats();
    const interval = setInterval(() => {
      fetchStats();
      fetchAsistenciasStats();
    }, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const fetchInstitucion = async () => {
    try {
      const response = await client.get('/institucion');
      setInstitucion(response.data);
    } catch (error) {
      console.error('Error fetching institucion:', error);
    }
  };

  const fetchAsistenciasStats = async () => {
    try {
      const response = await client.get('/asistencias/stats?dias=7');
      setAsistenciasStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching asistencias stats:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [health, diag, alumnos, docentes] = await Promise.all([
        healthAPI.check().catch(() => ({ data: { status: 'error' } })),
        diagnosticsAPI.execute().catch(() => ({ data: { total_qrs: 0, corrupt: 0, missing: 0, missing_logo: 0 } })),
        alumnosAPI.list().catch(() => ({ data: { total: 0, alumnos: [] } })),
        client.get('/docentes').catch(() => ({ data: { docentes: [] } })),
      ]);

      const issues = (diag.data?.corrupt || 0) + (diag.data?.missing || 0) + (diag.data?.missing_logo ? 1 : 0);

      setStats({
        status: health.data?.status === 'ok' ? 'online' : 'offline',
        alumnos: alumnos.data?.total || 0,
        docentes: docentes.data?.docentes?.length || 0,
        qrs: diag.data?.total_qrs || 0,
        issues: issues,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats((prev) => ({ ...prev, status: 'error' }));
    }
  };

  /* eslint-disable no-unused-vars */
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-semibold">{label}</p>
          <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</p>
        </div>
        <Icon className={`text-${color}-600 opacity-20`} size={48} />
      </div>
    </div>
  );
  /* eslint-enable no-unused-vars */

  return (
    <div className="space-y-6">
      {/* Header con nombre e información institucional */}
      {institucion && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {institucion.logo_path && (
                <img 
                  src={`http://localhost:5000/uploads/${institucion.logo_path}?t=${Date.now()}`}
                  alt="Logo institucional"
                  className="w-16 h-16 object-contain bg-white rounded-lg p-2"
                  onError={(e) => { e.target.style.display = 'none'; console.error('Error cargando logo'); }}
                />
              )}
              <div>
                <h1 className="text-3xl font-bold">{institucion.nombre}</h1>
                <p className="text-blue-100 mt-1">
                  Sistema de Registro Institucional
                </p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-blue-100">Horario de inicio: {institucion.horario_inicio}</p>
              <p className="text-blue-100">Margen puntualidad: {institucion.margen_puntualidad_min} min</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Banner */}
      <div
        className={`rounded-lg p-4 flex items-center gap-3 ${
          stats.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        <div className={`w-3 h-3 rounded-full ${stats.status === 'online' ? 'bg-green-600' : 'bg-red-600'} animate-pulse`}></div>
        <span className="font-semibold">
          Sistema {stats.status === 'online' ? '🟢 En Línea' : '🔴 Sin Conexión'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          icon={Activity}
          label="Estado"
          value={stats.status === 'online' ? '✓' : '✗'}
          color={stats.status === 'online' ? 'green' : 'red'}
        />
        <StatCard icon={Users} label="Alumnos" value={stats.alumnos} color="blue" />
        <StatCard icon={Users} label="Docentes" value={stats.docentes} color="green" />
        <StatCard icon={QrCode} label="QR Generados" value={stats.qrs} color="blue" />
        <StatCard
          icon={AlertTriangle}
          label="Problemas"
          value={stats.issues}
          color={stats.issues > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Gráficos de Asistencias */}
      {!loading && asistenciasStats && asistenciasStats.porDia && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Líneas - Tendencia */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-gray-800">Tendencia de Asistencias</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Object.entries(asistenciasStats.porDia).map(([fecha, data]) => ({
                fecha: new Date(fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                total: data.total,
                puntuales: data.puntuales,
                tardes: data.tardes
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="puntuales" stroke="#10b981" strokeWidth={2} name="Puntuales" />
                <Line type="monotone" dataKey="tardes" stroke="#ef4444" strokeWidth={2} name="Tardes" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Barras - Entradas vs Salidas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-green-600" size={24} />
              <h3 className="text-xl font-bold text-gray-800">Entradas vs Salidas</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(asistenciasStats.porDia).map(([fecha, data]) => ({
                fecha: new Date(fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                entradas: data.entradas,
                salidas: data.salidas
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
                <Bar dataKey="salidas" fill="#f59e0b" name="Salidas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">ℹ️ Información del Sistema</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ Auto-reparación ejecutándose cada 6 horas</li>
          <li>✅ Backups automáticos programados diariamente a las 2 AM</li>
          <li>✅ Diagnosticos en tiempo real disponibles</li>
          <li>✅ Panel de asistencias con estadísticas en tiempo real</li>
        </ul>
      </div>
    </div>
  );
}
