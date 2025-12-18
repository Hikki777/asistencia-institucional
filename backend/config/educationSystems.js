/**
 * Configuración del Sistema Educativo Guatemalteco
 * Define niveles, grados, carreras y reglas de promoción
 */

const sistemaEducativoGuatemala = {
  nombre: 'Sistema Educativo Guatemalteco',
  
  niveles: [
    {
      nombre: 'Primaria',
      grados: [
        '1ro Primaria',
        '2do Primaria',
        '3ro Primaria',
        '4to Primaria',
        '5to Primaria',
        '6to Primaria'
      ],
      gradoGraduacion: '6to Primaria',
      siguienteNivel: 'Básicos'
    },
    {
      nombre: 'Básicos',
      grados: [
        '1ro Básico',
        '2do Básico',
        '3ro Básico'
      ],
      gradoGraduacion: '3ro Básico',
      siguienteNivel: 'Diversificado'
    },
    {
      nombre: 'Diversificado',
      grados: [
        '4to Diversificado',
        '5to Diversificado',
        '6to Diversificado'
      ],
      carreras: [
        {
          nombre: 'Bachillerato en Computación',
          duracion: 2,
          gradoInicio: '4to Diversificado',
          gradoGraduacion: '5to Diversificado'
        },
        {
          nombre: 'Secretariado y Oficinista',
          duracion: 2,
          gradoInicio: '4to Diversificado',
          gradoGraduacion: '5to Diversificado'
        },
        {
          nombre: 'Perito Contador',
          duracion: 3,
          gradoInicio: '4to Diversificado',
          gradoGraduacion: '6to Diversificado'
        },
        {
          nombre: 'Secretariado Bilingüe',
          duracion: 3,
          gradoInicio: '4to Diversificado',
          gradoGraduacion: '6to Diversificado'
        }
      ]
    }
  ],
  
  // Reglas de promoción automática
  reglasPromocion: {
    // Primaria
    '1ro Primaria': '2do Primaria',
    '2do Primaria': '3ro Primaria',
    '3ro Primaria': '4to Primaria',
    '4to Primaria': '5to Primaria',
    '5to Primaria': '6to Primaria',
    '6to Primaria': '1ro Básico', // Cambio de nivel
    
    // Básicos
    '1ro Básico': '2do Básico',
    '2do Básico': '3ro Básico',
    '3ro Básico': '4to Diversificado', // Cambio de nivel
    
    // Diversificado
    '4to Diversificado': '5to Diversificado',
    '5to Diversificado': {
      // Depende de la carrera
      'Bachillerato en Computación': 'GRADUADO',
      'Secretariado y Oficinista': 'GRADUADO',
      'Perito Contador': '6to Diversificado',
      'Secretariado Bilingüe': '6to Diversificado',
      'default': '6to Diversificado' // Si no tiene carrera definida
    },
    '6to Diversificado': 'GRADUADO'
  }
};

/**
 * Obtiene la configuración educativa
 * @returns {object} Configuración del sistema educativo guatemalteco
 */
function getConfiguracion() {
  return sistemaEducativoGuatemala;
}

/**
 * Obtiene todos los grados disponibles
 * @returns {array} Lista de grados
 */
function getGrados() {
  return sistemaEducativoGuatemala.niveles.flatMap(nivel => nivel.grados);
}

/**
 * Obtiene las carreras disponibles para Diversificado
 * @returns {array} Lista de carreras
 */
function getCarreras() {
  const diversificado = sistemaEducativoGuatemala.niveles.find(n => n.nombre === 'Diversificado');
  return diversificado?.carreras || [];
}

/**
 * Obtiene los niveles educativos
 * @returns {array} Lista de niveles
 */
function getNiveles() {
  return sistemaEducativoGuatemala.niveles.map(n => n.nombre);
}

module.exports = {
  sistemaEducativoGuatemala,
  getConfiguracion,
  getGrados,
  getCarreras,
  getNiveles
};
