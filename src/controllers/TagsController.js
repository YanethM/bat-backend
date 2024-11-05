const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createTag = async (req, res) => {
    const { name } = req.body;
  
    // Verificar que el nombre del tag no esté vacío o indefinido
    if (!name) {
      return res.status(400).json({ message: "El nombre del tag es requerido." });
    }
  
    try {
      // Buscar si ya existe un tag con el mismo nombre
      const existingTag = await prisma.tags.findUnique({
        where: {
          name: name,
        },
      });
  
      if (existingTag) {
        return res.status(400).json({ message: "El tag ya está en uso." });
      }
  
      // Crear el nuevo tag si el nombre es único
      const tag = await prisma.tags.create({
        data: {
          name,
        },
      });
  
      res.status(201).json({ tag });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "No se pudo crear el tag." });
    }
  };

const getTags = async (req, res) => {
  try {
    const tags = await prisma.tags.findMany();
    res.status(200).json({ tags });
  } catch (error) {
    res.status(400).json({ message: "No se pudieron obtener los tags." });
  }
};

const getTagById = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await prisma.tags.findUnique({
      where: {
        id,
      },
    });
    res.status(200).json({ tag });
  } catch (error) {
    res.status(400).json({ message: "No se pudo obtener el tag." });
  }
};

const updateTag = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const tag = await prisma.tags.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    res.status(200).json({ tag });
  } catch (error) {
    res.status(400).json({ message: "No se pudo actualizar el tag." });
  }
};

const deleteTag = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.tags.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ message: "Tag eliminado correctamente." });
  } catch (error) {
    res.status(400).json({ message: "No se pudo eliminar el tag." });
  }
};

module.exports = {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
};
