const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createCategory = async (req, res) => {
  const { name } = req.body;

  // Verificar que el nombre de la categoría no esté vacío o indefinido
  if (!name) {
    return res
      .status(400)
      .json({ message: "El nombre de la categoría es requerido." });
  }

  try {
    // Buscar si ya existe una categoría con el mismo nombre
    const existingCategory = await prisma.category.findUnique({
      where: {
        name: name,
      },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "La categoría ya está en uso." });
    }

    // Crear la nueva categoría si el nombre es único
    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    res.status(201).json({ category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "No se pudo crear la categoría." });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json({ categories });
  } catch (error) {
    res.status(400).json({ message: "No se pudieron obtener las categorías." });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });
    res.status(200).json({ category });
  } catch (error) {
    res.status(400).json({ message: "No se pudo obtener la categoría." });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Verificar que el nombre de la categoría no esté vacío o indefinido
  if (!name) {
    return res
      .status(400)
      .json({ message: "El nombre de la categoría es requerido." });
  }

  try {
    // Buscar si ya existe una categoría con el mismo nombre
    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }

    // Actualizar la categoría si existe
    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    res.status(200).json({ category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "No se pudo actualizar la categoría." });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ message: "Categoría eliminada exitosamente." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "No se pudo eliminar la categoría." });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
