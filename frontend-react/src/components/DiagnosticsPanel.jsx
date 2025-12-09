/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { diagnosticsAPI } from '../api/endpoints';

export default function DiagnosticsPanel() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await diagnosticsAPI.execute();
      setDiagnostics(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error ejecutando diagnósticos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🔍 Diagnósticos del Sistema</h2>

      <button
        onClick={runDiagnostics}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
      >
        {loading ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} />}
        {loading ? 'Ejecutando...' : 'Ejecutar Diagnósticos'}
      </button>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex gap-2"
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      {diagnostics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 space-y-4"
        >
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-gray-800">📊 Resultados</h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatBox label="Total QR" value={diagnostics.total_qrs} color="blue" />
              <StatBox label="Faltantes" value={diagnostics.missing} color="red" />
              <StatBox label="Corruptos" value={diagnostics.corrupt} color="orange" />
              <StatBox label="Sin Logo" value={diagnostics.missing_logo} color="yellow" />
            </div>
          </div>

          {diagnostics.status === 'ok' ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex gap-2 items-center"
            >
              <CheckCircle size={24} />
              <span className="font-bold">✅ Sistema en perfecto estado</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg flex gap-2 items-center"
            >
              <AlertCircle size={24} />
              <span className="font-bold">⚠️ Se detectaron problemas - Auto-reparación iniciada</span>
            </motion.div>
          )}

          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p><strong>Timestamp:</strong> {new Date(diagnostics.timestamp).toLocaleString('es-ES')}</p>
            <p className="mt-1"><strong>Detalles:</strong> {diagnostics.details}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatBox({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className={`${colors[color]} p-3 rounded-lg text-center`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold">{label}</div>
    </div>
  );
}
