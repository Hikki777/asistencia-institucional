/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Upload, Building2, Clock, AlertCircle, Users, Trash2, Plus, X } from 'lucide-react';
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

export default function ConfiguracionPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    horario_inicio: '',
    horario_salida: '',
    margen_puntualidad_min: 5,
    direccion: '',
    email: '',
    telefono: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);

  /* Estados para gestión de usuarios */
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
      console.error('Error fetching usuarios:', error);
      // No mostramos error si es 403 (no admin), simplemente lista vacía
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await client.post('/usuarios', newUser);
      alert('Usuario creado exitosamente');
      setShowUserModal(false);
      setNewUser({ email: '', password: '', nombres: '', apellidos: '', cargo: '', rol: 'operador' });
      fetchUsuarios();
    } catch (error) {
      alert('Error al crear usuario: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      await client.delete(`/usuarios/${id}`);
      alert('Usuario eliminado');
      fetchUsuarios();
    } catch (error) {
      alert('Error al eliminar usuario: ' + (error.response?.data?.error || error.message));
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
        // Check if it's a Cloudinary URL or local path
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

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El logo debe pesar menos de 10MB');
      return;
    }

    // Validar tipo
    if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
      alert('Solo se permiten imágenes PNG, JPG o JPEG');
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
      
      alert('✅ Configuración guardada correctamente');
      
      // Si había nuevo logo, recargar datos
      if (logoBase64) {
        setLogoBase64(null);
        fetchConfig();
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('❌ Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Settings className="text-blue-600" size={36} />
          Configuración Institucional
        </h2>
      </motion.div>

      {/* Formulario */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Building2 size={24} className="text-blue-600" />
              Información General
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la Institución *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
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
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Calle, número, colonia, ciudad"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="contacto@institucion.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="+503 1234-5678"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      value={formData.pais}
                      onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Ej: Guatemala"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Ej: Guatemala"
                    />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN GESTIÓN DE USUARIOS */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Users className="text-blue-600" />
                  Usuarios del Sistema
                </h3>
                <p className="text-sm text-gray-500 mt-1">Administrar acceso al panel</p>
              </div>
              <button
                type="button"
                onClick={() => setShowUserModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Nuevo Usuario
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Usuario</th>
                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Rol</th>
                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">Cargo</th>
                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 text-right">Acciones</th>
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
                            type="button"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                        {loadingUsers ? 'Cargando usuarios...' : 'No hay usuarios registrados o no tienes permisos.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODAL NUEVO USUARIO */}
          {showUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Nuevo Usuario</h3>
                  <button type="button" onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombres</label>
                      <input
                        type="text"
                        value={newUser.nombres}
                        onChange={e => setNewUser({...newUser, nombres: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellidos</label>
                      <input
                        type="text"
                        value={newUser.apellidos}
                        onChange={e => setNewUser({...newUser, apellidos: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cargo</label>
                    <input
                      type="text"
                      value={newUser.cargo}
                      onChange={e => setNewUser({...newUser, cargo: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Ej: Secretaria, Auxiliar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                    <select
                      value={newUser.rol}
                      onChange={e => setNewUser({...newUser, rol: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="operador">Operador (Solo registro)</option>
                      <option value="admin">Administrador (Acceso total)</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateUser}
                    disabled={!newUser.email || !newUser.password}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Crear Usuario
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Logo */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Upload size={24} className="text-blue-600" />
              Logo Institucional
            </h3>
            <div className="space-y-4">
              {logoPreview && (
                <div className="flex justify-center">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-md max-h-64 object-contain border border-gray-300 dark:border-gray-600 rounded-lg p-4"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subir nuevo logo (PNG, JPG - máx 10MB)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoChange}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <p className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  Al cambiar el logo, todos los códigos QR se regenerarán automáticamente
                </p>
              </div>
            </div>
          </div>

          {/* Horarios y Puntualidad */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Clock size={24} className="text-blue-600" />
              Horarios y Puntualidad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Horario de Inicio *
                </label>
                <input
                  type="time"
                  required
                  value={formData.horario_inicio}
                  onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Horario de Salida *
                </label>
                <input
                  type="time"
                  required
                  value={formData.horario_salida}
                  onChange={(e) => setFormData({ ...formData, horario_salida: e.target.value })}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Margen Puntualidad (min) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={formData.margen_puntualidad_min}
                  onChange={(e) => setFormData({ ...formData, margen_puntualidad_min: parseInt(e.target.value) })}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={fetchInstitucion}
              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save size={20} />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}



