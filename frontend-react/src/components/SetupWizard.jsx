import React, { useState } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { School, User, Lock, Clock, CheckCircle, MapPin, Mail, Phone, LogOut, Upload, Edit2, Server, Wifi, Globe } from 'lucide-react';

export default function SetupWizard({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Mode Selection
  const [loading, setLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(null); // null, 'checking', 'success', 'error'
  const [formData, setFormData] = useState({
    nombre: '',
    horario_inicio: '07:00',
    horario_salida: '13:00',
    margen_puntualidad_min: 5,
    direccion: '',
    pais: 'Guatemala', // Fixed to Guatemala
    departamento: '',
    municipio: '',
    email: '',
    telefono: '',
    logo_path: null,
    logo_base64: '',
    admin_email: '',
    admin_password: '',
    admin_password_confirm: '',
    admin_nombres: '',
    admin_apellidos: '',
    admin_cargo: '',
    admin_jornada: ''
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

  const handleConnect = async (e) => {
    e.preventDefault();
    setConnectionStatus('checking');
    
    // Normalizar URL (quitar slash final)
    const url = serverUrl.replace(/\/$/, '');
    
    try {
      // Intentar conectar al health check
      // Usamos fetch directo para evitar la configuración actual de axios
      const response = await fetch(`${url}/api/health`);
      if (response.ok) {
        setConnectionStatus('success');
        localStorage.setItem('api_url', `${url}/api`);
        toast.success('¡Conectado al servidor correctamente!');
        
        // Recargar la página para que el cliente axios tome la nueva URL
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        throw new Error('El servidor respondió pero con error');
      }
    } catch (error) {
      console.error(error);
      setConnectionStatus('error');
      toast.error('No se pudo conectar al servidor. Verifica la URL y que el servidor esté activo.');
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
      await client.post('/institucion/init', {
        nombre: formData.nombre,
        horario_inicio: formData.horario_inicio,
        horario_salida: formData.horario_salida,
        margen_puntualidad_min: parseInt(formData.margen_puntualidad_min),
        direccion: formData.direccion,
        pais: formData.pais,
        departamento: formData.departamento,
        municipio: formData.municipio,
        email: formData.email,
        telefono: formData.telefono,
        logo_base64: formData.logo_base64,
        admin_email: formData.admin_email,
        admin_password: formData.admin_password,
        admin_nombres: formData.admin_nombres,
        admin_apellidos: formData.admin_apellidos,
        admin_cargo: formData.admin_cargo,
        admin_jornada: formData.admin_jornada
      });

      toast.success('¡Sistema inicializado correctamente!');
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
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 overflow-auto">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white dark:bg-gray-800 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl"></div>
      </div>

      {/* Contenedor del formulario */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row my-4">
          
          {/* Sidebar */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-8 md:w-1/3 flex flex-col justify-between">
            <div>
              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <img src="/logo.png" alt="HikariOpen Logo" className="h-24 object-contain drop-shadow-md" />
                <h1 className="text-2xl font-bold">Bienvenido a HikariOpen</h1>
              </div>
              <p className="text-blue-100 mb-6 text-center text-sm leading-relaxed">
                Completa los parámetros esenciales para activar el sistema de registro en tu institución.
              </p>
              
              <div className="space-y-4">
                {['Modo de Instalación', 'Institución', 'Administrador', 'Confirmar'].map((label, index) => {
                  const stepNum = index + 1;
                  const isActive = step === index;
                  const isCompleted = step > index;
                  
                  return (
                    <div key={index} className={`flex items-center gap-3 transition-all ${
                      isActive ? 'text-white scale-105' : isCompleted ? 'text-green-300' : 'text-blue-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive ? 'border-white bg-blue-700 shadow-lg' : 
                        isCompleted ? 'border-green-300 bg-green-500' : 
                        'border-blue-400'
                      }`}>
                        {isCompleted ? <CheckCircle size={16} /> : stepNum}
                      </div>
                      <span className="font-medium">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-xs text-blue-300 mt-8">
              HikariOpen V1.0.1
            </div>
          </div>

          {/* Formulario */}
          <div className="md:w-2/3">
            <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {step === 0 ? 'Modo de Instalación' : 
               step === 1 ? 'Datos de la Institución' : 
               step === 2 ? 'Cuenta de Administrador' : 'Confirmar Configuración'}
            </h2>

            {/* PASO 0: Selección de Modo */}
            {step === 0 && (
              <div className="space-y-6">
                <div 
                  onClick={() => setStep(1)}
                  className="border-2 border-blue-100 hover:border-blue-500 rounded-xl p-6 cursor-pointer transition-all hover:bg-blue-50 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <School size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Nueva Instalación (Servidor)</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Configura este equipo como el servidor principal. Aquí se guardarán todos los datos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">O</span>
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-700">
                      <Wifi size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Conectar a Existente (Cliente)</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Conecta este equipo a un servidor en la nube (Railway) o local.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleConnect} className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL del Servidor</label>
                      <div className="relative">
                        <Server className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="url"
                          value={serverUrl}
                          onChange={(e) => setServerUrl(e.target.value)}
                          placeholder="https://tu-proyecto.up.railway.app"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Ingresa la URL proporcionada por el administrador (ej. Railway).
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={connectionStatus === 'checking' || connectionStatus === 'success'}
                      className={`w-full font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                        connectionStatus === 'success' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {connectionStatus === 'checking' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Conectando...
                        </>
                      ) : connectionStatus === 'success' ? (
                        <>
                          <CheckCircle size={18} />
                          ¡Conectado!
                        </>
                      ) : (
                        'Conectar'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* PASO 1: Institución */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Institución</label>
                    <div className="relative">
                      <School className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Colegio San José"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: 4ta Calle 10-20 Zona 1"
                      />
                    </div>
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="departamento"
                          value={formData.departamento}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ej: Guatemala"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="municipio"
                          value={formData.municipio}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ej: Guatemala"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Institucional</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="contacto@colegio.edu"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+502 5555 5555"
                        />
                      </div>
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
                          className="w-full pl-10 pr-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salida</label>
                      <div className="relative">
                        <LogOut className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="time"
                          name="horario_salida"
                          value={formData.horario_salida}
                          onChange={handleChange}
                          className="w-full pl-10 pr-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Margen (min)</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="number"
                          name="margen_puntualidad_min"
                          value={formData.margen_puntualidad_min}
                          onChange={handleChange}
                          className="w-full pl-10 pr-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Institucional</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required={!formData.logo_base64}
                      />
                      {logoPreview ? (
                        <div className="relative">
                          <img src={logoPreview} alt="Preview" className="h-24 mx-auto object-contain drop-shadow-md" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg">
                             <p className="text-transparent group-hover:text-white font-medium text-sm">Cambiar Logo</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-gray-500 group-hover:text-blue-600 transition-colors">
                          <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                              <Upload size={24} />
                          </div>
                          <p className="font-medium">Haz clic para subir el logo</p>
                          <p className="text-xs mt-1 text-gray-400">Soporta PNG, JPG</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.nombre || !formData.logo_base64}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Siguiente
                  </button>
                </div>
              )}

              {/* PASO 2: Administrador */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="admin_nombres"
                          value={formData.admin_nombres}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Juan"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="admin_apellidos"
                          value={formData.admin_apellidos}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Pérez"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <select
                          name="admin_cargo"
                          value={formData.admin_cargo}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-gray-800"
                          required
                        >
                          <option value="">Seleccione...</option>
                          <option value="Director">Director(a)</option>
                          <option value="Subdirector">Subdirector(a)</option>
                          <option value="Secretaria">Secretaria(o)</option>
                          <option value="Administrador">Administrador(a)</option>
                          <option value="Coordinador">Coordinador(a)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <select
                          name="admin_jornada"
                          value={formData.admin_jornada}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-gray-800"
                          required
                        >
                          <option value="">Seleccione...</option>
                          <option value="Matutina">Matutina</option>
                          <option value="Vespertina">Vespertina</option>
                          <option value="Doble">Doble</option>
                          <option value="Fin de Semana">Fin de Semana</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email del Administrador</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="admin_email"
                        value={formData.admin_email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-900 dark:text-gray-100 font-bold py-3 rounded-lg transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!formData.admin_email || !formData.admin_password || formData.admin_password !== formData.admin_password_confirm}
                      className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: Vista Previa */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Datos Institucionales */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <School size={20} className="text-blue-600" />
                        Datos Institucionales
                      </h3>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Edit2 size={14} />
                        Editar
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.nombre}</span>
                      </div>
                      {formData.direccion && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Dirección:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formData.direccion}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Ubicación:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Guatemala - {formData.departamento} - {formData.municipio}</span>
                      </div>
                      {formData.email && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Email:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formData.email}</span>
                        </div>
                      )}
                      {formData.telefono && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Teléfono:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formData.telefono}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Horario:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.horario_inicio} - {formData.horario_salida}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Margen:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.margen_puntualidad_min} min</span>
                      </div>
                      {logoPreview && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">Logo:</p>
                          <img src={logoPreview} alt="Logo" className="h-16 object-contain" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Datos del Administrador */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <User size={20} className="text-green-600" />
                        Cuenta de Administrador
                      </h3>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                      >
                        <Edit2 size={14} />
                        Editar
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.admin_nombres} {formData.admin_apellidos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cargo:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.admin_cargo} ({formData.admin_jornada})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.admin_email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Contraseña:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">••••••••</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-900 dark:text-gray-100 font-bold py-3 rounded-lg transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Inicializando...
                        </>
                      ) : (
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
      </div>
    </div>
  );
}

