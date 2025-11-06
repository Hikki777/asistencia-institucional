/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit, Trash2, Download, Search, Filter, X, User, QrCode, Briefcase, Sun } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { TableSkeleton } from './LoadingSpinner';

const API_URL = 'http://localhost:5000/api';
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

export default function DocentesPanel() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJornada, setFilterJornada] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null);
  const [formData, setFormData] = useState({
    carnet: '',
    nombres: '',
    apellidos: '',
    sexo: '',
    grado: 'Docente',
    jornada: ''
  });

  useEffect(() => {
    fetchDocentes();
  }, []);

  const fetchDocentes = async () => {
    setLoading(true);
    try {
      const response = await client.get('/docentes');
      setDocentes(response.data.docentes || []);
    } catch (error) {
      console.error('Error fetching docentes:', error);
      toast.error('Error al cargar docentes: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading(editingDocente ? 'Actualizando docente...' : 'Creando docente...');
    
    try {
      if (editingDocente) {
        await client.put(`/docentes/${editingDocente.id}`, formData);
        toast.success('Docente actualizado correctamente', { id: toastId });
      } else {
        await client.post('/docentes', formData);
        toast.success('Docente creado correctamente', { id: toastId });
      }
      
      setShowModal(false);
      setEditingDocente(null);
      setFormData({
        carnet: '',
        nombres: '',
        apellidos: '',
        sexo: '',
        grado: 'Docente',
        jornada: ''
      });
      fetchDocentes();
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.error || error.message), { id: toastId });
    }
  };

  const handleEdit = (docente) => {
    setEditingDocente(docente);
    setFormData({
      carnet: docente.carnet,
      nombres: docente.nombres,
      apellidos: docente.apellidos,
      sexo: docente.sexo || '',
      grado: docente.grado || 'Docente',
      jornada: docente.jornada || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return;
    const toastId = toast.loading('Eliminando docente...');
    
    try {
      await client.delete(`/docentes/${id}`);
      toast.success(`${nombre} eliminado correctamente`, { id: toastId });
      fetchDocentes();
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.error || error.message), { id: toastId });
    }
  };

  const handleDownloadQR = async (id, nombre) => {
    const toastId = toast.loading('Generando código QR...');
    
    try {
      const response = await client.get(`/qr/${id}/png`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-docente-${nombre || id}.png`;
      a.click();
      toast.success('Código QR descargado', { id: toastId });
    } catch (error) {
      toast.error('Error descargando QR: ' + error.message, { id: toastId });
    }
  };

  // Filtrar docentes
  const filteredDocentes = docentes.filter((docente) => {
    const matchSearch = 
      docente.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.carnet.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchJornada = !filterJornada || docente.jornada === filterJornada;
    
    return matchSearch && matchJornada;
  });

  const jornadasUnicas = [...new Set(docentes.map(d => d.jornada).filter(Boolean))];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Users className="text-green-600" size={32} />
          Docentes
        </h2>
        <button
          onClick={() => {
            setEditingDocente(null);
            setFormData({
              carnet: '',
              nombres: '',
              apellidos: '',
              sexo: '',
              grado: 'Docente',
              jornada: ''
            });
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Nuevo Docente</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-md p-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Search size={16} />
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre o carnet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Sun size={16} />
              Jornada
            </label>
            <select
              value={filterJornada}
              onChange={(e) => setFilterJornada(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {jornadasUnicas.map((jornada) => (
                <option key={jornada} value={jornada}>
                  {jornada}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600 font-medium">
              {filteredDocentes.length} de {docentes.length} docente(s)
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabla de Docentes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {loading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : filteredDocentes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <User size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No hay docentes registrados</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Carnet</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nombre Completo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Jornada</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Estado</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDocentes.map((docente, index) => (
                    <motion.tr
                      key={docente.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-green-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-purple-600">
                          {docente.carnet}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {docente.nombres} {docente.apellidos}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {docente.jornada || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          docente.estado === 'activo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {docente.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {docente.codigos_qr && docente.codigos_qr.length > 0 && (
                            <button
                              onClick={() => handleDownloadQR(docente.codigos_qr[0].id, docente.carnet)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Descargar QR"
                            >
                              <Download size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(docente)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(docente.id, `${docente.nombres} ${docente.apellidos}`)}
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
              {filteredDocentes.map((docente, index) => (
                <motion.div
                  key={docente.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-900">{docente.nombres} {docente.apellidos}</div>
                      <div className="text-sm text-green-600 font-mono font-semibold">{docente.carnet}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      docente.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {docente.estado}
                    </span>
                  </div>
                  {docente.jornada && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <Sun size={14} />
                      {docente.jornada}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {docente.codigos_qr && docente.codigos_qr.length > 0 && (
                      <button
                        onClick={() => handleDownloadQR(docente.codigos_qr[0].id, docente.carnet)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <Download size={16} />
                        QR
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(docente)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(docente.id, `${docente.nombres} ${docente.apellidos}`)}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingDocente ? 'Editar Docente' : 'Nuevo Docente'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <input
                    type="text"
                    required
                    value={formData.grado}
                    onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Docente"
                  />
                </div>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
                <select
                  value={formData.jornada}
                  onChange={(e) => setFormData({ ...formData, jornada: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleccionar</option>
                  <option value="Matutina">Matutina</option>
                  <option value="Vespertina">Vespertina</option>
                  <option value="Nocturna">Nocturna</option>
                </select>
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
                  {editingDocente ? 'Actualizar' : 'Crear'}
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
