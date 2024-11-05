const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createBeer = async (req, res) => {
  const { name, brand, type, breweryId } = req.body; // Recibe el breweryId
  const image = req.file;

  try {
    // 1. Crear la cerveza
    const beer = await prisma.beer.create({
      data: {
        name,
        brand,
        type,
        image: image ? image.path : null, // Guarda la ruta de la imagen si se carga
      },
    });

    // 2. Asociar la cerveza con la cervecería usando BreweryBeer
    if (breweryId) {
      await prisma.breweryBeer.create({
        data: {
          breweryId, // Vincula con la cervecería recibida
          beerId: beer.id, // Vincula la cerveza recién creada
        },
      });
    }

    res.status(200).json({
      message: "Cerveza y relación almacenadas con éxito",
      data: beer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al crear la cerveza",
      error,
    });
  }
};


const getBeers = async (req, res) => {
  try {
    const beers = await prisma.beer.findMany({
      include: {
        breweries: {
          include: {
            brewery: true, // Incluye el objeto "brewery" si existe
          },
        },
      },
    });

    res.status(200).json({ data: beers });
  } catch (error) {
    console.error("Error al obtener las cervezas:", error);
    res.status(500).json({
      message: "Error al obtener las cervezas",
      error,
    });
  }
};

const getBeerById = async (req, res) => {
  const { id } = req.params;
  try {
    const beer = await prisma.beer.findUnique({
      where: { id },
    });
    if (!beer) {
      return res.status(404).json({ message: "Cerveza no encontrada" });
    }
    res.status(200).json({ data: beer });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la cerveza", error });
  }
};

const updateBeer = async (req, res) => {
  const { id } = req.params;
  const { name, brand, type } = req.body;
  const image = req.file;

  try {
    const beer = await prisma.beer.update({
      where: { id },
      data: {
        name,
        brand,
        type,
        image: image ? image.path : null,
      },
    });

    res.status(200).json({
      message: "Cerveza actualizada con éxito",
      data: beer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al actualizar la cerveza",
      error,
    });
  }
};

const deleteBeer = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.beer.delete({
      where: { id },
    });
    res.status(200).json({ message: "Cerveza eliminada con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al eliminar la cerveza",
      error,
    });
  }
};

const getBeersByBrewery = async (req, res) => {
  const { breweryId } = req.params;
  console.log(breweryId);
  
  try {
    const beers = await prisma.brewery
      .findUnique({
        where: { id: breweryId},
      })
      .beers();
    res.status(200).json({ data: beers });
  } catch (error) {
    console.error("Error al obtener las cervezas de la cervecería:", error);
    res.status(500).json({
      message: "Error al obtener las cervezas de la cervecería",
      error,
    });
  }
};


module.exports = {
  createBeer,
  getBeers,
  getBeerById,
  updateBeer,
  deleteBeer,
  getBeersByBrewery,
};
