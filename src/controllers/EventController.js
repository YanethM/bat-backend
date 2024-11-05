const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createEvent = async (req, res) => {
  const { name, description, date, breweryId } = req.body;
  const image = req.file;

  try {
    // Verificar si el evento ya existe por nombre
    let event = await prisma.event.findUnique({
      where: { name },
    });

    if (!event) {
      // Convertir la fecha a un objeto de tipo Date en formato ISO
      const eventDate = new Date(date);

      // Crear el evento si no existe
      event = await prisma.event.create({
        data: {
          name,
          description,
          date: eventDate, // Usar la fecha convertida
          image: image ? image.path : null,
        },
      });
    }

    // Si se proporciona breweryId, vincular el evento con la cervecería
    if (breweryId) {
      const existingAssociation = await prisma.breweryEvent.findFirst({
        where: {
          breweryId: breweryId,
          eventId: event.id,
        },
      });

      if (!existingAssociation) {
        await prisma.breweryEvent.create({
          data: {
            breweryId,
            eventId: event.id,
          },
        });
        return res.status(200).json({
          message: "Evento creado y asociado con éxito a la cervecería.",
          data: event,
        });
      } else {
        return res.status(400).json({
          message: "Esta cervecería ya tiene asociado este evento.",
        });
      }
    }

    res.status(200).json({
      message: "Evento creado o ya existente sin cervecería asociada.",
      data: event,
    });
  } catch (error) {
    console.error("Error al crear o asociar el evento:", error);
    res.status(500).json({
      message: "Error al crear o asociar el evento",
      error,
    });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        date: true,
        image: true,
        breweries: {
          select: {
            brewery: true,
          },
        },
      },
    });

    res.status(200).json({
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los eventos",
      error,
    });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    res.status(200).json({ data: event });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el evento", error });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, date, breweryId } = req.body;
  const image = req.file;

  try {
    const event = await prisma.event.update({
      where: { id },
      data: {
        name,
        description,
        date,
        image: image ? image.path : null,
      },
    });

    if (breweryId) {
      const existingAssociation = await prisma.breweryEvent.findFirst({
        where: {
          breweryId: breweryId,
          eventId: event.id,
        },
      });

      if (!existingAssociation) {
        await prisma.breweryEvent.create({
          data: {
            breweryId,
            eventId: event.id,
          },
        });
        return res.status(200).json({
          message: "Evento actualizado y asociado con éxito a la cervecería.",
          data: event,
        });
      } else {
        return res.status(400).json({
          message: "Esta cervecería ya tiene asociado este evento.",
        });
      }
    }

    res.status(200).json({
      message: "Evento actualizado o ya existente sin cervecería asociada.",
      data: event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al actualizar o asociar el evento",
      error,
    });
  }
};

const deleteEvent = async (req, res) => {
    const { id } = req.params;
    console.log(id);
  
    try {
      // Eliminar todas las asociaciones con cervecerías en BreweryEvent antes de eliminar el evento
      await prisma.breweryEvent.deleteMany({
        where: { eventId: id },
      });
  
      // Ahora puedes eliminar el evento
      await prisma.event.delete({
        where: { id },
      });
  
      res.status(200).json({ message: "Evento eliminado con éxito" });
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
      res.status(500).json({
        message: "Error al eliminar el evento",
        error,
      });
    }
  };
  
module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
