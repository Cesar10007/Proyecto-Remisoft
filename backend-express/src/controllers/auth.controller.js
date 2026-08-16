import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

function normalizeLaravelBcryptHash(hash) {
  if (!hash) return hash;

  // Los hashes bcrypt de Laravel pueden usar el prefijo $2y$.
  // bcryptjs acepta $2a$ y $2b$, por eso se normaliza al verificar.
  if (hash.startsWith('$2y$')) {
    return `$2a$${hash.slice(4)}`;
  }

  return hash;
}

function publicUser(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    id_rol: usuario.id_rol,
    identificacion: usuario.identificacion,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: usuario.telefono,
    activo: usuario.activo,
    fecha_registro: usuario.fecha_registro,
    rol: usuario.rol,
  };
}

function signJwt(usuario) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado');
  }

  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      id_rol: usuario.id_rol,
      rol: usuario.rol?.nombre ?? null,
      email: usuario.email,
    },
    process.env.JWT_SECRET,
    {
      subject: String(usuario.id_usuario),
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    },
  );
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, contrasena } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(422).json({
        errors: { email: ['El campo email es requerido.'] },
      });
    }

    if (!contrasena || typeof contrasena !== 'string') {
      return res.status(422).json({
        errors: { contrasena: ['El campo contraseña es requerido.'] },
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      include: { rol: true },
    });

    if (!usuario || !usuario.contrasena_hash) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    if (usuario.activo === false) {
      return res.status(403).json({ message: 'Usuario inactivo.' });
    }

    const hash = normalizeLaravelBcryptHash(usuario.contrasena_hash);
    const passwordOk = await bcrypt.compare(contrasena, hash);

    if (!passwordOk) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = signJwt(usuario);

    return res.json({
      token,
      token_type: 'Bearer',
      auth_provider: 'jwt',
      rol: usuario.rol?.nombre ?? null,
      user: publicUser(usuario),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/register
// El registro público nunca acepta id_rol del cliente.
// Todos los usuarios creados aquí reciben exclusivamente el rol CLIENTE.
export async function register(req, res, next) {
  try {
    const {
      identificacion,
      nombre,
      apellido,
      email,
      telefono,
      contrasena,
      contrasena_confirmation,
    } = req.body;

    const errors = {};

    if (!identificacion || !/^\d{6,10}$/.test(String(identificacion))) {
      errors.identificacion = [
        'La identificación debe contener entre 6 y 10 dígitos numéricos.',
      ];
    }

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
      errors.nombre = ['El nombre debe tener al menos 3 caracteres.'];
    }

    if (!apellido || typeof apellido !== 'string' || apellido.trim().length < 3) {
      errors.apellido = ['El apellido debe tener al menos 3 caracteres.'];
    }

    if (
      !email ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email = ['El correo electrónico no es válido.'];
    }

    if (!telefono || !/^\d{10}$/.test(String(telefono))) {
      errors.telefono = ['El teléfono debe tener exactamente 10 dígitos.'];
    }

    if (
      !contrasena ||
      typeof contrasena !== 'string' ||
      contrasena.length < 8 ||
      !/[A-Z]/.test(contrasena) ||
      !/\d/.test(contrasena) ||
      !/[!@#$%^&*(),.?":{}|<>_+\-]/.test(contrasena)
    ) {
      errors.contrasena = [
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.',
      ];
    }

    if (contrasena !== contrasena_confirmation) {
      errors.contrasena_confirmation = ['Las contraseñas no coinciden.'];
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ errors });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      select: { id_usuario: true },
    });

    if (usuarioExistente) {
      return res.status(409).json({
        errors: {
          email: ['Ya existe un usuario registrado con ese correo.'],
        },
      });
    }

    const rolCliente = await prisma.rol.findUnique({
      where: { nombre: 'CLIENTE' },
      select: { id_rol: true },
    });

    if (!rolCliente) {
      throw new Error('El rol CLIENTE no está configurado en la base de datos.');
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 12);

    const usuario = await prisma.usuario.create({
      data: {
        id_rol: rolCliente.id_rol,
        identificacion: String(identificacion).trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: emailNormalizado,
        telefono: String(telefono).trim(),
        contrasena_hash,
        activo: true,
      },
      include: { rol: true },
    });

    const token = signJwt(usuario);

    return res.status(201).json({
      token,
      token_type: 'Bearer',
      auth_provider: 'jwt',
      rol: usuario.rol?.nombre ?? null,
      user: publicUser(usuario),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function me(req, res) {
  return res.json({
    user: req.user,
  });
}

// POST /api/auth/logout
// JWT no guarda sesión de servidor; el cliente debe eliminar token y datos locales.
export async function logout(_req, res) {
  return res.json({
    message: 'Sesión cerrada. Elimina el token JWT del cliente.',
  });
}