const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createFood = async (req, res) => {
  const { name, type, breweryId } = req.body;
  const image = req.file;

  try {
    // Verificar si la comida ya existe por nombre
    let food = await prisma.food.findUnique({
      where: { name },
    });

    if (!food) {
      // Si la comida no existe, se crea una nueva
      food = await prisma.food.create({
        data: {
          name,
          type,
          image: image ? image.path : null,
        },
      });
    }

    // Si se proporciona breweryId, vincular la comida con la cervecería
    if (breweryId) {
      // Verificar si ya existe la relación entre la comida y la cervecería
      const existingAssociation = await prisma.breweryFood.findFirst({
        where: {
          breweryId: breweryId,
          foodId: food.id,
        },
      });

      if (!existingAssociation) {
        await prisma.breweryFood.create({
          data: {
            breweryId, // Vincula con la cervecería recibida
            foodId: food.id, // Vincula la comida
          },
        });
      } else {
        return res.status(400).json({
          message: "Esta cervecería ya tiene asociada esta comida.",
        });
      }
    }

    res.status(200).json({
      message: "Comida almacenada y asociada con éxito a la cervecería.",
      data: food,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al crear o asociar la comida",
      error,
    });
  }
};

const getFoods = async (req, res) => {
  try {
    const foods = await prisma.food.findMany({
      include: {
        breweries: { // Incluir las cervecerías que ofrecen esta comida
          include: {
            brewery: true, // Incluir los detalles de la cervecería
          },
        },
      },
    });

    res.status(200).json({ data: foods });
  } catch (error) {
    console.error("Error al obtener las comidas:", error);
    res.status(500).json({
      message: "Error al obtener las comidas",
      error,
    });
  }
};

const getFoodById = async (req, res) => {
  const { id } = req.params;
  try {
    const food = await prisma.food.findUnique({
      where: { id },
    });
    if (!food) {
      return res.status(404).json({ message: "Comida no encontrada" });
    }
    res.status(200).json({ data: food });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la comida", error });
  }
};

const updateFood = async (req, res) => {
  const { id } = req.params;
  const { name, type,  breweryId} = req.body;
  const image = req.file;

  try {
    const food = await prisma.food.update({
      where: { id },
      data: {
        name,
        type,
        image: image ? image.path : null,
        breweryFood: {
          create: {
            breweryId,
          },
        },
      },
    });

    res.status(200).json({
      message: "Comida actualizada con éxito",
      data: food,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al actualizar la comida",
      error,
    });
  }
};

const deleteFood = async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar todas las asociaciones con cervecerías en BreweryFood antes de eliminar la comida
    await prisma.breweryFood.deleteMany({
      where: { foodId: id },
    });

    await prisma.food.delete({
      where: { id },
    });

    res.status(200).json({ message: "Comida eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar la comida:", error);
    res.status(500).json({
      message: "Error al eliminar la comida",
      error,
    });
  }
};

const getFoodsByType = async (req, res) => {
  const { type } = req.params;
  try {
    const foods = await prisma.food.findMany({
      where: {
        type,
      },
    });
    if (foods.length === 0) {
      return res.status(404).json({ message: "No se encontraron comidas" });
    }
    res.status(200).json({ data: foods });
  } catch (error) {
    console.error("Error al obtener las comidas por tipo:", error);
    res.status(500).json({
      message: "Error al obtener las comidas por tipo",
      error,
    });
  }
};

const gerBreweryFood = async (req, res) => {
    const { breweryId } = req.params;
    try {
        const breweryFood = await prisma.breweryFood.findMany({
        where: {
            breweryId,
        }
        });

        console.log(breweryFood);
        
    
        if (breweryFood.length === 0) {
        return res.status(404).json({ message: "No se encontraron comidas en esta cervecería." });
        }
    
        console.log(breweryFood);
        res.status(200).json({ data: breweryFood });
    } catch (error) {
        console.error("Error al obtener comidas por cervecería:", error);
        res.status(500).json({ message: "Error al obtener comidas por cervecería", error });
    }
};

module.exports = {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
  getFoodsByType,
  gerBreweryFood,
};
