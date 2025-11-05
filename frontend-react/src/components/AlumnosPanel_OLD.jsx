/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, Edit, Trash2, Download, Search, Filter, X, User, QrCode, Calendar, MapPin } from 'lucide-react';
import { alumnosAPI, qrAPI } from '../api/endpoints';

export default function AlumnosPanel() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrado, setFilterGrado] = useState('');
  const [filterJornada, setFilterJornada] = useState('');
  const [formData, setFormData] = useState({
    carnet: '',
    nombres: '',
    apellidos: '',
    grado: '',
    jornada: '',
  });

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    setLoading(true);
    try {
      const response = await alumnosAPI.list();
      // Backend devuelve { total, count, alumnos }
      setAlumnos(response.data.alumnos || []);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await alumnosAPI.update(editingId, formData);
      } else {
        await alumnosAPI.create(formData);
      }
      setFormData({ carnet: '', nombres: '', apellidos: '', grado: '', jornada: '' });
      setShowForm(false);
      setEditingId(null);
      fetchAlumnos();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar alumno?')) {
      try {
        await alumnosAPI.delete(id);
        fetchAlumnos();
      } catch (error) {
        alert('Error: ' + error.response?.data?.message);
      }
    }
  };

  const handleEdit = (alumno) => {
    setFormData(alumno);
    setEditingId(alumno.id);
    setShowForm(true);
  };

  const handleDownloadQR = async (id, nombre) => {
    try {
      const blob = await qrAPI.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${nombre || id}.png`;
      a.click();
    } catch (error) {
      alert('Error descargando QR: ' + error.message);
    }
  };

  // Filtrar alumnos
  const filteredAlumnos = alumnos.filter((alumno) => {
    const matchSearch = 
      alumno.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.carnet.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchGrado = filterGrado === '' || alumno.grado === filterGrado;
    const matchJornada = filterJornada === '' || alumno.jornada === filterJornada;
    
    return matchSearch && matchGrado && matchJornada;
  });

  // Obtener valores únicos para filtros
  const gradosUnicos = [...new Set(alumnos.map(a => a.grado))].sort();
  const jornadasUnicas = [...new Set(alumnos.map(a => a.jornada))].filter(Boolean).sort();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">👥 Gestión de Alumnos ({filteredAlumnos.length})</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ carnet: '', nombres: '', apellidos: '', grado: '', jornada: '' });
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Alumno
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
          className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Carnet"
              value={formData.carnet}
              onChange={(e) => setFormData({ ...formData, carnet: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Nombres"
              value={formData.nombres}
              onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Apellidos"
              value={formData.apellidos}
              onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Grado"
              value={formData.grado}
              onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
            <select
              value={formData.jornada}
              onChange={(e) => setFormData({ ...formData, jornada: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Seleccionar jornada</option>
              <option value="Matutina">Matutina</option>
              <option value="Vespertina">Vespertina</option>
              <option value="Nocturna">Nocturna</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </motion.form>
      )}

      {/* Filtros de Búsqueda */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o carnet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <select
            value={filterGrado}
            onChange={(e) => setFilterGrado(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Todos los grados</option>
            {gradosUnicos.map(grado => (
              <option key={grado} value={grado}>{grado}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterJornada}
            onChange={(e) => setFilterJornada(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Todas las jornadas</option>
            {jornadasUnicas.map(jornada => (
              <option key={jornada} value={jornada}>{jornada}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : filteredAlumnos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No se encontraron alumnos con los filtros aplicados
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-4 py-2">Carnet</th>
                <th className="text-left px-4 py-2">Nombres</th>
                <th className="text-left px-4 py-2">Apellidos</th>
                <th className="text-left px-4 py-2">Grado</th>
                <th className="text-left px-4 py-2">Jornada</th>
                <th className="text-center px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlumnos.map((alumno) => (
                <motion.tr
                  key={alumno.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{alumno.carnet}</td>
                  <td className="px-4 py-2">{alumno.nombres}</td>
                  <td className="px-4 py-2">{alumno.apellidos}</td>
                  <td className="px-4 py-2">{alumno.grado}</td>
                  <td className="px-4 py-2">{alumno.jornada}</td>
                  <td className="px-4 py-2 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleDownloadQR(alumno.id, alumno.carnet)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Descargar QR"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(alumno)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(alumno.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
