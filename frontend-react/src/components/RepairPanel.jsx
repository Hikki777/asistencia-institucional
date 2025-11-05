/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader, RotateCw } from 'lucide-react';
import { repairAPI } from '../api/endpoints';

export default function RepairPanel() {
  const [repairing, setRepairing] = useState(false);
  const [repairLog, setRepairLog] = useState([]);
  const [status, setStatus] = useState(null);

  const handleRepair = async (type) => {
    setRepairing(true);
    setStatus(null);
    setRepairLog([]);

    try {
      const startTime = new Date().toLocaleTimeString('es-ES');
      setRepairLog([`[${startTime}] Iniciando reparación...`]);

      let response;
      if (type === 'qrs') {
        response = await repairAPI.regenerateQrs();
        setRepairLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString('es-ES')}] QR regenerados: ${response.data.regenerated || 0}`,
        ]);
      } else if (type === 'logo') {
        response = await repairAPI.regenerateLogo();
        setRepairLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString('es-ES')}] Logo regenerado correctamente`,
        ]);
      }

      setStatus({ type: 'success', message: '✅ Reparación completada exitosamente' });
      setRepairLog((prev) => [...prev, `[${new Date().toLocaleTimeString('es-ES')}] ✅ Proceso completado`]);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || '❌ Error durante la reparación' });
      setRepairLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString('es-ES')}] ❌ ${error.response?.data?.message || error.message}`,
      ]);
    } finally {
      setRepairing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🔧 Panel de Reparación</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleRepair('qrs')}
          disabled={repairing}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          {repairing ? <Loader className="animate-spin" size={20} /> : <RotateCw size={20} />}
          Regenerar QR Codes
        </button>

        <button
          onClick={() => handleRepair('logo')}
          disabled={repairing}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          {repairing ? <Loader className="animate-spin" size={20} /> : <RotateCw size={20} />}
          Regenerar Logo
        </button>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-4 rounded-lg mb-4 flex gap-2 items-center ${
            status.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          <AlertCircle size={20} />
          <span className="font-bold">{status.message}</span>
        </motion.div>
      )}

      {repairLog.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto"
        >
          {repairLog.map((log, idx) => (
            <div key={idx} className="whitespace-pre-wrap break-words">
              {log}
            </div>
          ))}
        </motion.div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">ℹ️ Información</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>La reparación se ejecuta automáticamente cada 6 horas</li>
          <li>Los QR se regeneran desde la base de datos</li>
          <li>El logo se recompone en todos los QR</li>
          <li>Los archivos se respaldan antes de la reparación</li>
        </ul>
      </div>
    </motion.div>
  );
}
