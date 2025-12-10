/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit, Trash2, Download, Search, Filter, X, User, QrCode, Briefcase, Sun, CheckCircle, XCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { TableSkeleton } from './LoadingSpinner';

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

export default function PersonalPanel() {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJornada, setFilterJornada] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(null);
  const [formData, setFormData] = useState({
    carnet: '',
    nombres: '',
    apellidos: '',
    sexo: '',
    cargo: 'Docente',
    jornada: ''
  });

  useEffect(() => {
    fetchPersonal();
  }, []);

  const fetchPersonal = async () => {
    setLoading(true);
    try {
      const response = await client.get('/docentes');
      console.log('👨‍🏫 Respuesta de personal:', response.data);
      setPersonal(response.data.personal || []);
    } catch (error) {
      console.error('Error fetching personal:', error);
      toast.error('Error al cargar personal: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading(editingPersonal ? 'Actualizando miembro...' : 'Creando miembro...');
    
    try {
      const dataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'preview' && key !== 'foto' && value !== '' && value !== null && value !== undefined) {
          dataToSend.append(key, value);
        }
      });

      if (formData.foto) {
        dataToSend.append('foto', formData.foto);
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingPersonal) {
        await client.put(`/docentes/${editingPersonal.id}`, dataToSend, config);
        toast.success('Miembro actualizado correctamente', { id: toastId });
      } else {
        await client.post('/docentes', dataToSend, config);
        toast.success('Miembro creado correctamente', { id: toastId });
      }
      
      setShowModal(false);
      setEditingPersonal(null);
      setFormData({
        carnet: '',
        nombres: '',
        apellidos: '',
        sexo: '',
        cargo: 'Docente',
        jornada: '',
        foto: null,
        preview: null
      });
      fetchPersonal();
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.error || error.message), { id: toastId });
    }
  };

  const handleEdit = (miembro) => {
    setEditingPersonal(miembro);
    setFormData({
      carnet: miembro.carnet,
      nombres: miembro.nombres,
      apellidos: miembro.apellidos,
      sexo: miembro.sexo || '',
      cargo: miembro.cargo || 'Docente',
      jornada: miembro.jornada || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return;
    const toastId = toast.loading('Eliminando miembro...');
    
    try {
      await client.delete(`/docentes/${id}`);
      toast.success(`${nombre} eliminado correctamente`, { id: toastId });
      fetchPersonal();
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.error || error.message), { id: toastId });
    }
  };

  const handleToggleEstado = async (id, estadoActual, nombre) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    const toastId = toast.loading(`Cambiando estado a ${nuevoEstado}...`);
    
    try {
      await client.put(`/docentes/${id}`, { estado: nuevoEstado });
      toast.success(`${nombre} ahora está ${nuevoEstado}`, { id: toastId });
      fetchPersonal();
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.error || error.message), { id: toastId });
    }
  };

  const handleDownloadQR = async (id, nombre) => {
    const toastId = toast.loading('Generando código QR...');
    
    try {
      const response = await client.get(`/qr/${id}/png`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-miembro-${nombre || id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Código QR descargado', { id: toastId });
    } catch (error) {
      console.error('Error downloading QR:', error);
      toast.error('Error descargando QR: ' + error.message, { id: toastId });
    }
  };

  // Filtrar personal
  const filteredPersonal = personal.filter((miembro) => {
    const matchSearch = 
      miembro.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      miembro.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      miembro.carnet.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchJornada = !filterJornada || miembro.jornada === filterJornada;
    const matchEstado = !filterEstado || miembro.estado === filterEstado;
    
    return matchSearch && matchJornada && matchEstado;
  });

  const jornadasUnicas = [...new Set(personal.map(d => d.jornada).filter(Boolean))];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Users className="text-success dark:text-success-light" size={32} />
          Personal
        </h2>
        <button
          onClick={() => {
            setEditingPersonal(null);
            setFormData({
              carnet: '',
              nombres: '',
              apellidos: '',
              sexo: '',
              categoria: 'Docente',
              jornada: ''
            });
            setShowModal(true);
          }}
          className="bg-success hover:bg-success-dark dark:bg-success-light dark:hover:bg-success text-white font-bold py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Nuevo miembro</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Search size={16} />
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre o carnet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Sun size={16} />
              Jornada
            </label>
            <select
              value={filterJornada}
              onChange={(e) => setFilterJornada(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100"
            >
              <option value="">Todas</option>
              {jornadasUnicas.map((jornada) => (
                <option key={jornada} value={jornada}>
                  {jornada}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter size={16} />
              Estado
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {filteredPersonal.length} de {personal.length} miembro(s)
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabla de personal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        {loading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : filteredPersonal.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <User size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>No hay personal registrados</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-success dark:bg-success-dark text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Carnet</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nombre Completo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Cargo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Jornada</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Estado</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPersonal.map((miembro, index) => (
                    <motion.tr
                      key={miembro.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-success dark:text-success-light">
                          {miembro.carnet}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {miembro.nombres} {miembro.apellidos}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {miembro.cargo || 'Sin cargo'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {miembro.jornada || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          miembro.estado === 'activo'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {miembro.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {miembro.codigos_qr && miembro.codigos_qr.length > 0 && (
                            <button
                              onClick={() => handleDownloadQR(miembro.codigos_qr[0].id, miembro.carnet)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Descargar QR"
                            >
                              <Download size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleEstado(miembro.id, miembro.estado, `${miembro.nombres} ${miembro.apellidos}`)}
                            className={`p-2 rounded-lg transition ${
                              miembro.estado === 'activo'
                                ? 'text-orange-600 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={miembro.estado === 'activo' ? 'Desactivar' : 'Activar'}
                          >
                            {miembro.estado === 'activo' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                          </button>
                          <button
                            onClick={() => handleEdit(miembro)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(miembro.id, `${miembro.nombres} ${miembro.apellidos}`)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredPersonal.map((miembro, index) => (
                <motion.div
                  key={miembro.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-900">
                        {miembro.nombres} {miembro.apellidos}
                      </div>
                      <div className="text-sm text-green-600 font-mono font-semibold">{miembro.carnet}</div>
                      {miembro.cargo && (
                        <div className="text-xs text-gray-600 mt-1">
                          {miembro.cargo}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      miembro.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {miembro.estado}
                    </span>
                  </div>
                  {miembro.jornada && (
                    <div className="flex items-center gap-1 text-sm text-gray-900 font-medium mb-3">
                      <Sun size={14} />
                      {miembro.jornada}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {miembro.codigos_qr && miembro.codigos_qr.length > 0 && (
                      <button
                        onClick={() => handleDownloadQR(miembro.codigos_qr[0].id, miembro.carnet)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <Download size={16} />
                        QR
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleEstado(miembro.id, miembro.estado, `${miembro.nombres} ${miembro.apellidos}`)}
                      className={`flex-1 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition ${
                        miembro.estado === 'activo'
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {miembro.estado === 'activo' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      {miembro.estado === 'activo' ? 'Inactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleEdit(miembro)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(miembro.id, `${miembro.nombres} ${miembro.apellidos}`)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingPersonal ? 'Editar miembro' : 'Nuevo miembro'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mb-2 border-2 border-dashed border-slate-400 relative">
                    {formData.preview ? (
                      <img src={formData.preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-slate-400" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setFormData({
                            ...formData,
                            foto: file,
                            preview: URL.createObjectURL(file)
                          });
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-sm text-slate-500">Toca para subir foto</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carnet *</label>
                  <input
                    type="text"
                    required
                    value={formData.carnet}
                    onChange={(e) => setFormData({ ...formData, carnet: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="D001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
                  <select
                    required
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">-</option>
                    <option value="Docente">Docente</option>
                    <option value="Director">Director</option>
                    <option value="Directora">Directora</option>
                    <option value="Secretaria">Secretaria</option>
                    <option value="Secretario">Secretario</option>
                    <option value="Operativo">Operativo</option>
                    <option value="Auxiliar">Auxiliar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">-</option>
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
                  <select
                    value={formData.jornada}
                    onChange={(e) => setFormData({ ...formData, jornada: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">-</option>
                    <option value="Matutina">Matutina</option>
                    <option value="Vespertina">Vespertina</option>
                    <option value="Nocturna">Nocturna</option>
                    <option value="Semipresencial">Semipresencial</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Fin de Semana (Sábado)">Fin de Semana (Sábado)</option>
                    <option value="Fin de Semana (Domingo)">Fin de Semana (Domingo)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2.5 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition"
                >
                  {editingPersonal ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Toast notifications */}
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#363636',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
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



