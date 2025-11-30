import React, { useState } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { School, User, Lock, Clock, CheckCircle } from 'lucide-react';

export default function SetupWizard({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    horario_inicio: '07:00',
    horario_salida: '13:00',
    margen_puntualidad_min: 5,
    direccion: '',
    email: '',
    telefono: '',
    logo_path: null, // File object
    logo_base64: '', // String base64
    admin_email: '',
    admin_password: '',
    admin_password_confirm: ''
  });

  const [logoPreview, setLogoPreview] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({ 
          ...prev, 
          logo_path: file,
          logo_base64: reader.result 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.admin_password !== formData.admin_password_confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      // Enviar al endpoint de inicialización
      await client.post('/institucion/init', {
        nombre: formData.nombre,
        horario_inicio: formData.horario_inicio,
        horario_salida: formData.horario_salida,
        margen_puntualidad_min: parseInt(formData.margen_puntualidad_min),
        direccion: formData.direccion,
        email: formData.email,
        telefono: formData.telefono,
        logo_base64: formData.logo_base64,
        admin_email: formData.admin_email,
        admin_password: formData.admin_password
      });

      toast.success('¡Sistema inicializado correctamente!');
      
      // Login automático o redirigir a login
      if (onComplete) onComplete();
      navigate('/login');
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al inicializar el sistema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Informativo */}
        <div className="bg-blue-900 text-white p-8 md:w-1/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <School size={32} className="text-blue-300" />
              <h1 className="text-2xl font-bold">Bienvenido</h1>
            </div>
            <p className="text-blue-100 mb-6">
              Configuremos tu sistema de registro institucional en unos sencillos pasos.
            </p>
            
            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${step >= 1 ? 'text-white' : 'text-blue-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-white bg-blue-800' : 'border-blue-400'}`}>
                  1
                </div>
                <span>Institución</span>
              </div>
              <div className={`flex items-center gap-3 ${step >= 2 ? 'text-white' : 'text-blue-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-white bg-blue-800' : 'border-blue-400'}`}>
                  2
                </div>
                <span>Administrador</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-300 mt-8">
            Sistema de Registro v1.0
          </div>
        </div>

        {/* Formulario */}
        <div className="p-8 md:w-2/3">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {step === 1 ? 'Datos de la Institución' : 'Cuenta de Administrador'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Institución</label>
                  <div className="relative">
                    <School className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Colegio San José"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entrada</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="time"
                        name="horario_inicio"
                        value={formData.horario_inicio}
                        onChange={handleChange}
                        className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salida</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="time"
                        name="horario_salida"
                        value={formData.horario_salida}
                        onChange={handleChange}
                        className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Margen (min)</label>
                    <input
                      type="number"
                      name="margen_puntualidad_min"
                      value={formData.margen_puntualidad_min}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 4ta Calle 10-20 Zona 1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Institucional</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="contacto@colegio.edu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="2222-3333"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo Institucional</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required={!formData.logo_base64}
                    />
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" className="h-24 mx-auto object-contain" />
                    ) : (
                      <div className="text-gray-500">
                        <p>Haz clic para subir el logo</p>
                        <p className="text-xs mt-1">(PNG, JPG)</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.nombre || !formData.logo_base64}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email del Administrador</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="admin_email"
                      value={formData.admin_email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="admin@colegio.edu"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="password"
                      name="admin_password"
                      value={formData.admin_password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="password"
                      name="admin_password_confirm"
                      value={formData.admin_password_confirm}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition-colors"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? 'Inicializando...' : (
                      <>
                        <CheckCircle size={20} />
                        Finalizar Setup
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
