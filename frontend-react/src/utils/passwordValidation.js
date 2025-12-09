// Validación de fortaleza de contraseña
export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Ninguna', color: 'gray' };
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  // Calcular puntuación
  if (checks.length) score += 20;
  if (checks.uppercase) score += 20;
  if (checks.lowercase) score += 20;
  if (checks.number) score += 20;
  if (checks.special) score += 20;

  // Determinar etiqueta y color
  let label, color;
  if (score < 40) {
    label = 'Débil';
    color = 'red';
  } else if (score < 80) {
    label = 'Media';
    color = 'yellow';
  } else {
    label = 'Fuerte';
    color = 'green';
  }

  return { score, label, color, checks };
};

export const getPasswordRequirements = () => [
  { id: 'length', label: 'Mínimo 8 caracteres', check: (pwd) => pwd.length >= 8 },
  { id: 'uppercase', label: 'Una letra mayúscula', check: (pwd) => /[A-Z]/.test(pwd) },
  { id: 'lowercase', label: 'Una letra minúscula', check: (pwd) => /[a-z]/.test(pwd) },
  { id: 'number', label: 'Un número', check: (pwd) => /[0-9]/.test(pwd) },
  { id: 'special', label: 'Un carácter especial (!@#$%...)', check: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
];
