/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, LogIn } from 'lucide-react';
import { authAPI } from '../api/endpoints';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await authAPI.login(email, password);
      if (data?.accessToken) {
        localStorage.setItem('token', data.accessToken);
        window.location.href = '/';
      } else {
        setError('Respuesta inesperada del servidor');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error al iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">🎓 Sistema de Registro</h1>
          <p className="text-gray-600">Sistema de Registro Institucional</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              placeholder="admin@escuela.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex gap-2 items-center"
            >
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-6"
          >
            <LogIn size={20} />
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-900">
          <p><strong>Nota:</strong> Credenciales válidas son las del usuario creado al inicializar la institución.</p>
        </div>
      </motion.div>
    </div>
  );
}
