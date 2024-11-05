const { PrismaClient } = require("@prisma/client");
const { connect } = require("mongoose");
const prisma = new PrismaClient();

const createTour = async (req, res) => {
  const {
    name,
    description,
    userId,
    cityId,
    radius,
    startDate,
    breweryCount,
    days,
    breweries, // Este campo llega como una cadena separada por comas
  } = req.body;

  // Verificar que los campos obligatorios están presentes
  if (
    !name ||
    !userId ||
    !cityId ||
    !radius ||
    !startDate ||
    !breweryCount ||
    !days ||
    !breweries
  ) {
    return res.status(400).json({
      message: "Todos los campos obligatorios deben ser proporcionados.",
    });
  }

  // Verificar si startDate es una fecha válida
  const parsedStartDate = new Date(startDate);
  if (isNaN(parsedStartDate)) {
    return res.status(400).json({ message: "Fecha de inicio inválida." });
  }
  const image = req.file ? req.file.filename : null;

  try {
    // Crear el nuevo Tour en la base de datos
    const tour = await prisma.tour.create({
      data: {
        name,
        description: description || null, // Opcional
        image: image || null, // Opcional
        userId,
        cityId,
        radius: parseFloat(radius), // Asegurarse de que el radius es de tipo Float
        startDate: parsedStartDate, // Asegurarse de que startDate es de tipo DateTime
        breweryCount: parseInt(breweryCount), // Convertir breweryCount a Int
        days: parseInt(days), // Convertir days a Int
      },
    });

    // Convertir la cadena de breweries en un array
    const breweryIds = breweries.split(",").map((id) => id.trim());

    // Crear las relaciones con las cervecerías en TourBrewery
    const tourBreweryData = breweryIds.map((breweryId) => ({
      tourId: tour.id,
      breweryId,
      distance: 0, 
    }));

    await prisma.tourBrewery.createMany({
      data: tourBreweryData,
    });

    // Responder con el tour creado y las cervecerías relacionadas
    res.status(201).json({ tour, breweries: tourBreweryData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "No se pudo crear el tour." });
  }
};

const getTours = async (req, res) => {
  try {
    const tours = await prisma.tour.findMany({
      include: {
        breweries: {
          include: {
            brewery: true,
          },
        },
        city: {
          include: {
            state: true, // Incluye el estado relacionado con la ciudad
          },
        },
        user: true, // Incluye el usuario asociado
      },
    });
    res.status(200).json({ tours });
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(400).json({ message: "No se pudieron obtener los tours." });
  }
};

const getTourById = async (req, res) => {
  const { id } = req.params;

  try {
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        breweries: {
          include: {
            brewery: true, // Incluir la información de la cervecería relacionada
          },
        },
      },
    });

    if (!tour) {
      return res.status(404).json({ message: "Tour no encontrado." });
    }

    res.status(200).json({ tour });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "No se pudo obtener el tour." });
  }
};

const updateTour = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    image,
    userId,
    cityId,
    radius,
    startDate,
    breweryCount,
    days,
    breweries, // Array de { breweryId, distance }
  } = req.body;

  try {
    const existingTour = await prisma.tour.findUnique({
      where: { id },
      include: {
        breweries: true, // Incluir las relaciones actuales para eliminarlas si es necesario
      },
    });

    if (!existingTour) {
      return res.status(404).json({ message: "Tour no encontrado." });
    }

    const parsedStartDate = startDate
      ? new Date(startDate)
      : existingTour.startDate;

    if (startDate && isNaN(parsedStartDate)) {
      return res.status(400).json({ message: "Fecha de inicio inválida." });
    }

    // Actualizar el tour
    const updatedTour = await prisma.tour.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingTour.name,
        description: description || existingTour.description,
        image: image || existingTour.image,
        userId: userId || existingTour.userId,
        cityId: cityId || existingTour.cityId,
        radius: radius !== undefined ? parseFloat(radius) : existingTour.radius,
        startDate: parsedStartDate,
        breweryCount:
          breweryCount !== undefined
            ? parseInt(breweryCount)
            : existingTour.breweryCount,
        days: days !== undefined ? parseInt(days) : existingTour.days,
      },
    });

    // Si hay cervecerías nuevas, eliminar las relaciones actuales y crear las nuevas
    if (breweries && breweries.length > 0) {
      // Eliminar relaciones anteriores en TourBrewery
      await prisma.tourBrewery.deleteMany({
        where: { tourId: id },
      });

      // Crear nuevas relaciones
      const tourBreweryData = breweries.map((brewery) => ({
        tourId: id,
        breweryId: brewery.breweryId,
        distance: parseFloat(brewery.distance),
      }));

      await prisma.tourBrewery.createMany({
        data: tourBreweryData,
      });
    }

    res.status(200).json({ updatedTour });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "No se pudo actualizar el tour." });
  }
};

const deleteTour = async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar las relaciones en TourBrewery antes de eliminar el tour
    await prisma.tourBrewery.deleteMany({
      where: {
        tourId: id,
      },
    });

    // Eliminar el tour
    await prisma.tour.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ message: "Tour eliminado." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "No se pudo eliminar el tour." });
  }
};

module.exports = {
  createTour,
  getTours,
  getTourById,
  updateTour,
  deleteTour,
};
