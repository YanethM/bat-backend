const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getLocationBrewery = async (req, res) => {
  let page = 1,
    limit = 100;
  try {
    const breweries = await prisma.brewery.findMany({
      include: {
        location: {
          select: {
            city: {
              select: {
                name: true,
              },
            },
            address: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    breweries.forEach((brewery) => {
      console.log(`Cervecería: ${brewery.name}`);
      console.log(` - Ciudad: ${brewery.location.city.name}`);
      console.log(` - Dirección: ${brewery.location.address}`);
      console.log(
        ` - Latitud: ${brewery.location.latitude || "No disponible"}`
      );
      console.log(
        ` - Longitud: ${brewery.location.longitude || "No disponible"}`
      );
    });
    res.status(200).json({ data: breweries });
  } catch (error) {
    console.error("Error al obtener cervecerías paginadas:", error);
    res.status(500).json({
      message: "Error al obtener cervecerías paginadas",
      error,
    });
  }
};

const getBreweriesBySpecificLocation = async (req, res) => {
    try {
      const { cityId } = req.params;
      console.log(cityId);
  
      // Buscar ubicaciones relacionadas con la ciudad
      const locations = await prisma.location.findMany({
        where: {
          cityId: cityId,
        },
        include: {
          Brewery: true, // Incluir las cervecerías relacionadas con la ubicación
        },
      });
  
      if (locations.length === 0) {
        return res.status(404).json({ message: "No se encontraron cervecerías en esta ciudad." });
      }
  
      console.log(locations);
      res.status(200).json({ data: locations });
    } catch (error) {
      console.error("Error al obtener cervecerías por ciudad:", error);
      res.status(500).json({ message: "Error al obtener cervecerías por ciudad", error });
    }
  };
  


module.exports = {
  getLocationBrewery,
  getBreweriesBySpecificLocation,
};
