const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createTerms = async (req, res) => {
  const { title, content, type } = req.body;
  console.log(req.body);

  // Validación del campo type
  if (!type || !["TERMS_SERVICE", "PRIVACY_POLICY", "ABOUT_US"].includes(type)) {
    return res
      .status(400)
      .json({ message: "El campo 'type' es obligatorio y debe ser válido." });
  }

  try {
    const terms = await prisma.terms.create({
      data: {
        title,
        content,
        type,
      },
    });

    res.status(201).json({ terms });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "No se pudo crear los términos y condiciones." });
  }
};

const getTerms = async (req, res) => {
  try {
    const terms = await prisma.terms.findMany({
      where: {
        type: {
          in: ["TERMS_SERVICE", "PRIVACY_POLICY", "ABOUT_US"],
        },
      },
    });
    res.status(200).json({ terms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No se pudieron obtener los términos." });
  }
};

const getTermsById = async (req, res) => {
  const { id } = req.params;

  try {
    const terms = await prisma.terms.findUnique({
      where: { id },
    });

    if (!terms) {
      return res.status(404).json({ message: "Términos no encontrados." });
    }

    res.status(200).json({ terms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No se pudieron obtener los términos." });
  }
};

const updateTerms = async (req, res) => {
  const { id } = req.params;
  const { title, content, type } = req.body;

  // Validación del campo type
  if (type && !["TERMS_SERVICE", "PRIVACY_POLICY", "ABOUT_US"].includes(type)) {
    return res
      .status(400)
      .json({ message: "El campo 'type' debe ser válido si se proporciona." });
  }

  try {
    const terms = await prisma.terms.update({
      where: { id },
      data: {
        title,
        content,
        type, // Incluye el campo type si se proporciona
      },
    });

    res.status(200).json({ terms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No se pudo actualizar los términos." });
  }
};

const deleteTerms = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.terms.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No se pudo eliminar los términos." });
  }
};

const getTermsByType = async (req, res) => {
  const { type } = req.params;

  // Verificar si el tipo es válido
  if (!["TERMS_SERVICE", "PRIVACY_POLICY", "ABOUT_US"].includes(type)) {
    return res.status(400).json({ message: "Tipo de término no válido." });
  }

  try {
    const terms = await prisma.terms.findMany({
      where: { type },
    });

    res.status(200).json({ terms });
  } catch (error) {
    console.error("Error fetching terms by type:", error);
    res.status(500).json({ message: "No se pudieron obtener los términos." });
  }
};


module.exports = {
  createTerms,
  getTerms,
  getTermsById,
  updateTerms,
  deleteTerms,
  getTermsByType,
};
