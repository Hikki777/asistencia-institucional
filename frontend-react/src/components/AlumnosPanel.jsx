/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, Edit, Trash2, Download, Search, Filter, X, User, QrCode, BookOpen, Sun } from 'lucide-react';
import { alumnosAPI, qrAPI } from '../api/endpoints';

export default function AlumnosPanel() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrado, setFilterGrado] = useState('');
  const [filterJornada, setFilterJornada] = useState('');
  const [formData, setFormData] = useState({
    carnet: '',
    nombres: '',
    apellidos: '',
    grado: '',
    jornada: '',
    sexo: ''
  });

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    setLoading(true);
    try {
      const response = await alumnosAPI.list();
      setAlumnos(response.data.alumnos || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAlumno) {
        await alumnosAPI.update(editingAlumno.id, formData);
      } else {
        await alumnosAPI.create(formData);
      }
      setShowModal(false);
      setEditingAlumno(null);
      setFormData({ carnet: '', nombres: '', apellidos: '', grado: '', jornada: '', sexo: '' });
      fetchAlumnos();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (alumno) => {
    setEditingAlumno(alumno);
    setFormData({
      carnet: alumno.carnet,
      nombres: alumno.nombres,
      apellidos: alumno.apellidos,
      grado: alumno.grado,
      jornada: alumno.jornada || '',
      sexo: alumno.sexo || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return;
    try {
      await alumnosAPI.delete(id);
      fetchAlumnos();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDownloadQR = async (id, carnet) => {
    try {
      const blob = await qrAPI.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${carnet}.png`;
      a.click();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // Filtros
  const filteredAlumnos = alumnos.filter(a => {
    const matchSearch = 
      a.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.carnet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrado = !filterGrado || a.grado === filterGrado;
    const matchJornada = !filterJornada || a.jornada === filterJornada;
    return matchSearch && matchGrado && matchJornada;
  });

  const gradosUnicos = [...new Set(alumnos.map(a => a.grado))].sort();
  const jornadasUnicas = [...new Set(alumnos.map(a => a.jornada).filter(Boolean))];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <GraduationCap className="text-blue-600" size={32} />
          Alumnos
        </h2>
        <button
          onClick={() => {
            setEditingAlumno(null);
            setFormData({ carnet: '', nombres: '', apellidos: '', grado: '', jornada: '', sexo: '' });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Nuevo Alumno</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-md p-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen size={16} />
              Grado
            </label>
            <select
              value={filterGrado}
              onChange={(e) => setFilterGrado(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {gradosUnicos.map((grado) => (
                <option key={grado} value={grado}>{grado}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Sun size={16} />
              Jornada
            </label>
            <select
              value={filterJornada}
              onChange={(e) => setFilterJornada(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {jornadasUnicas.map((jornada) => (
                <option key={jornada} value={jornada}>{jornada}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600 font-medium">
              {filteredAlumnos.length} de {alumnos.length} alumno(s)
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table/Cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center text-gray-500">Cargando...</div>
        ) : filteredAlumnos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <User size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No hay alumnos registrados</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Carnet</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nombre Completo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Grado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Jornada</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Estado</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAlumnos.map((alumno, index) => (
                    <motion.tr
                      key={alumno.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-blue-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          {alumno.carnet}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {alumno.nombres} {alumno.apellidos}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {alumno.grado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {alumno.jornada || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          alumno.estado === 'activo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {alumno.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {alumno.codigos_qr?.[0] && (
                            <button
                              onClick={() => handleDownloadQR(alumno.codigos_qr[0].id, alumno.carnet)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Descargar QR"
                            >
                              <Download size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(alumno)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(alumno.id, `${alumno.nombres} ${alumno.apellidos}`)}
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
              {filteredAlumnos.map((alumno, index) => (
                <motion.div
                  key={alumno.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-900">{alumno.nombres} {alumno.apellidos}</div>
                      <div className="text-sm text-blue-600 font-mono font-semibold">{alumno.carnet}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      alumno.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {alumno.estado}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {alumno.grado}
                    </span>
                    {alumno.jornada && (
                      <span className="flex items-center gap-1">
                        <Sun size={14} />
                        {alumno.jornada}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {alumno.codigos_qr?.[0] && (
                      <button
                        onClick={() => handleDownloadQR(alumno.codigos_qr[0].id, alumno.carnet)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <Download size={16} />
                        QR
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(alumno)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(alumno.id, `${alumno.nombres} ${alumno.apellidos}`)}
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
                  {editingAlumno ? 'Editar Alumno' : 'Nuevo Alumno'}
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="A001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
                    <input
                      type="text"
                      required
                      value={formData.grado}
                      onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1ro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                    <select
                      value={formData.sexo}
                      onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition"
                  >
                    {editingAlumno ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
