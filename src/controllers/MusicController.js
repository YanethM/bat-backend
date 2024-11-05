const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createMusic = async (req, res) => {
  const { genre, breweryId } = req.body;
  const image = req.file;

  try {
    let music = await prisma.music.findUnique({
      where: { genre },
    });

    if (!music) {
      music = await prisma.music.create({
        data: {
          genre,
          image: image ? image.path : null,
        },
      });
    }

    if (breweryId) {
      const existingAssociation = await prisma.breweryMusic.findFirst({
        where: {
          breweryId: breweryId,
          musicId: music.id,
        },
      });

      if (!existingAssociation) {
        await prisma.breweryMusic.create({
          data: {
            breweryId, // Vincula con la cervecería recibida
            musicId: music.id, // Vincula la música existente o recién creada
          },
        });
        return res.status(200).json({
          message: "Música asociada con éxito a la cervecería.",
          data: music,
        });
      } else {
        return res.status(400).json({
          message: "Esta cervecería ya tiene asociada esta música.",
        });
      }
    }

    res.status(200).json({
      message: "Música creada o ya existente sin cervecería asociada.",
      data: music,
    });
  } catch (error) {
    console.error("Error al crear o asociar la música:", error);
    res.status(500).json({
      message: "Error al crear o asociar la música",
      error,
    });
  }
};

const getMusics = async (req, res) => {
  try {
    const musics = await prisma.music.findMany({
      include: {
        breweries: {
          // Incluir las cervecerías que ofrecen esta música
          include: {
            brewery: true, // Incluir los detalles de la cervecería
          },
        },
      },
    });

    res.status(200).json({ data: musics });
  } catch (error) {
    console.error("Error al obtener las músicas:", error);
    res.status(500).json({
      message: "Error al obtener las músicas",
      error,
    });
  }
};

const getMusicById = async (req, res) => {
  const { id } = req.params;
  try {
    const music = await prisma.music.findUnique({
      where: { id },
    });
    if (!music) {
      return res.status(404).json({ message: "Música no encontrada" });
    }
    res.status(200).json({ data: music });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la música", error });
  }
};

const updateMusic = async (req, res) => {
  const { id } = req.params;
  const { genre } = req.body;
  const image = req.file;

  try {
    const music = await prisma.music.update({
      where: { id },
      data: {
        genre,
        image: image ? image.path : null,
      },
    });
    res.status(200).json({ message: "Música actualizada", data: music });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la música", error });
  }
};

const deleteMusic = async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar todas las asociaciones con cervecerías en BreweryMusic antes de eliminar la música
    await prisma.breweryMusic.deleteMany({
      where: { musicId: id },
    });

    await prisma.music.delete({
      where: { id },
    });

    res.status(200).json({ message: "Música eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar la música:", error);
    res.status(500).json({ message: "Error al eliminar la música", error });
  }
};

const getBreweriesByMusic = async (req, res) => {
  const { musicId } = req.params;
  try {
    const breweries = await prisma.breweryMusic.findMany({
      where: {
        musicId: musicId,
      },
      include: {
        brewery: true,
      },
    });

    if (breweries.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron cervecerías con esta música." });
    }

    res.status(200).json({ data: breweries });
  } catch (error) {
    console.error("Error al obtener cervecerías por música:", error);
    res.status(500).json({
      message: "Error al obtener cervecerías por música",
      error,
    });
  }
};

module.exports = {
  createMusic,
  getMusics,
  getMusicById,
  getBreweriesByMusic,
  updateMusic,
  deleteMusic,
};
