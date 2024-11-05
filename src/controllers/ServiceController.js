const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createService = async (req, res) => {
  const { name, description, breweryId } = req.body;
  const image = req.file;

  try {
    let service = await prisma.service.findUnique({
      where: { name },
    });

    if (!service) {
      service = await prisma.service.create({
        data: {
          name,
          description,
          image: image ? image.path : null,
        },
      });
    }

    if (breweryId) {
      const existingAssociation = await prisma.breweryService.findFirst({
        where: {
          breweryId: breweryId,
          serviceId: service.id,
        },
      });

      if (!existingAssociation) {
        await prisma.breweryService.create({
          data: {
            breweryId,
            serviceId: service.id,
          },
        });
        return res.status(200).json({
          message: "Servicio asociado con éxito a la cervecería.",
          data: service,
        });
      } else {
        return res.status(400).json({
          message: "Esta cervecería ya tiene asociado este servicio.",
        });
      }
    }

    res.status(200).json({
      message: "Servicio creado o ya existente sin cervecería asociada.",
      data: service,
    });
  } catch (error) {
    console.error("Error al crear o asociar el servicio:", error);
    res.status(500).json({
      message: "Error al crear o asociar el servicio",
      error,
    });
  }
};

const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.status(200).json({ data: services });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los servicios", error });
  }
};

const getServiceById = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: { id },
    });
    res.status(200).json({ data: service });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el servicio", error });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const image = req.file;
  try {
    await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        image: image ? image.path : null,
      },
    });
    res.status(200).json({ message: "Servicio actualizado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el servicio", error });
  }
};

const deleteService = async (req, res) => {
    const { id } = req.params;
    
    try {
      // Eliminar todas las asociaciones con cervecerías en BreweryService antes de eliminar el servicio
      await prisma.breweryService.deleteMany({
        where: { serviceId: id },
      });
  
      await prisma.service.delete({
        where: { id },
      });
  
      res.status(200).json({ message: "Servicio eliminado con éxito" });
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
      res.status(500).json({ message: "Error al eliminar el servicio", error });
    }
  };

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
};
