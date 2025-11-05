const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configurar multer para subida de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/fotos');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `docente-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png)'));
    }
  }
});

// GET /api/docentes - Listar todos los docentes
router.get('/', async (req, res) => {
  try {
    const docentes = await prisma.personal.findMany({
      orderBy: { apellidos: 'asc' },
      include: {
        codigos_qr: {
          where: { vigente: true },
          select: { id: true, token: true, png_path: true }
        }
      }
    });

    res.json({ docentes });
  } catch (error) {
    console.error('[GET /api/docentes]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/docentes/:id - Obtener un docente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const docente = await prisma.personal.findUnique({
      where: { id: parseInt(id) },
      include: {
        codigos_qr: {
          where: { vigente: true }
        },
        asistencias: {
          take: 10,
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!docente) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    res.json({ docente });
  } catch (error) {
    console.error('[GET /api/docentes/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/docentes - Crear nuevo docente
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { carnet, nombres, apellidos, sexo, grado, jornada } = req.body;

    // Validar campos requeridos
    if (!carnet || !nombres || !apellidos) {
      return res.status(400).json({ error: 'Carnet, nombres y apellidos son obligatorios' });
    }

    // Verificar si ya existe el carnet
    const existente = await prisma.personal.findUnique({
      where: { carnet }
    });

    if (existente) {
      return res.status(400).json({ error: 'Ya existe un docente con ese carnet' });
    }

    const foto_path = req.file ? `uploads/fotos/${req.file.filename}` : null;

    const docente = await prisma.personal.create({
      data: {
        carnet,
        nombres,
        apellidos,
        sexo: sexo || null,
        grado: grado || 'Docente',
        jornada: jornada || null,
        foto_path
      }
    });

    console.log(`✅ Docente creado: ${docente.nombres} ${docente.apellidos}`);
    res.status(201).json({ docente });
  } catch (error) {
    console.error('[POST /api/docentes]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/docentes/:id - Actualizar docente
router.put('/:id', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { carnet, nombres, apellidos, sexo, grado, jornada, estado } = req.body;

    const docente = await prisma.personal.findUnique({
      where: { id: parseInt(id) }
    });

    if (!docente) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    // Si hay nueva foto, eliminar la anterior
    if (req.file && docente.foto_path) {
      const oldPath = path.join(__dirname, '../../', docente.foto_path);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const foto_path = req.file ? `uploads/fotos/${req.file.filename}` : docente.foto_path;

    const docenteActualizado = await prisma.personal.update({
      where: { id: parseInt(id) },
      data: {
        carnet: carnet || docente.carnet,
        nombres: nombres || docente.nombres,
        apellidos: apellidos || docente.apellidos,
        sexo: sexo !== undefined ? sexo : docente.sexo,
        grado: grado || docente.grado,
        jornada: jornada !== undefined ? jornada : docente.jornada,
        estado: estado || docente.estado,
        foto_path
      }
    });

    console.log(`✅ Docente actualizado: ${docenteActualizado.nombres} ${docenteActualizado.apellidos}`);
    res.json({ docente: docenteActualizado });
  } catch (error) {
    console.error('[PUT /api/docentes/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/docentes/:id - Eliminar docente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const docente = await prisma.personal.findUnique({
      where: { id: parseInt(id) }
    });

    if (!docente) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    // Eliminar foto si existe
    if (docente.foto_path) {
      const fotoPath = path.join(__dirname, '../../', docente.foto_path);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }

    await prisma.personal.delete({
      where: { id: parseInt(id) }
    });

    console.log(`✅ Docente eliminado: ${docente.nombres} ${docente.apellidos}`);
    res.json({ message: 'Docente eliminado correctamente' });
  } catch (error) {
    console.error('[DELETE /api/docentes/:id]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
