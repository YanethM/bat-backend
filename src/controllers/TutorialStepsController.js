const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createTutorialSteps = async (req, res) => {
  const { title, description, orden } = req.body;
  
  // Verificar si ambas imágenes están presentes
  if (!req.files || !req.files.mobile_image || !req.files.web_image) {
    return res
      .status(400)
      .json({ message: "Se requieren ambas imágenes (móvil y web)." });
  }

  console.log(req.body);

  const mobile_image = req.files.mobile_image[0].filename;
  const web_image = req.files.web_image[0].filename;

  console.log(mobile_image);
  console.log(web_image);

  try {
    const existingTutorial = await prisma.tutorialStepsApp.findUnique({
      where: {
        title: title, 
      },
    });

    if (existingTutorial) {
      return res.status(400).json({ message: "El título ya está en uso." });
    }

    // Crear el nuevo tutorial si el título es único
    const tutorialStep = await prisma.tutorialStepsApp.create({
      data: {
        title,
        description,
        orden: parseInt(orden), // Convertir `orden` a entero
        mobile_image,
        web_image,
      },
    });

    console.log(tutorialStep);
    res.status(201).json({ tutorialStep });

  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "No se pudo crear el paso del tutorial." });
  }
};

const getTutorialSteps = async (req, res) => {
  try {
    const tutorialSteps = await prisma.tutorialStepsApp.findMany();
    res.status(200).json({ tutorialSteps });
  } catch (error) {
    res.status(400).json({ message: "No se pudieron obtener los pasos del tutorial." });
  }
}

const getTutorialStepById = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  
  try {
    const tutorialStep = await prisma.tutorialStepsApp.findUnique({
      where: {
        id,
      },
    });
    res.status(200).json({ tutorialStep });
  } catch (error) {
    console.log(error);
    
    res.status(400).json({ message: "No se pudo obtener el paso del tutorial." });
  }
}

const updateTutorialStep = async (req, res) => {
  const { id } = req.params;
  const { title, description, orden } = req.body;

  try {
    // Obtener el tutorial existente para acceder a las imágenes actuales
    const existingTutorialStep = await prisma.tutorialStepsApp.findUnique({
      where: { id },
    });

    if (!existingTutorialStep) {
      return res.status(404).json({ message: "Tutorial no encontrado." });
    }

    // Verificar si el usuario subió nuevas imágenes, de lo contrario usar las existentes
    const mobile_image = req.files && req.files.mobile_image
      ? req.files.mobile_image[0].filename
      : existingTutorialStep.mobile_image;

    const web_image = req.files && req.files.web_image
      ? req.files.web_image[0].filename
      : existingTutorialStep.web_image;

    // Actualizar el tutorial con los datos proporcionados, incluyendo las imágenes existentes si no se subieron nuevas
    const tutorialStep = await prisma.tutorialStepsApp.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        orden: parseInt(orden),
        mobile_image,
        web_image,
      },
    });

    res.status(200).json({ tutorialStep });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "No se pudo actualizar el paso del tutorial." });
  }
};

const deleteTutorialStep = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.tutorialStepsApp.delete({
      where: {
        id,
      },
    });
    res.status(200).json({ message: "Paso del tutorial eliminado correctamente." });
  } catch (error) {
    res.status(400).json({ message: "No se pudo eliminar el paso del tutorial." });
  }
}

module.exports = { createTutorialSteps, getTutorialSteps, getTutorialStepById, updateTutorialStep, deleteTutorialStep };
