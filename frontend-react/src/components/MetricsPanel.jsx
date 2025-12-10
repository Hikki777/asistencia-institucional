import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Server, 
  Database, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { CardSkeleton } from './LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function MetricsPanel() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // segundos

  useEffect(() => {
    fetchMetrics();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchMetrics();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const fetchMetrics = async () => {
    try {
      const response = await client.get('/metrics');
      setMetrics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Error al cargar métricas');
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Estás seguro de resetear todas las métricas? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await client.post('/metrics/reset');
      toast.success('Métricas reseteadas correctamente');
      fetchMetrics();
    } catch (error) {
      console.error('Error resetting metrics:', error);
      toast.error('Error al resetear métricas: ' + (error.response?.data?.error || error.message));
    }
  };

  const formatUptime = (hours) => {
    const h = Math.floor(parseFloat(hours));
    const m = Math.floor((parseFloat(hours) - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatBytes = (str) => {
    return str; // Ya viene formateado desde el backend
  };

  // Colores para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">📊 Métricas del Sistema</h2>
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
        <p className="text-gray-600 dark:text-gray-400">No se pudieron cargar las métricas</p>
      </div>
    );
  }

  // Preparar datos para gráficos
  const requestsData = [
    { name: '2xx Éxito', value: metrics.requests.byStatus['2xx'], color: '#10b981' },
    { name: '4xx Cliente', value: metrics.requests.byStatus['4xx'], color: '#f59e0b' },
    { name: '5xx Servidor', value: metrics.requests.byStatus['5xx'], color: '#ef4444' }
  ];

  const memoryData = [
    { name: 'Heap Usado', value: parseFloat(metrics.system.memoryUsage.heapUsed) },
    { name: 'Heap Total', value: parseFloat(metrics.system.memoryUsage.heapTotal) },
    { name: 'RSS', value: parseFloat(metrics.system.memoryUsage.rss) }
  ];

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={36} />
            Métricas del Sistema
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitoreo en tiempo real del rendimiento y uso de recursos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin text-blue-600' : 'text-gray-400'} />
              Auto-refresh ({refreshInterval}s)
            </label>
          </div>

          {/* Refresh interval selector */}
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>60s</option>
          </select>

          {/* Manual refresh */}
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>

          {/* Reset button (admin only) */}
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            title="Solo administradores"
          >
            <Trash2 size={16} />
            Reset
          </button>
        </div>
      </motion.div>

      {/* Cards de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Clock className="text-green-600" size={24} />}
          title="Uptime"
          value={formatUptime(metrics.uptime.hours)}
          subtitle={`Desde ${new Date(metrics.uptime.startedAt).toLocaleString('es-ES')}`}
          color="green"
        />
        <MetricCard
          icon={<Activity className="text-blue-600" size={24} />}
          title="Requests Totales"
          value={metrics.requests.total.toLocaleString()}
          subtitle={`Hit rate: ${metrics.cache.hitRate}`}
          color="blue"
        />
        <MetricCard
          icon={<Database className="text-purple-600" size={24} />}
          title="Base de Datos"
          value={`${metrics.database.alumnos + metrics.database.personal}`}
          subtitle={`${metrics.database.alumnos} alumnos, ${metrics.database.personal} personal`}
          color="purple"
        />
        <MetricCard
          icon={<Server className="text-orange-600" size={24} />}
          title="Memoria RSS"
          value={formatBytes(metrics.system.memoryUsage.rss)}
          subtitle={`Heap: ${formatBytes(metrics.system.memoryUsage.heapUsed)}`}
          color="orange"
        />
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests por status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={24} />
            Requests por Status Code
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={requestsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {requestsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            {requestsData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-700">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Memoria usage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Server className="text-purple-600" size={24} />
            Uso de Memoria
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={memoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toFixed(2)} MB`} />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Endpoints */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Activity className="text-green-600" size={24} />
          Top 10 Endpoints Más Usados
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Endpoint</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Requests</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">% del Total</th>
              </tr>
            </thead>
            <tbody>
              {metrics.requests.topEndpoints.length > 0 ? (
                metrics.requests.topEndpoints.map((endpoint, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-sm text-blue-600">{endpoint.path}</td>
                    <td className="px-4 py-3 text-right font-semibold">{endpoint.count}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {((endpoint.count / metrics.requests.total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No hay datos de endpoints todavía
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stats detallados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Base de datos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Database className="text-purple-600" size={20} />
            Base de Datos
          </h3>
          <div className="space-y-2">
            <StatRow label="Alumnos" value={metrics.database.alumnos} />
            <StatRow label="Personal" value={metrics.database.personal} />
            <StatRow label="Asistencias Hoy" value={metrics.database.asistenciasHoy} />
            <StatRow label="QRs Vigentes" value={metrics.database.qrsVigentes} />
            <StatRow label="Queries Totales" value={metrics.database.queries} />
            <StatRow label="Errores BD" value={metrics.database.errors} color="text-red-600 dark:text-red-400" />
          </div>
        </motion.div>

        {/* Caché */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Activity className="text-blue-600" size={20} />
            Sistema de Caché
          </h3>
          <div className="space-y-2">
            <StatRow label="Tamaño" value={metrics.cache.size} />
            <StatRow label="Activos" value={metrics.cache.active} color="text-green-600 dark:text-green-400" />
            <StatRow label="Expirados" value={metrics.cache.expired} color="text-orange-600 dark:text-orange-400" />
            <StatRow label="Hit Rate" value={metrics.cache.hitRate} color="text-blue-600 dark:text-blue-400" />
          </div>
        </motion.div>

        {/* Sistema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Server className="text-green-600" size={20} />
            Sistema
          </h3>
          <div className="space-y-2">
            <StatRow label="Node.js" value={metrics.system.nodeVersion} />
            <StatRow label="Plataforma" value={metrics.system.platform} />
            <StatRow label="Heap Usado" value={formatBytes(metrics.system.memoryUsage.heapUsed)} />
            <StatRow label="Heap Total" value={formatBytes(metrics.system.memoryUsage.heapTotal)} />
            <StatRow label="RSS" value={formatBytes(metrics.system.memoryUsage.rss)} />
          </div>
        </motion.div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800 dark:text-blue-100">
            <p className="font-semibold mb-1">ℹ️ Información de Métricas</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Las métricas se resetean al reiniciar el servidor</li>
              <li>Hit rate de caché: % de requests servidos desde caché</li>
              <li>Solo administradores pueden resetear las métricas</li>
              <li>Auto-refresh actualiza cada {refreshInterval} segundos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
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
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-100 dark:border-gray-700"
    >
      <div className={`bg-${color}-100 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
    </motion.div>
  );
}

function StatRow({ label, value, color = 'text-gray-900' }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}:</span>
      <span className={`text-sm font-semibold ${color === 'text-gray-900' ? 'text-gray-900 dark:text-gray-100' : color}`}>{value}</span>
    </div>
  );
}

