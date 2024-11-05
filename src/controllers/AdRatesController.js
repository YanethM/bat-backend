const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// Crear una nueva tarifa de anuncio (AdRates)
const createAdRate = async (req, res) => {
  const { stateId, cityId, adTypeId, rate, status } = req.body;

  try {
    const adRate = await prisma.adRates.create({
      data: {
        stateId,
        cityId,
        adTypeId,
        rate,
        status,
      },
    });

    res.status(201).json({ adRate });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "No se pudo crear la tarifa del anuncio." });
  }
};

// Obtener todas las tarifas de anuncios (AdRates)
const getAdRates = async (req, res) => {
  try {
    const adRates = await prisma.adRates.findMany({
      include: {
        state: true, // Incluir información del estado
        city: true, // Incluir información de la ciudad
        adType: true, // Incluir información del tipo de anuncio
      },
    });
    res.status(200).json({ adRates });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "No se pudieron obtener las tarifas de los anuncios." });
  }
};

// Obtener una tarifa de anuncio por ID
const getAdRateById = async (req, res) => {
  const { id } = req.params;

  try {
    const adRate = await prisma.adRates.findUnique({
      where: { id },
      include: {
        state: true, // Incluir información del estado
        city: true, // Incluir información de la ciudad
        adType: true, // Incluir información del tipo de anuncio
      },
    });

    if (!adRate) {
      return res
        .status(404)
        .json({ message: "Tarifa del anuncio no encontrada." });
    }

    res.status(200).json({ adRate });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "No se pudo obtener la tarifa del anuncio." });
  }
};

// Actualizar una tarifa de anuncio por ID
const updateAdRate = async (req, res) => {
  const { id } = req.params;
  const { stateId, cityId, adTypeId, rate, status } = req.body;

  try {
    const adRate = await prisma.adRates.update({
      where: { id },
      data: {
        stateId,
        cityId,
        adTypeId,
        rate,
        status,
      },
    });

    res.status(200).json({ adRate });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "No se pudo actualizar la tarifa del anuncio." });
  }
};

// Eliminar una tarifa de anuncio por ID
const deleteAdRate = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.adRates.delete({
      where: { id },
    });

    res.status(200).json({ message: "Tarifa del anuncio eliminada." });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "No se pudo eliminar la tarifa del anuncio." });
  }
};

module.exports = {
  createAdRate,
  getAdRates,
  getAdRateById,
  updateAdRate,
  deleteAdRate,
};
