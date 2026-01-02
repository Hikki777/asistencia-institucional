import { useState, useEffect } from 'react';
import { excusasAPI, alumnosAPI, docentesAPI } from '../api/endpoints';
import { FileText, Plus, Check, X, Eye, Calendar, User, Filter } from 'lucide-react';
import './JustificacionesPanel.css';

const ExcusasPanel = () => {
  const [excusas, setExcusas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    personaTipo: '',
    estado: '',
    fechaInicio: '',
    fechaFin: ''
  });
  
  const [modalCrear, setModalCrear] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalAccion, setModalAccion] = useState(null); // { tipo: 'aprobar'|'rechazar', excusa }
  
  const [alumnos, setAlumnos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  
  const [formData, setFormData] = useState({
    persona_tipo: 'alumno',
    alumno_id: '',
    personal_id: '',
    fecha_ausencia: '',
    motivo: '',
    descripcion: '',
    documento_url: ''
  });

  useEffect(() => {
    cargarExcusas();
    cargarPersonas();
  }, [filtros]);

  const cargarExcusas = async () => {
    try {
      setLoading(true);
      const response = await excusasAPI.list(filtros);
      setExcusas(response.data.excusas || response.data);
    } catch (error) {
      console.error('Error cargando excusas:', error);
      alert('Error al cargar excusas');
    } finally {
      setLoading(false);
    }
  };

  const cargarPersonas = async () => {
    try {
      const [alumnosRes, docentesRes] = await Promise.all([
        alumnosAPI.list(),
        docentesAPI.list()
      ]);
      setAlumnos(alumnosRes.data.alumnos || alumnosRes.data);
      setDocentes(docentesRes.data.docentes || docentesRes.data);
    } catch (error) {
      console.error('Error cargando personas:', error);
    }
  };

  const handleCrearExcusa = async (e) => {
    e.preventDefault();
    
    if (!formData.fecha_ausencia || !formData.motivo) {
      alert('Fecha y motivo son obligatorios');
      return;
    }

    if (formData.persona_tipo === 'alumno' && !formData.alumno_id) {
      alert('Selecciona un alumno');
      return;
    }

    if (formData.persona_tipo === 'personal' && !formData.personal_id) {
      alert('Selecciona un miembro del personal');
      return;
    }

    try {
      await excusasAPI.create(formData);
      alert('Excusa creada exitosamente');
      setModalCrear(false);
      resetForm();
      cargarExcusas();
    } catch (error) {
      console.error('Error creando excusa:', error);
      alert('Error al crear excusa: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAprobar = async (excusa) => {
    if (!window.confirm(`¿Aprobar excusa de ${getNombrePersona(excusa)}?`)) {
      return;
    }

    try {
      await excusasAPI.update(excusa.id, { estado: 'aprobada' });
      alert('Excusa aprobada');
      cargarExcusas();
    } catch (error) {
      console.error('Error aprobando excusa:', error);
      alert('Error al aprobar excusa');
    }
  };

  const handleRechazar = async (excusa, observaciones) => {
    try {
      await excusasAPI.update(excusa.id, { 
        estado: 'rechazada',
        observaciones 
      });
      alert('Excusa rechazada');
      setModalAccion(null);
      cargarExcusas();
    } catch (error) {
      console.error('Error rechazando excusa:', error);
      alert('Error al rechazar excusa');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta excusa?')) {
      return;
    }

    try {
      await excusasAPI.delete(id);
      alert('Excusa eliminada');
      cargarExcusas();
    } catch (error) {
      console.error('Error eliminando excusa:', error);
      alert('Error al eliminar excusa');
    }
  };

  const getNombrePersona = (excusa) => {
    if (excusa.alumno) {
      return `${excusa.alumno.nombres} ${excusa.alumno.apellidos}`;
    } else if (excusa.personal) {
      return `${excusa.personal.nombres} ${excusa.personal.apellidos}`;
    }
    return 'N/A';
  };

  const resetForm = () => {
    setFormData({
      persona_tipo: 'alumno',
      alumno_id: '',
      personal_id: '',
      fecha_ausencia: '',
      motivo: '',
      descripcion: '',
      documento_url: ''
    });
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'aprobada': return 'badge-success';
      case 'rechazada': return 'badge-danger';
      case 'pendiente': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="excusas-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-left">
          <FileText size={32} />
          <div>
            <h2>Gestión de Excusas</h2>
            <p>Administra las justificaciones de ausencias</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setModalCrear(true)}>
          <Plus size={20} />
          Nueva Excusa
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-group">
          <Filter size={18} />
          <select 
            value={filtros.personaTipo}
            onChange={(e) => setFiltros({ ...filtros, personaTipo: e.target.value })}
          >
            <option value="">Todos (Alumnos y Personal)</option>
            <option value="alumno">Solo Alumnos</option>
            <option value="personal">Solo Personal</option>
          </select>
        </div>

        <div className="filtro-group">
          <select 
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>

        <div className="filtro-group">
          <Calendar size={18} />
          <input 
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
            placeholder="Desde"
          />
        </div>

        <div className="filtro-group">
          <input 
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
            placeholder="Hasta"
          />
        </div>

        {(filtros.personaTipo || filtros.estado || filtros.fechaInicio || filtros.fechaFin) && (
          <button 
            className="btn-secondary"
            onClick={() => setFiltros({ personaTipo: '', estado: '', fechaInicio: '', fechaFin: '' })}
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Tabla de Excusas */}
      {loading ? (
        <div className="loading">Cargando excusas...</div>
      ) : excusas.length === 0 ? (
        <div className="empty-state">
          <FileText size={64} />
          <p>No hay excusas registradas</p>
          <button className="btn-primary" onClick={() => setModalCrear(true)}>
            Crear Primera Excusa
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="excusas-table">
            <thead>
              <tr>
                <th>Fecha Ausencia</th>
                <th>Persona</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {excusas.map((excusa) => (
                <tr key={excusa.id}>
                  <td>{formatFecha(excusa.fecha_ausencia)}</td>
                  <td>
                    <div className="persona-info">
                      <User size={16} />
                      {getNombrePersona(excusa)}
                    </div>
                  </td>
                  <td>
                    <span className={`tipo-badge ${excusa.persona_tipo}`}>
                      {excusa.persona_tipo}
                    </span>
                  </td>
                  <td className="motivo-cell">{excusa.motivo}</td>
                  <td>
                    <span className={`badge ${getEstadoBadgeClass(excusa.estado)}`}>
                      {excusa.estado}
                    </span>
                  </td>
                  <td>
                    <div className="acciones">
                      <button 
                        className="btn-icon"
                        onClick={() => setModalDetalle(excusa)}
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {excusa.estado === 'pendiente' && (
                        <>
                          <button 
                            className="btn-icon btn-success"
                            onClick={() => handleAprobar(excusa)}
                            title="Aprobar"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            className="btn-icon btn-danger"
                            onClick={() => setModalAccion({ tipo: 'rechazar', excusa })}
                            title="Rechazar"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => handleEliminar(excusa.id)}
                        title="Eliminar"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear Excusa */}
      {modalCrear && (
        <div className="modal-overlay" onClick={() => setModalCrear(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Excusa</h3>
              <button onClick={() => setModalCrear(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleCrearExcusa}>
              <div className="form-group">
                <label>Tipo de Persona *</label>
                <select 
                  value={formData.persona_tipo}
                  onChange={(e) => setFormData({ ...formData, persona_tipo: e.target.value, alumno_id: '', personal_id: '' })}
                  required
                >
                  <option value="alumno">Alumno</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              {formData.persona_tipo === 'alumno' ? (
                <div className="form-group">
                  <label>Alumno *</label>
                  <select 
                    value={formData.alumno_id}
                    onChange={(e) => setFormData({ ...formData, alumno_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar alumno...</option>
                    {alumnos.map(alumno => (
                      <option key={alumno.id} value={alumno.id}>
                        {alumno.nombres} {alumno.apellidos} - {alumno.carnet}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label>Personal *</label>
                  <select 
                    value={formData.personal_id}
                    onChange={(e) => setFormData({ ...formData, personal_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar personal...</option>
                    {docentes.map(docente => (
                      <option key={docente.id} value={docente.id}>
                        {docente.nombres} {docente.apellidos} - {docente.cargo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Fecha de Ausencia *</label>
                <input 
                  type="date"
                  value={formData.fecha_ausencia}
                  onChange={(e) => setFormData({ ...formData, fecha_ausencia: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Motivo *</label>
                <select 
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  required
                >
                  <option value="">Seleccionar motivo...</option>
                  <option value="Enfermedad">Enfermedad</option>
                  <option value="Cita médica">Cita médica</option>
                  <option value="Asunto familiar">Asunto familiar</option>
                  <option value="Emergencia">Emergencia</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles adicionales..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>URL del Documento (opcional)</label>
                <input 
                  type="url"
                  value={formData.documento_url}
                  onChange={(e) => setFormData({ ...formData, documento_url: e.target.value })}
                  placeholder="https://..."
                />
                <small>Certificado médico, constancia, etc.</small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalCrear(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Excusa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {modalDetalle && (
        <div className="modal-overlay" onClick={() => setModalDetalle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles de la Excusa</h3>
              <button onClick={() => setModalDetalle(null)}>&times;</button>
            </div>
            
            <div className="detalle-content">
              <div className="detalle-row">
                <strong>Persona:</strong>
                <span>{getNombrePersona(modalDetalle)}</span>
              </div>
              <div className="detalle-row">
                <strong>Tipo:</strong>
                <span className={`tipo-badge ${modalDetalle.persona_tipo}`}>
                  {modalDetalle.persona_tipo}
                </span>
              </div>
              <div className="detalle-row">
                <strong>Fecha de Ausencia:</strong>
                <span>{formatFecha(modalDetalle.fecha_ausencia)}</span>
              </div>
              <div className="detalle-row">
                <strong>Motivo:</strong>
                <span>{modalDetalle.motivo}</span>
              </div>
              <div className="detalle-row">
                <strong>Estado:</strong>
                <span className={`badge ${getEstadoBadgeClass(modalDetalle.estado)}`}>
                  {modalDetalle.estado}
                </span>
              </div>
              {modalDetalle.descripcion && (
                <div className="detalle-row">
                  <strong>Descripción:</strong>
                  <p>{modalDetalle.descripcion}</p>
                </div>
              )}
              {modalDetalle.documento_url && (
                <div className="detalle-row">
                  <strong>Documento:</strong>
                  <a href={modalDetalle.documento_url} target="_blank" rel="noopener noreferrer">
                    Ver documento
                  </a>
                </div>
              )}
              {modalDetalle.observaciones && (
                <div className="detalle-row">
                  <strong>Observaciones:</strong>
                  <p>{modalDetalle.observaciones}</p>
                </div>
              )}
              <div className="detalle-row">
                <strong>Creada:</strong>
                <span>{formatFecha(modalDetalle.creado_en)}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModalDetalle(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazar */}
      {modalAccion && modalAccion.tipo === 'rechazar' && (
        <div className="modal-overlay" onClick={() => setModalAccion(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rechazar Excusa</h3>
              <button onClick={() => setModalAccion(null)}>&times;</button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const observaciones = e.target.observaciones.value;
              handleRechazar(modalAccion.excusa, observaciones);
            }}>
              <div className="form-group">
                <label>Motivo del Rechazo</label>
                <textarea 
                  name="observaciones"
                  placeholder="Explica por qué se rechaza esta excusa..."
                  rows="4"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalAccion(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-danger">
                  Rechazar Excusa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcusasPanel;
