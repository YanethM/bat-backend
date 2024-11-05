const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createAdType = async (req, res) => {
  const {
    name,
    description,
    limit,
    desktop_width,
    desktop_height,
    mobile_width,
    mobile_height,
    desktop_file_size,
    mobile_file_size,
    status,
  } = req.body;
  const image = req.file;

  try {
    // Validar si el nombre ya existe
    const existingAdType = await prisma.adType.findUnique({
      where: { name },
    });

    if (existingAdType) {
      return res
        .status(400)
        .json({ message: "El nombre del tipo de anuncio ya está en uso." });
    }

    // Crear el nuevo tipo de anuncio
    const adType = await prisma.adType.create({
      data: {
        name,
        description,
        image: image ? image.path : null,
        limit: parseInt(limit),
        desktop_width: parseInt(desktop_width),
        desktop_height: parseInt(desktop_height),
        mobile_width: parseInt(mobile_width),
        mobile_height: parseInt(mobile_height),
        desktop_file_size: parseInt(desktop_file_size),
        mobile_file_size: parseInt(mobile_file_size),
        status,
      },
    });

    res.status(201).json({ adType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No se pudo crear el tipo de anuncio." });
  }
};

// Obtener todos los tipos de anuncios (AdType)
const getAdTypes = async (req, res) => {
  try {
    const adTypes = await prisma.adType.findMany();
    res.status(200).json({ adTypes });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "No se pudieron obtener los tipos de anuncios." });
  }
};

// Obtener un tipo de anuncio por ID
const getAdTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const adType = await prisma.adType.findUnique({
      where: { id },
    });

    if (!adType) {
      return res
        .status(404)
        .json({ message: "Tipo de anuncio no encontrado." });
    }

    res.status(200).json({ adType });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "No se pudo obtener el tipo de anuncio." });
  }
};

// Actualizar un tipo de anuncio por ID
const updateAdType = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    limit,
    desktop_width,
    desktop_height,
    mobile_width,
    mobile_height,
    desktop_file_size,
    mobile_file_size,
    status,
  } = req.body;
  const image = req.file;

  try {
    // Obtener el adType existente para mantener los valores originales
    const existingAdType = await prisma.adType.findUnique({
      where: { id },
    });

    if (!existingAdType) {
      return res
        .status(404)
        .json({ message: "Tipo de anuncio no encontrado." });
    }

    // Actualizar solo los campos que tienen nuevos valores, y mantener los valores existentes si no se pasan
    const adType = await prisma.adType.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingAdType.name,
        description:
          description !== undefined ? description : existingAdType.description,
        image: image ? image.path : existingAdType.image,
        limit: limit !== undefined ? parseInt(limit) : existingAdType.limit,
        desktop_width:
          desktop_width !== undefined
            ? parseInt(desktop_width)
            : existingAdType.desktop_width,
        desktop_height:
          desktop_height !== undefined
            ? parseInt(desktop_height)
            : existingAdType.desktop_height,
        mobile_width:
          mobile_width !== undefined
            ? parseInt(mobile_width)
            : existingAdType.mobile_width,
        mobile_height:
          mobile_height !== undefined
            ? parseInt(mobile_height)
            : existingAdType.mobile_height,
        desktop_file_size:
          desktop_file_size !== undefined
            ? parseInt(desktop_file_size)
            : existingAdType.desktop_file_size,
        mobile_file_size:
          mobile_file_size !== undefined
            ? parseInt(mobile_file_size)
            : existingAdType.mobile_file_size,
        status: status !== undefined ? status : existingAdType.status,
      },
    });

    res.status(200).json({ adType });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "No se pudo actualizar el tipo de anuncio." });
  }
};

// Eliminar un tipo de anuncio por ID
const deleteAdType = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.adType.delete({
      where: { id },
    });

    res.status(200).json({ message: "Tipo de anuncio eliminado." });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "No se pudo eliminar el tipo de anuncio." });
  }
};

module.exports = {
  createAdType,
  getAdTypes,
  getAdTypeById,
  updateAdType,
  deleteAdType,
};
