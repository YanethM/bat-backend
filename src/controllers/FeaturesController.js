const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createFeature = async (req, res) => {
  const { name } = req.body;

  try {
    const feature = await prisma.feature.create({
      data: {
        name,
      },
    });

    res.status(201).json({ feature });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No se pudo crear la característica." });
  }
};

const getFeatures = async (req, res) => {
  try {
    const features = await prisma.feature.findMany();
    res.status(200).json({ features });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "No se pudieron obtener las características." });
  }
};

const getFeatureById = async (req, res) => {
  const { id } = req.params;

  try {
    const feature = await prisma.feature.findUnique({
      where: { id },
    });

    if (!feature) {
      return res.status(404).json({ message: "Característica no encontrada." });
    }

    res.status(200).json({ feature });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No se pudo obtener la característica." });
  }
};

const updateFeature = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const feature = await prisma.feature.update({
      where: { id },
      data: {
        name,
      },
    });

    res.status(200).json({ feature });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "No se pudo actualizar la característica." });
  }
};

const deleteFeature = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.feature.delete({
      where: { id },
    });

    res.status(200).json({ message: "Característica eliminada con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No se pudo eliminar la característica." });
  }
};

module.exports = {
  createFeature,
  getFeatures,
  getFeatureById,
  updateFeature,
  deleteFeature,
};
