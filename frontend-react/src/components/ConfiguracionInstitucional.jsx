import React, { useState, useEffect } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';

export default function ConfiguracionInstitucional() {
  const [institucion, setInstitucion] = useState({
    nombre: '',
    horario_inicio: '',
    horario_salida: '',
    margen_puntualidad_min: '',
    logo_path: '',
  });
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchInstitucion();
  }, []);

  const fetchInstitucion = async () => {
    setLoading(true);
    try {
      const res = await client.get('/institucion');
      setInstitucion(res.data);
      setLogoPreview(res.data.logo_path ? `http://localhost:5000/uploads/${res.data.logo_path}` : '');
    } catch (err) {
      toast.error('Error al cargar datos institucionales');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInstitucion((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      setInstitucion((prev) => ({ ...prev, logo_path: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(institucion).forEach(([key, value]) => {
        formData.append(key, value);
      });
      await client.put('/institucion', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Configuración actualizada');
      fetchInstitucion();
    } catch (err) {
      toast.error('Error al actualizar configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Configuración Institucional</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={institucion.nombre}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Horario de inicio</label>
            <input
              type="time"
              name="horario_inicio"
              value={institucion.horario_inicio}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Horario de salida</label>
            <input
              type="time"
              name="horario_salida"
              value={institucion.horario_salida}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Margen puntualidad (minutos)</label>
          <input
            type="number"
            name="margen_puntualidad_min"
            value={institucion.margen_puntualidad_min}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            min={0}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Logo institucional</label>
          <input type="file" accept="image/*" onChange={handleLogoChange} />
          {logoPreview && (
            <img src={logoPreview} alt="Logo" className="mt-4 w-24 h-24 object-contain bg-gray-100 rounded-lg" />
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
