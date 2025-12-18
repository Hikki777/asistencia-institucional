import React, { useState, useEffect } from "react";
import {
  Activity,
  Users,
  QrCode,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  healthAPI,
  alumnosAPI,
  asistenciasAPI,
  docentesAPI,
  institucionAPI,
} from "../api/endpoints";
import toast, { Toaster } from "react-hot-toast";
import offlineQueueService from "../services/offlineQueue";
import { CardSkeleton } from "./LoadingSpinner";

export default function Dashboard() {
  const [stats, setStats] = useState({
    status: "unknown",
    alumnos: 0,
    personal: 0,
    qrs: 0,
  });
  const [institucion, setInstitucion] = useState(null);
  const [asistenciasStats, setAsistenciasStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado de red local y cola
  const [isNetworkOnline, setIsNetworkOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

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

  // Monitor de red y cola offline
  useEffect(() => {
    const updateStatus = async () => {
      setIsNetworkOnline(navigator.onLine);
      const count = await offlineQueueService.getPendingCount();
      setPendingSync(count);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    
    // Intervalo para verificar la cola
    const queueInterval = setInterval(async () => {
      const count = await offlineQueueService.getPendingCount();
      setPendingSync(count);
    }, 2000);

    // Actualizar al montar
    updateStatus();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(queueInterval);
    };
  }, []);

  const fetchInstitucion = async () => {
    try {
      const response = await institucionAPI.get();
      setInstitucion(response.data);
    } catch (error) {
      console.error("Error fetching institucion:", error);
    }
  };

  const fetchAsistenciasStats = async () => {
    try {
      const response = await asistenciasAPI.stats(7);
      setAsistenciasStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching asistencias stats:", error);
      toast.error("Error al cargar estadísticas de asistencias");
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Usar qrAPI.list para contar QRs reales en BD en lugar de diagnostics
      const [health, alumnos, personalResp] = await Promise.all([
        healthAPI.check().catch(() => ({ data: { status: "error" } })),
        alumnosAPI.list().catch(() => ({ data: { total: 0, alumnos: [] } })),
        docentesAPI.list().catch(() => ({ data: { personal: [] } })),
      ]);

      const newStatus = health.data?.status === "ok" ? "online" : "offline";
      setStats({
        status: newStatus,
        alumnos: alumnos.data?.total || 0,
        personal:
          personalResp.data?.personal?.length ||
          personalResp.data?.docentes?.length ||
          0,
        qrs: 0, // Ya no contamos QRs por diagnóstico de archivos. Podríamos implementar un endpoint de conteo si fuera vital.
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error al cargar estadísticas del sistema");
      setStats((prev) => ({ ...prev, status: "error" }));
    }
  };

  /* eslint-disable no-unused-vars */
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border-l-4 border-${color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">{label}</p>
          <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400 mt-2`}>{value}</p>
        </div>
        <Icon className={`text-${color}-600 dark:text-${color}-500 opacity-40 dark:opacity-30`} size={48} />
      </div>
    </div>
  );
  /* eslint-enable no-unused-vars */

  return (
    <div className="space-y-6">
      {/* Header con nombre e información institucional */}
      {institucion && (
        <div className="bg-white dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-2xl p-8 text-gray-800 dark:text-white relative overflow-hidden border border-gray-200 dark:border-transparent">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

          <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
            <div className="flex items-center gap-6">
              {institucion.logo_path ? (
                <div className="bg-white p-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <img
                    src={
                      institucion.logo_path.startsWith("http")
                        ? institucion.logo_path
                        : `${import.meta.env.VITE_API_URL}/uploads/${
                            institucion.logo_path
                          }?t=${Date.now()}`
                    }
                    alt="Logo institucional"
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      console.error("Error cargando logo");
                    }}
                  />
                </div>
              ) : (
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <Activity className="text-blue-400 w-16 h-16" />
                </div>
              )}

              <div>
                <h1 className="text-xl md:text-2xl font-bold mb-4 text-blue-400">
                  {institucion.nombre}
                </h1>
                {(institucion.direccion || institucion.email || institucion.pais) && (
                  <div className="mt-0 flex flex-wrap gap-4 text-sm text-slate-400">
                    {institucion.direccion && (
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300">
                        📍 {institucion.direccion}
                      </span>
                    )}
                    {institucion.email && (
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300">
                        ✉️ {institucion.email}
                      </span>
                    )}
                    {institucion.pais && (
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300">
                        🌍 {institucion.pais}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-slate-300 font-medium text-lg flex items-center gap-2 mt-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  HikariOpen System
                </p>
              </div>
            </div>

            <div className="text-right space-y-2 bg-slate-50 dark:bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-end gap-2 text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Horario Entrada:
                </span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  {institucion.horario_inicio || "--:--"}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-400">
                  Horario Salida:
                </span>
                <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                  {institucion.horario_salida || "--:--"}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-400">Tolerancia:</span>
                <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                  {institucion.margen_puntualidad_min} min
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Banner */}
      <div
        className={`rounded-lg p-4 flex items-center justify-between gap-3 ${
          isNetworkOnline && stats.status !== "error"
            ? "bg-green-100 dark:bg-emerald-900/40 text-green-800 dark:text-emerald-200 border border-green-200 dark:border-emerald-800"
            : "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isNetworkOnline && stats.status !== "error" ? "bg-green-600" : "bg-red-600"
            } animate-pulse`}
          ></div>
          <span className="font-semibold flex items-center gap-2">
            Sistema{" "}
            {isNetworkOnline 
              ? (stats.status === "online" ? "🟢 En Línea" : "🔴 Backend Inaccesible") 
              : "📡 Modo Sin Conexión"}
          </span>
        </div>

        {!isNetworkOnline ? (
           <div className="flex items-center gap-2 bg-red-200/50 px-3 py-1 rounded-full text-sm font-bold">
             <WifiOff size={18} />
             <span>Sin Internet</span>
           </div>
        ) : pendingSync > 0 ? (
           <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full text-yellow-800 text-sm font-bold animate-pulse">
             <Activity size={18} />
             <span>Sincronizando {pendingSync} registros...</span>
           </div>
        ) : (
           <div className="flex items-center gap-2 bg-green-200/50 dark:bg-emerald-800/50 px-3 py-1 rounded-full text-sm font-bold text-green-800 dark:text-emerald-100">
             <Wifi size={18} />
             <span>Conectado</span>
           </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {loading ? (
          <CardSkeleton count={5} />
        ) : (
          <>
            <StatCard
              icon={Activity}
              label="Estado"
              value={stats.status === "online" ? "✓" : "✗"}
              color={stats.status === "online" ? "green" : "red"}
            />
            <StatCard
              icon={Users}
              label="Alumnos"
              value={stats.alumnos}
              color="blue"
            />
            <StatCard
              icon={Users}
              label="Personal"
              value={stats.personal}
              color="green"
            />
            <StatCard
              icon={QrCode}
              label="QR Generados"
              value={stats.qrs}
              color="blue"
            />
          </>
        )}
      </div>

      {/* Gráficos de Asistencias */}
      {!loading && asistenciasStats && asistenciasStats.porDia && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Líneas - Tendencia */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">
                Tendencia de Asistencias
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={Object.entries(asistenciasStats.porDia).map(
                  ([fecha, data]) => ({
                    fecha: new Date(fecha).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    }),
                    total: data.total,
                    puntuales: data.puntuales,
                    tardes: data.tardes,
                  })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total"
                />
                <Line
                  type="monotone"
                  dataKey="puntuales"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Puntuales"
                />
                <Line
                  type="monotone"
                  dataKey="tardes"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Tardes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Barras - Entradas vs Salidas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-green-600 dark:text-green-400" size={24} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200">
                Entradas vs Salidas
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(asistenciasStats.porDia).map(
                  ([fecha, data]) => ({
                    fecha: new Date(fecha).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    }),
                    entradas: data.entradas,
                    salidas: data.salidas,
                  })
                )}
              >
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

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}
