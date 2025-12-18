/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, Upload, Building2, Clock, AlertCircle, Users, Trash2, Plus, X, Server, AlertOctagon, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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

// --- SUBCOMPONENT: Settings Sidebar ---
const SettingsSidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'institucion', label: 'Institucional', icon: Building2 },
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: Users },
    { id: 'sistema', label: 'Sistema y Reset', icon: Server },
  ];

  return (
    <div className="md:w-64 flex-shrink-0">
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-400'} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// --- SUBCOMPONENT: Institucion Settings ---
const InstitucionSettings = ({ formData, setFormData, logoPreview, handleLogoChange, handleSubmit, saving }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-8"
  >
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Building2 size={24} className="text-blue-600" />
        Información General
      </h3>
      <p className="text-sm text-gray-500 mt-1">Configura los datos principales de tu centro educativo.</p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre de la Institución *
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Colegio San José"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dirección
          </label>
          <input
            type="text"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5"
            placeholder="Calle, número, colonia, ciudad"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">País</label>
            <input
              type="text"
              value={formData.pais}
              onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Departamento/Estado</label>
            <input
              type="text"
              value={formData.departamento}
              onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5"
            />
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-md font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Upload size={20} className="text-blue-600" />
          Logo Institucional
        </h4>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {logoPreview && (
            <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <img src={logoPreview} alt="Logo" className="w-32 h-32 object-contain" />
            </div>
          )}
          <div className="flex-1 w-full">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleLogoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <AlertCircle size={12} />
              Máx 10MB. Al guardar, los códigos QR se regenerarán con el nuevo logo.
            </p>
          </div>
        </div>
      </div>

      {/* Horarios */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-md font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-600" />
          Horarios y Puntualidad
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entrada</label>
            <input
              type="time"
              required
              value={formData.horario_inicio}
              onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salida</label>
            <input
              type="time"
              required
              value={formData.horario_salida}
              onChange={(e) => setFormData({ ...formData, horario_salida: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tolerancia (min)</label>
            <input
              type="number"
              min="0"
              max="60"
              value={formData.margen_puntualidad_min}
              onChange={(e) => setFormData({ ...formData, margen_puntualidad_min: parseInt(e.target.value) })}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  </motion.div>
);

// --- SUBCOMPONENT: Usuario Settings ---
const UsuarioSettings = ({ usuarios, loadingUsers, showUserModal, setShowUserModal, newUser, setNewUser, handleCreateUser, handleDeleteUser, fetchUsuarios }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6"
  >
    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Users size={24} className="text-blue-600" />
          Gestión de Usuarios
        </h3>
        <p className="text-sm text-gray-500 mt-1">Control de acceso y roles para administradores y operadores.</p>
      </div>
      <button
        onClick={() => setShowUserModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
      >
        <Plus size={16} />
        Crear Usuario
      </button>
    </div>

    {/* Tabla Usuarios */}
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Usuario</th>
            <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Rol</th>
            <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Cargo</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {usuarios.length > 0 ? (
            usuarios.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{user.nombres} {user.apellidos}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.rol === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {user.rol === 'admin' ? 'Administrador' : 'Operador'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {user.cargo || '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                {loadingUsers ? 'Cargando usuarios...' : 'No hay usuarios registrados.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Modal Crear Usuario */}
    {showUserModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Nuevo Usuario</h3>
            <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Contraseña</label>
              <input
                type="password"
                value={newUser.password}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombres</label>
                <input
                  type="text"
                  value={newUser.nombres}
                  onChange={e => setNewUser({...newUser, nombres: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Apellidos</label>
                <input
                  type="text"
                  value={newUser.apellidos}
                  onChange={e => setNewUser({...newUser, apellidos: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Rol</label>
              <select
                value={newUser.rol}
                onChange={e => setNewUser({...newUser, rol: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="operador">Operador (Básico)</option>
                <option value="admin">Administrador (Total)</option>
              </select>
            </div>
          </div>

          <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
            <button
              onClick={() => setShowUserModal(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateUser}
              disabled={!newUser.email || !newUser.password}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              Crear Usuario
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </motion.div>
);

// --- SUBCOMPONENT: Sistema Settings ---
const SistemaSettings = () => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [resetting, setResetting] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const response = await client.get('/metrics');
      setSystemInfo(response.data);
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };

  const handleFactoryReset = async () => {
    // Validar código de confirmación
    const expectedCode = 'RESET-' + new Date().getFullYear();
    if (resetCode !== expectedCode) {
      toast.error(`Código incorrecto. Debe ser: ${expectedCode}`);
      return;
    }
    
    // Triple confirmación
    const finalConfirm = window.confirm(
      '⚠️ ÚLTIMA ADVERTENCIA ⚠️\n\n' +
      'Esto eliminará PERMANENTEMENTE:\n' +
      '- Todos los alumnos\n' +
      '- Todo el personal\n' +
      '- Todas las asistencias\n' +
      '- Todos los códigos QR\n\n' +
      '¿Estás ABSOLUTAMENTE seguro?'
    );
    
    if (!finalConfirm) {
      setConfirmReset(false);
      setResetCode('');
      return;
    }

    setResetting(true);
    try {
      await client.post('/admin/reset-factory');
      toast.success('Sistema restablecido correctamente. Recargando...');
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/setup';
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error('Error al resetear: ' + (error.response?.data?.error || error.message));
      setResetting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Información del Sistema */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
          <Server size={24} className="text-blue-600" />
          Información del Sistema
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Versión</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">HikariOpen v1.0.1</p>
          </div>
          
          {systemInfo && (
            <>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Uptime</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.floor(systemInfo.uptime.hours)}h {Math.floor((systemInfo.uptime.hours % 1) * 60)}m
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Base de Datos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {systemInfo.database.alumnos + systemInfo.database.personal} registros
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {systemInfo.database.alumnos} alumnos, {systemInfo.database.personal} personal
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Memoria Usada</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {systemInfo.system.memoryUsage.rss}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>ℹ️ Información:</strong> El sistema está funcionando correctamente. 
            La base de datos está conectada a Supabase (PostgreSQL).
          </p>
        </div>
      </div>

      {/* Factory Reset */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h4 className="text-red-700 dark:text-red-400 font-bold flex items-center gap-2 mb-2">
            <AlertOctagon size={24} />
            Zona de Peligro: Restablecimiento de Fábrica
          </h4>
          <p className="text-sm text-red-600 dark:text-red-300 mb-6 max-w-2xl">
            Esta acción eliminará permanentemente todos los registros de asistencias, datos de alumnos y personal docente. 
            La configuración institucional y los usuarios administradores se mantendrán. 
            <span className="font-bold underline ml-1">Esta acción no se puede deshacer.</span>
          </p>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Iniciar Proceso de Reset
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                  Código de Confirmación
                </label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder={`Escribe: RESET-${new Date().getFullYear()}`}
                  className="w-full max-w-md px-4 py-2 border-2 border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-900 dark:text-white"
                  disabled={resetting}
                />
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Escribe <code className="bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">RESET-{new Date().getFullYear()}</code> para confirmar
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setConfirmReset(false);
                    setResetCode('');
                  }}
                  className="text-gray-600 dark:text-gray-300 hover:underline text-sm"
                  disabled={resetting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFactoryReset}
                  disabled={resetting || resetCode !== `RESET-${new Date().getFullYear()}`}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AlertOctagon size={18} />
                  {resetting ? 'Reseteando...' : 'CONFIRMAR BORRADO TOTAL'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
export default function ConfiguracionPanel() {
  const [activeTab, setActiveTab] = useState('institucion');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    horario_inicio: '',
    horario_salida: '',
    margen_puntualidad_min: 5,
    direccion: '',
    email: '',
    telefono: '',
    pais: '',
    departamento: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);

  // Users State
  const [usuarios, setUsuarios] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nombres: '',
    apellidos: '',
    cargo: '',
    rol: 'operador'
  });
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoadingUsers(true);
    try {
      const response = await client.get('/usuarios');
      setUsuarios(response.data.usuarios || []);
    } catch (error) {
      console.warn('Error fetching usuarios:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await client.post('/usuarios', newUser);
      toast.success('Usuario creado exitosamente');
      setShowUserModal(false);
      setNewUser({ email: '', password: '', nombres: '', apellidos: '', cargo: '', rol: 'operador' });
      fetchUsuarios();
    } catch (error) {
      toast.error('Error al crear usuario: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      await client.delete(`/usuarios/${id}`);
      toast.success('Usuario eliminado');
      fetchUsuarios();
    } catch (error) {
      toast.error('Error al eliminar usuario: ' + (error.response?.data?.error || error.message));
    }
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await client.get('/institucion');
      const data = response.data;
      setFormData({
        nombre: data.nombre || '',
        horario_inicio: data.horario_inicio || '',
        horario_salida: data.horario_salida || '',
        margen_puntualidad_min: data.margen_puntualidad_min || 5,
        direccion: data.direccion || '',
        email: data.email || '',
        telefono: data.telefono || '',
        pais: data.pais || '',
        departamento: data.departamento || ''
      });
      
      if (data.logo_path) {
        const logoUrl = data.logo_path.startsWith('http') 
          ? data.logo_path 
          : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/uploads/${data.logo_path}?t=${Date.now()}`;
        setLogoPreview(logoUrl);
      }
    } catch (error) {
      console.error('Error fetching institucion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El logo debe pesar menos de 10MB');
      return;
    }

    if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
      toast.error('Solo se permiten imágenes PNG, JPG o JPEG');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setLogoBase64(base64);
      setLogoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        ...(logoBase64 && { logo_base64: logoBase64 })
      };

      await client.put('/institucion', dataToSend);
      toast.success('Configuración guardada correctamente');
      
      if (logoBase64) {
        setLogoBase64(null);
        fetchConfig();
      }
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Settings className="text-blue-600" size={36} />
          Configuración Global
        </h2>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'institucion' && (
              <InstitucionSettings 
                key="institucion"
                formData={formData} 
                setFormData={setFormData}
                logoPreview={logoPreview}
                handleLogoChange={handleLogoChange}
                handleSubmit={handleSubmit}
                saving={saving}
              />
            )}
            {activeTab === 'usuarios' && (
              <UsuarioSettings 
                key="usuarios"
                usuarios={usuarios}
                loadingUsers={loadingUsers}
                showUserModal={showUserModal}
                setShowUserModal={setShowUserModal}
                newUser={newUser}
                setNewUser={setNewUser}
                handleCreateUser={handleCreateUser}
                handleDeleteUser={handleDeleteUser}
                fetchUsuarios={fetchUsuarios}
              />
            )}
            {activeTab === 'sistema' && (
              <SistemaSettings key="sistema" />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
