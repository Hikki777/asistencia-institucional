const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para procesar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Errores de validación',
      detalles: errors.array() 
    });
  }
  next();
};

/**
 * Validaciones para Alumnos
 */
exports.validarCrearAlumno = [
  body('carnet')
    .trim()
    .notEmpty().withMessage('El carnet es requerido')
    .isLength({ min: 3, max: 20 }).withMessage('El carnet debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Z0-9\-]+$/i).withMessage('El carnet solo puede contener letras, números y guiones'),
  
  body('nombres')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñü\s]+$/i).withMessage('El nombre solo puede contener letras'),
  
  body('apellidos')
    .trim()
    .notEmpty().withMessage('Los apellidos son requeridos')
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñü\s]+$/i).withMessage('Los apellidos solo pueden contener letras'),
  
  body('sexo')
    .optional()
    .isIn(['M', 'F']).withMessage('El sexo debe ser M o F'),
  
  body('grado')
    .trim()
    .notEmpty().withMessage('El grado es requerido')
    .isLength({ max: 50 }).withMessage('El grado no puede exceder 50 caracteres'),
  
  body('especialidad')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La especialidad no puede exceder 100 caracteres'),
  
  body('jornada')
    .optional()
    .trim()
    .isIn(['Matutina', 'Vespertina', 'Nocturna']).withMessage('Jornada inválida'),
  
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo']).withMessage('Estado inválido'),
  
  handleValidationErrors
];

exports.validarActualizarAlumno = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('carnet')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('El carnet debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Z0-9\-]+$/i).withMessage('El carnet solo puede contener letras, números y guiones'),
  
  body('nombres')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñü\s]+$/i).withMessage('El nombre solo puede contener letras'),
  
  body('apellidos')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñü\s]+$/i).withMessage('Los apellidos solo pueden contener letras'),
  
  body('sexo')
    .optional()
    .isIn(['M', 'F']).withMessage('El sexo debe ser M o F'),
  
  body('grado')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('El grado no puede exceder 50 caracteres'),
  
  body('especialidad')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La especialidad no puede exceder 100 caracteres'),
  
  body('jornada')
    .optional()
    .trim()
    .isIn(['Matutina', 'Vespertina', 'Nocturna']).withMessage('Jornada inválida'),
  
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo']).withMessage('Estado inválido'),
  
  handleValidationErrors
];

/**
 * Validaciones para Docentes
 */
exports.validarCrearDocente = [
  body('carnet')
    .trim()
    .notEmpty().withMessage('El carnet es requerido')
    .isLength({ min: 3, max: 20 }).withMessage('El carnet debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Z0-9\-]+$/i).withMessage('El carnet solo puede contener letras, números y guiones'),
  
  body('nombres')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñü\s]+$/i).withMessage('El nombre solo puede contener letras'),
  
  body('apellidos')
    .trim()
    .notEmpty().withMessage('Los apellidos son requeridos')
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñü\s]+$/i).withMessage('Los apellidos solo pueden contener letras'),
  
  body('sexo')
    .optional()
    .isIn(['M', 'F']).withMessage('El sexo debe ser M o F'),
  
  body('cargo')
    .optional()
    .trim()
    .isIn(['Director', 'Directora', 'Docente', 'Secretaria', 'Secretario', 'Operativo', 'Auxiliar'])
    .withMessage('Cargo inválido. Debe ser: Director, Directora, Docente, Secretaria, Secretario, Operativo o Auxiliar'),
  
  body('jornada')
    .optional()
    .trim()
    .isIn(['Matutina', 'Vespertina', 'Nocturna']).withMessage('Jornada inválida'),
  
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo']).withMessage('Estado inválido'),
  
  handleValidationErrors
];

exports.validarActualizarDocente = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('carnet')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('El carnet debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Z0-9\-]+$/i).withMessage('El carnet solo puede contener letras, números y guiones'),
  
  body('nombres')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñü\s]+$/i).withMessage('El nombre solo puede contener letras'),
  
  body('apellidos')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñü\s]+$/i).withMessage('Los apellidos solo pueden contener letras'),
  
  body('sexo')
    .optional()
    .isIn(['M', 'F']).withMessage('El sexo debe ser M o F'),
  
  body('cargo')
    .optional()
    .trim()
    .isIn(['Director', 'Directora', 'Docente', 'Secretaria', 'Secretario', 'Operativo', 'Auxiliar'])
    .withMessage('Cargo inválido'),
  
  body('jornada')
    .optional()
    .trim()
    .isIn(['Matutina', 'Vespertina', 'Nocturna']).withMessage('Jornada inválida'),
  
  body('estado')
    .optional()
    .isIn(['activo', 'inactivo']).withMessage('Estado inválido'),
  
  handleValidationErrors
];

/**
 * Validaciones para Autenticación
 */
exports.validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  handleValidationErrors
];

exports.validarRegistroUsuario = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener mayúsculas, minúsculas y números'),
  
  body('rol')
    .optional()
    .isIn(['admin', 'operador']).withMessage('Rol inválido'),
  
  handleValidationErrors
];

/**
 * Validaciones para Asistencias
 */
exports.validarRegistrarAsistencia = [
  body('token')
    .trim()
    .notEmpty().withMessage('El token QR es requerido')
    .isLength({ min: 10 }).withMessage('Token inválido'),
  
  body('tipo_evento')
    .optional()
    .isIn(['entrada', 'salida']).withMessage('Tipo de evento inválido'),
  
  body('dispositivo')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Dispositivo muy largo'),
  
  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Observaciones muy largas'),
  
  handleValidationErrors
];

/**
 * Validaciones para QR
 */
exports.validarGenerarQR = [
  body('persona_tipo')
    .notEmpty().withMessage('El tipo de persona es requerido')
    .isIn(['alumno', 'docente']).withMessage('Tipo de persona inválido'),
  
  body('persona_id')
    .isInt({ min: 1 }).withMessage('ID de persona inválido'),
  
  handleValidationErrors
];

/**
 * Validaciones para Reportes
 */
exports.validarGenerarReporte = [
  query('fechaInicio')
    .optional()
    .isISO8601().withMessage('Fecha inicio inválida'),
  
  query('fechaFin')
    .optional()
    .isISO8601().withMessage('Fecha fin inválida'),
  
  query('personaTipo')
    .optional()
    .isIn(['alumno', 'docente']).withMessage('Tipo de persona inválido'),
  
  query('tipoEvento')
    .optional()
    .isIn(['entrada', 'salida']).withMessage('Tipo de evento inválido'),
  
  query('formato')
    .optional()
    .isIn(['pdf', 'excel']).withMessage('Formato inválido'),
  
  handleValidationErrors
];

/**
 * Validaciones para Institución
 */
exports.validarInicializarInstitucion = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 200 }).withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  
  body('logo_base64')
    .notEmpty().withMessage('El logo es requerido')
    .matches(/^data:image\/(png|jpeg|jpg);base64,/).withMessage('Logo debe ser base64 válido (PNG/JPEG)'),
  
  body('admin_email')
    .trim()
    .notEmpty().withMessage('El email del admin es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('admin_password')
    .notEmpty().withMessage('La contraseña del admin es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  
  body('horario_inicio')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horario inválido (formato HH:mm)'),
  
  body('margen_puntualidad_min')
    .optional()
    .isInt({ min: 0, max: 60 }).withMessage('Margen debe ser entre 0 y 60 minutos'),
  
  handleValidationErrors
];

exports.validarActualizarInstitucion = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  
  body('logo_base64')
    .optional()
    .matches(/^data:image\/(png|jpeg|jpg);base64,/).withMessage('Logo debe ser base64 válido (PNG/JPEG)'),
  
  body('horario_inicio')
    .optional()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horario inválido (formato HH:mm)'),
  
  body('margen_puntualidad_min')
    .optional()
    .isInt({ min: 0, max: 60 }).withMessage('Margen debe ser entre 0 y 60 minutos'),
  
  handleValidationErrors
];

/**
 * Validación genérica de ID en parámetros
 */
exports.validarId = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  handleValidationErrors
];
