const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_prod';

function extractToken(req) {
  const auth = req.headers.authorization || '';
  const [type, token] = auth.split(' ');
  if (type === 'Bearer' && token) return token;
  return null;
}

function verifyJWT(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'No autorizado: token ausente' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, rol: payload.rol };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'No autorizado: token inválido o expirado' });
  }
}

function signJWT(user, expiresIn = '8h') {
  return jwt.sign(
    {
      email: user.email,
      rol: user.rol,
    },
    JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn,
    }
  );
}

module.exports = { verifyJWT, signJWT };
