const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crear un nuevo Ad
const createAd = async (req, res) => {
  const {
    name,
    adTypesId,
    linkUrl,
    buttonName,
    font,
    text1,
    text1Color,
    text2,
    text2Color,
    payStatus,
    status,
    totalCost,
    userId,
    categoryId,
    urlVideo,
    selectedDays,
    startDate,
    endDate,
    selectedDates,
    url,
    clicks,
    views,
    stateId,
        cityId,
  } = req.body;

  const {
    desktopFile,
    mobileFile,
    desktopVideoFile,
    mobileVideoFile,
    desktopVideoPreview,
    mobileVideoPreview,
    bgImage,
  } = req.files;

  // Validar que los campos requeridos están presentes
  if (!name || !adTypesId || !userId || !categoryId || !urlVideo) {
    return res.status(400).json({
      message: "Todos los campos obligatorios deben ser proporcionados.",
    });
  }

  // Validar que no se seleccionen métodos de fechas conflictivos
  if ((startDate && endDate) && selectedDates) {
    return res.status(400).json({
      message: "No se puede seleccionar un rango de fechas y días no contiguos al mismo tiempo.",
    });
  }

  try {
    // Crear el nuevo Ad
    const newAd = await prisma.ad.create({
      data: {
        name,
        adType: { connect: { id: adTypesId } }, // Conectar relación usando adType en lugar de adTypesId
        linkUrl,
        buttonName,
        desktopFile: desktopFile ? desktopFile[0].filename : null,
        mobileFile: mobileFile ? mobileFile[0].filename : null,
        font,
        text1,
        text1Color,
        text2,
        text2Color,
        bgImage: bgImage ? bgImage[0].filename : null,
        payStatus,
        status,
        totalCost: totalCost ? parseFloat(totalCost) : null,
        user: { connect: { id: userId } },
        category: { connect: { id: categoryId } },
        state: { connect: { id: stateId } },
        city: { connect: { id: cityId } },
        urlVideo,
        desktopVideoFile: desktopVideoFile ? desktopVideoFile[0].filename : null,
        desktopVideoPreview: desktopVideoPreview ? desktopVideoPreview[0].filename : null,
        mobileVideoFile: mobileVideoFile ? mobileVideoFile[0].filename : null,
        mobileVideoPreview: mobileVideoPreview ? mobileVideoPreview[0].filename : null,
        selectedDays: selectedDays || [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        selectedDates: selectedDates ? selectedDates.map(date => new Date(date)) : [],
        url,
        clicks: clicks ? parseInt(clicks) : 0,
        views: views ? parseInt(views) : 0,
      },
    });

    res.status(201).json({ newAd });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el anuncio." });
  }
};
// Obtener todos los Ads
const getAds = async (req, res) => {
  try {
    const ads = await prisma.ad.findMany({
      where: {
        userId: {
          not: null,
        },
        cityId: {
          not: null,
        },
        stateId: {
          not: null,
        },
      },
      include: {
        adType: true,
        user: true,
        category: true,
        city: true,
        state: true,
      },
    });
    res.status(200).json(ads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los anuncios." });
  }
};
// Obtener un Ad por ID
const getAdById = async (req, res) => {
  const { id } = req.params;

  try {
    const ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        adType: true,
        user: true,
        category: true,
      },
    });

    if (!ad) {
      return res.status(404).json({ message: "Anuncio no encontrado." });
    }

    res.status(200).json(ad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el anuncio." });
  }
};

// Actualizar un Ad
const updateAd = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    adTypesId,
    linkUrl,
    buttonName,
    font,
    text1,
    text1Color,
    text2,
    text2Color,
    bgImage,
    payStatus,
    status,
    totalCost,
    userId,
    categoryId,
    urlVideo,
    desktopVideoPreview,
    mobileVideoPreview,
  } = req.body;

  const { desktopFile, mobileFile, desktopVideoFile, mobileVideoFile } =
    req.files;

  try {
    // Actualizar el Ad
    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        name,
        adTypesId,
        linkUrl,
        buttonName,
        desktopFile: desktopFile ? desktopFile[0].filename : null,
        mobileFile: mobileFile ? mobileFile[0].filename : null,
        font,
        text1,
        text1Color,
        text2,
        text2Color,
        bgImage,
        payStatus,
        status,
        totalCost: totalCost ? parseFloat(totalCost) : null,
        userId,
        categoryId,
        urlVideo,
        desktopVideoFile: desktopVideoFile
          ? desktopVideoFile[0].filename
          : null,
        desktopVideoPreview,
        mobileVideoFile: mobileVideoFile ? mobileVideoFile[0].filename : null,
        mobileVideoPreview,
      },
    });

    res.status(200).json({ updatedAd });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el anuncio." });
  }
};

// Eliminar un Ad
const deleteAd = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.ad.delete({
      where: { id },
    });
    res.status(200).json({ message: "Anuncio eliminado con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el anuncio." });
  }
};

module.exports = {
  createAd,
  getAds,
  getAdById,
  updateAd,
  deleteAd,
};
