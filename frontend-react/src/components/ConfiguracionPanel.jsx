/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Upload, Building2, Clock, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    fetchInstitucion();
  }, []);

  const fetchInstitucion = async () => {
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
        fetchInstitucion();
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Institución *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Colegio San José"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Calle, número, colonia, ciudad"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="contacto@institucion.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="+503 1234-5678"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      value={formData.pais}
                      onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Guatemala"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Guatemala"
                    />
                </div>
              </div>
            </div>
          </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subir nuevo logo (PNG, JPG - máx 10MB)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario de Inicio *
                </label>
                <input
                  type="time"
                  required
                  value={formData.horario_inicio}
                  onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario de Salida *
                </label>
                <input
                  type="time"
                  required
                  value={formData.horario_salida}
                  onChange={(e) => setFormData({ ...formData, horario_salida: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margen Puntualidad (min) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={formData.margen_puntualidad_min}
                  onChange={(e) => setFormData({ ...formData, margen_puntualidad_min: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={fetchInstitucion}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 dark:text-gray-100 font-bold py-3 px-6 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition"
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

