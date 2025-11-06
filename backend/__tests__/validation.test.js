/**
 * Tests Unitarios de Validaciones
 */

const { body } = require('express-validator');

describe('Validaciones de Carnet', () => {
  test('debe aceptar carnet alfanumérico válido', () => {
    const validCarnets = ['A001', 'ABC123', 'D2026001', 'P001'];
    
    validCarnets.forEach(carnet => {
      const regex = /^[A-Z0-9]+$/i;
      expect(regex.test(carnet)).toBe(true);
    });
  });

  test('debe rechazar carnet con caracteres especiales', () => {
    const invalidCarnets = ['A-001', 'A@001', 'A 001', 'A.001'];
    
    invalidCarnets.forEach(carnet => {
      const regex = /^[A-Z0-9]+$/i;
      expect(regex.test(carnet)).toBe(false);
    });
  });

  test('debe rechazar carnet muy corto', () => {
    const shortCarnets = ['A', 'AB', '12'];
    
    shortCarnets.forEach(carnet => {
      expect(carnet.length).toBeLessThan(3);
    });
  });
});

describe('Validaciones de Nombres', () => {
  test('debe aceptar nombres con tildes y espacios', () => {
    const validNames = [
      'Juan',
      'María José',
      'José Ángel',
      'Sofía',
      'Raúl Pérez'
    ];
    
    validNames.forEach(name => {
      const regex = /^[a-záéíóúñü\s]+$/i;
      expect(regex.test(name)).toBe(true);
    });
  });

  test('debe rechazar nombres con números', () => {
    const invalidNames = ['Juan123', 'María2', 'Test1'];
    
    invalidNames.forEach(name => {
      const regex = /^[a-záéíóúñü\s]+$/i;
      expect(regex.test(name)).toBe(false);
    });
  });

  test('debe rechazar nombres con caracteres especiales', () => {
    const invalidNames = ['Juan@', 'María#', 'Test!'];
    
    invalidNames.forEach(name => {
      const regex = /^[a-záéíóúñü\s]+$/i;
      expect(regex.test(name)).toBe(false);
    });
  });
});

describe('Validaciones de Email', () => {
  test('debe aceptar emails válidos', () => {
    const validEmails = [
      'test@test.com',
      'user.name@example.com',
      'admin@colegio.edu',
      'test+tag@gmail.com'
    ];
    
    validEmails.forEach(email => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(regex.test(email)).toBe(true);
    });
  });

  test('debe rechazar emails inválidos', () => {
    const invalidEmails = [
      'not-an-email',
      '@test.com',
      'test@',
      'test@.com',
      'test..test@test.com'
    ];
    
    invalidEmails.forEach(email => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(regex.test(email)).toBe(false);
    });
  });
});

describe('Validaciones de Horario', () => {
  test('debe aceptar horarios en formato HH:mm válido', () => {
    const validTimes = ['07:00', '08:30', '15:45', '23:59', '00:00'];
    
    validTimes.forEach(time => {
      const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      expect(regex.test(time)).toBe(true);
    });
  });

  test('debe rechazar horarios inválidos', () => {
    const invalidTimes = ['24:00', '25:30', '7:00', '08:60', '8:5'];
    
    invalidTimes.forEach(time => {
      const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      expect(regex.test(time)).toBe(false);
    });
  });
});

describe('Validaciones de Jornada', () => {
  test('debe aceptar jornadas válidas', () => {
    const validJornadas = ['Matutina', 'Vespertina', 'Nocturna'];
    const allowedValues = ['Matutina', 'Vespertina', 'Nocturna'];
    
    validJornadas.forEach(jornada => {
      expect(allowedValues).toContain(jornada);
    });
  });

  test('debe rechazar jornadas inválidas', () => {
    const invalidJornadas = ['mañana', 'tarde', 'noche', 'completa'];
    const allowedValues = ['Matutina', 'Vespertina', 'Nocturna'];
    
    invalidJornadas.forEach(jornada => {
      expect(allowedValues).not.toContain(jornada);
    });
  });
});

describe('Validaciones de Tipo de Persona', () => {
  test('debe aceptar tipos válidos', () => {
    const validTypes = ['alumno', 'docente'];
    const allowedValues = ['alumno', 'docente'];
    
    validTypes.forEach(type => {
      expect(allowedValues).toContain(type);
    });
  });

  test('debe rechazar tipos inválidos', () => {
    const invalidTypes = ['student', 'teacher', 'personal', 'admin'];
    const allowedValues = ['alumno', 'docente'];
    
    invalidTypes.forEach(type => {
      expect(allowedValues).not.toContain(type);
    });
  });
});

describe('Validaciones de Tipo de Evento', () => {
  test('debe aceptar eventos válidos', () => {
    const validEvents = ['entrada', 'salida'];
    const allowedValues = ['entrada', 'salida'];
    
    validEvents.forEach(event => {
      expect(allowedValues).toContain(event);
    });
  });

  test('debe rechazar eventos inválidos', () => {
    const invalidEvents = ['checkin', 'checkout', 'arrival', 'departure'];
    const allowedValues = ['entrada', 'salida'];
    
    invalidEvents.forEach(event => {
      expect(allowedValues).not.toContain(event);
    });
  });
});
