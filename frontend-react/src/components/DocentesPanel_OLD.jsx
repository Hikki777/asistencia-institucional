/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit2, Trash2, Download, Search, Filter } from 'lucide-react';
import axios from 'axios';

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
      alert('Error al cargar docentes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingDocente) {
        await client.put(`/docentes/${editingDocente.id}`, formData);
        alert('Docente actualizado correctamente');
      } else {
        await client.post('/docentes', formData);
        alert('Docente creado correctamente');
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
      alert('Error: ' + (error.response?.data?.error || error.message));
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
    
    try {
      await client.delete(`/docentes/${id}`);
      alert('Docente eliminado correctamente');
      fetchDocentes();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDownloadQR = async (id, nombre) => {
    try {
      const response = await client.get(`/qr/${id}/png`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-docente-${nombre || id}.png`;
      a.click();
    } catch (error) {
      alert('Error descargando QR: ' + error.message);
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
    <div className="space-y-6">
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Users className="text-blue-600" size={36} />
          Gestión de Docentes
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Nuevo Docente
        </button>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-md p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search size={16} className="inline mr-1" />
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, apellido o carnet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-1" />
              Jornada
            </label>
            <select
              value={filterJornada}
              onChange={(e) => setFilterJornada(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
            <div className="text-sm text-gray-600">
              <strong>{filteredDocentes.length}</strong> docente(s) encontrado(s)
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabla de Docentes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : filteredDocentes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay docentes registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carnet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombres</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apellidos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jornada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocentes.map((docente) => (
                  <tr key={docente.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {docente.carnet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {docente.nombres}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {docente.apellidos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {docente.jornada || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        docente.estado === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {docente.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {docente.codigos_qr && docente.codigos_qr.length > 0 && (
                          <button
                            onClick={() => handleDownloadQR(docente.codigos_qr[0].id, docente.carnet)}
                            className="text-green-600 hover:text-green-900"
                            title="Descargar QR"
                          >
                            <Download size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(docente)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(docente.id, `${docente.nombres} ${docente.apellidos}`)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
          >
            <h3 className="text-2xl font-bold mb-6">
              {editingDocente ? 'Editar Docente' : 'Nuevo Docente'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carnet *</label>
                <input
                  type="text"
                  required
                  value={formData.carnet}
                  onChange={(e) => setFormData({ ...formData, carnet: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                <input
                  type="text"
                  required
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
                  <select
                    value={formData.jornada}
                    onChange={(e) => setFormData({ ...formData, jornada: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Matutina">Matutina</option>
                    <option value="Vespertina">Vespertina</option>
                    <option value="Nocturna">Nocturna</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDocente(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  {editingDocente ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
