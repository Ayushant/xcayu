import jwt from 'jsonwebtoken';

export const generateToken = (id, role = null, expiresIn = '1d') => {
  const payload = { id };
  if (role) {
    payload.role = role;
  }
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn }
  );
};
