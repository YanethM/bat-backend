const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const allowedCategories = ['Food', 'Music', 'Events', 'Services'];

// Crear un nuevo Item y asociarlo con categorías
// Crear un nuevo Item y asociarlo con categorías existentes en la base de datos
const createItem = async (req, res) => {
  const { name, type, description, categoryNames } = req.body;

  // Validar que el tipo de elemento sea uno de los permitidos
  if (!['FOOD', 'SERVICE', 'MUSIC', 'EVENT'].includes(type)) {
    return res.status(400).json({ message: 'Tipo de elemento inválido.' });
  }

  // Verificar que se haya enviado categoryNames y que sea un array
  if (!categoryNames || !Array.isArray(categoryNames)) {
    return res.status(400).json({ message: 'Se debe proporcionar una lista válida de categorías.' });
  }

  try {
    // Buscar las categorías que existan en la base de datos
    const existingCategories = await prisma.category.findMany({
      where: {
        name: { in: categoryNames },
      },
    });

    // Verificar si algunas categorías proporcionadas no existen en la base de datos
    const foundCategoryNames = existingCategories.map(category => category.name);
    const invalidCategories = categoryNames.filter(category => !foundCategoryNames.includes(category));

    if (invalidCategories.length > 0) {
      return res.status(400).json({ message: `Las siguientes categorías no existen en la base de datos: ${invalidCategories.join(', ')}` });
    }

    // Crear el nuevo Item con las categorías asociadas
    const newItem = await prisma.item.create({
      data: {
        name,
        type,
        description,
        itemCategories: {
          create: existingCategories.map((category) => ({
            category: {
              connect: { id: category.id },
            },
          })),
        },
      },
    });

    res.status(201).json({ newItem });
  } catch (error) {
    console.error("Error al crear el ítem:", error);
    res.status(500).json({ message: 'Error al crear el ítem.' });
  }
};
// Obtener todos los Items junto con sus categorías
const getItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: {
        itemCategories: {
          include: {
            category: true,
          },
        },
      },
    });
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los ítems.' });
  }
};

// Obtener un Item por ID junto con sus categorías
const getItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        itemCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ message: 'Ítem no encontrado.' });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el ítem.' });
  }
};

// Actualizar un Item y sus categorías
const updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, type, description, categoryNames } = req.body;

  // Validar el tipo
  if (type && !['FOOD', 'SERVICE', 'MUSIC', 'EVENT'].includes(type)) {
    return res.status(400).json({ message: 'Tipo de elemento inválido.' });
  }

  try {
    // Verificar que las nuevas categorías existan
    const existingCategories = await prisma.category.findMany({
      where: { name: { in: categoryNames } },
    });

    // Actualizar el Item
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name,
        type,
        description,
        itemCategories: {
          deleteMany: {}, // Eliminar relaciones actuales
          create: existingCategories.map((category) => ({
            category: {
              connect: { id: category.id },
            },
          })),
        },
      },
    });

    res.status(200).json({ updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el ítem.' });
  }
};

// Eliminar un Item y sus relaciones con categorías
const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar las relaciones de categorías
    await prisma.itemCategory.deleteMany({
      where: { itemId: id },
    });

    // Eliminar el Item
    await prisma.item.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Ítem eliminado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el ítem.' });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};