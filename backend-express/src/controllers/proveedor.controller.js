import prisma from '../config/db.js'; // Ajusta la ruta a donde tengas tu instancia de Prisma

// Obtener todos los proveedores
export const getProveedores = async (req, res) => {
  try {
    const proveedores = await prisma.proveedor.findMany();
    res.json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los proveedores' });
  }
};

// Obtener un proveedor por ID
export const getProveedorById = async (req, res) => {
  const { id } = req.params;
  try {
    const proveedor = await prisma.proveedor.findUnique({
      where: { id: parseInt(id) } // Asegúrate de que el nombre del ID coincida con tu schema (ej. id_proveedor)
    });

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(proveedor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el proveedor' });
  }
};

// Crear un nuevo proveedor
export const createProveedor = async (req, res) => {
  const data = req.body;
  try {
    const nuevoProveedor = await prisma.proveedor.create({
      data: data // Aquí Prisma validará automáticamente contra tu schema
    });
    res.status(201).json(nuevoProveedor);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al crear el proveedor, verifica los datos' });
  }
};

// Actualizar un proveedor
export const updateProveedor = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const proveedorActualizado = await prisma.proveedor.update({
      where: { id: parseInt(id) },
      data: data
    });
    res.json(proveedorActualizado);
  } catch (error) {
    // Código P2025 de Prisma = Registro no encontrado
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Proveedor no encontrado para actualizar' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el proveedor' });
  }
};

// Eliminar un proveedor
export const deleteProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.proveedor.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    // Código P2003 de Prisma = Falla restricción de llave foránea (ej. tiene productos asociados)
    if (error.code === 'P2003') {
      return res.status(409).json({ error: 'No se puede eliminar el proveedor porque tiene registros asociados' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el proveedor' });
  }
};