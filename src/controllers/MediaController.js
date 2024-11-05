const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Controlador para crear un medio para una cervecería
const createMediaBrewery = async (req, res) => {
  try {
    const { breweryId, type } = req.body;
    const userId = req.user?.id; // Suponiendo que el ID del usuario está en el token o sesión

    // Verificación de que el tipo de media es válido
    if (!["IMAGE", "VIDEO"].includes(type)) {
      return res.status(400).json({ error: "Invalid media type" });
    }

    // Verificación de que la cervecería existe
    const brewery = await prisma.brewery.findUnique({
      where: { id: breweryId },
    });
    if (!brewery) {
      return res.status(404).json({ error: "Brewery not found" });
    }

    // Validación y extracción de URLs de los archivos cargados
    let url = null;
    let thumbnail = null;

    if (req.files && req.files.mediaFile && req.files.mediaFile[0]) {
      url = `/uploads/media_brewery/${req.files.mediaFile[0].filename}`;
    }

    if (
      type === "VIDEO" &&
      req.files &&
      req.files.thumbnail &&
      req.files.thumbnail[0]
    ) {
      thumbnail = `/uploads/media_brewery/${req.files.thumbnail[0].filename}`;
    }

    // Verificar que el archivo principal exista en caso de ser requerido
    if (!url) {
      return res.status(400).json({ error: "Media file is required" });
    }

    // Crear el registro de media
    const media = await prisma.media.create({
      data: {
        type,
        url,
        thumbnail: type === "VIDEO" ? thumbnail : null,
        status: "PENDING", // Estado inicial en espera de aprobación
        brewery: { connect: { id: breweryId } },
        approvedById: userId, // Inicialmente nulo hasta que sea aprobado por un admin
      },
    });

    return res.status(201).json(media);
  } catch (error) {
    console.error("Error creating media:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMediaReviews = async (req, res) => {
  try {
    const mediaReviews = await prisma.media.findMany({
      include: {
        brewery: {
          include: {
            location: {
              include: {
                city: true, // Incluye la ciudad de la ubicación
              },
            },
          },
        },
      },
    });

    // Organizar los medios en grupos según su estado
    const groupedMedia = {
      PENDING: mediaReviews.filter((media) => media.status === "PENDING"),
      APPROVED: mediaReviews.filter((media) => media.status === "APPROVED"),
      REJECTED: mediaReviews.filter((media) => media.status === "REJECTED"),
    };

    res.status(200).json({ mediaReviews: groupedMedia });
  } catch (error) {
    console.error("Error al obtener las revisiones de medios:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las revisiones de medios" });
  }
};

// Controlador para aprobar o rechazar un medio (solo para ADMIN)
// En el controlador
const reviewMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id; // Verificar si req.user existe y contiene el id

    // Validación adicional de valores
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    console.log(
      "Updating media:",
      mediaId,
      "to status:",
      status,
      "by user:",
      userId
    );

    // Actualizar el status del media en la base de datos
    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: {
        status,
        approvedById: userId,
      },
    });

    if (!updatedMedia) {
      return res.status(404).json({ error: "Media not found" });
    }

    return res.status(200).json(updatedMedia);
  } catch (error) {
    console.error("Error reviewing media:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createMediaBrewery,
  reviewMedia,
  getMediaReviews,
};
