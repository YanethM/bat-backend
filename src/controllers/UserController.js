const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

const createUser = async (req, res) => {
  const {
    firstname,
    lastname,
    birthdate,
    phone_number,
    email,
    current_password,
    city,
  } = req.body;
  const photo = req.file; // Verificar si se cargó una foto
  const formattedBirthdate = birthdate ? birthdate : null;
  // Validar si el correo tiene formato válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  try {
    // Verificar si el correo ya existe en la base de datos
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Encriptar la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(current_password, 10);

    // Definir la ruta de la foto si fue cargada
    let photoPath = null;
    if (photo) {
      photoPath = photo.path; // Obtener la ruta del archivo cargado
    }

    // Crear el nuevo usuario
    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        birthdate: formattedBirthdate,
        phone_number,
        email,
        current_password: hashedPassword,
        city: city ? { connect: { id: city } } : undefined,
        photo: photoPath,
      },
    });

    console.log(user);
    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error creating user",
      error,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        birthdate: true,
        phone_number: true,
        photo: true,
        state: true,
        role: true,
        city: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error retrieving users",
      error,
    });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        birthdate: true,
        phone_number: true,
        photo: true,
        state: true,
        role: true,
        city: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error retrieving user",
      error,
    });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  const { firstname, lastname, birthdate, phone_number, email, city } =
    req.body;
  console.log(req.body);

  const photo = req.file; // Verificar si se cargó una foto

  // Validar si el correo tiene formato válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  try {
    // Verificar si el usuario existe en la base de datos
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Definir la ruta de la foto si fue cargada
    let photoPath = undefined;
    if (photo) {
      photoPath = photo.path; // Obtener la ruta del archivo cargado
    }

    // Actualizar el usuario
    const user = await prisma.user.update({
      where: { id },
      data: {
        firstname,
        lastname,
        birthdate,
        phone_number,
        email,
        city: city ? { connect: { id: city } } : undefined,
        photo: photoPath,
      },
    });
    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error updating user",
      error,
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el usuario existe en la base de datos
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error deleting user",
      error,
    });
  }
};

const changePassword = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  const { current_password, new_password } = req.body;
  console.log(req.body);

  try {
    // Verificar si el usuario existe en la base de datos
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verificar si la contraseña actual es correcta
    const validPassword = await bcrypt.compare(
      current_password,
      existingUser.current_password
    );
    console.log(validPassword);

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Actualizar la contraseña
    await prisma.user.update({
      where: { id },
      data: {
        current_password: hashedPassword,
      },
    });

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error updating password",
      error,
    });
  }
};

const changeUserState = async (req, res) => {
  const { id } = req.params;
  const { state } = req.body;

  // Validar que el nuevo estado sea válido (ACTIVE o INACTIVE)
  const validStates = ["ACTIVE", "INACTIVE"];
  if (!validStates.includes(state)) {
    return res.status(400).json({
      message: "Invalid state. State must be 'ACTIVE' or 'INACTIVE'.",
    });
  }

  try {
    // Verificar si el usuario existe en la base de datos
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Actualizar el estado del usuario
    const user = await prisma.user.update({
      where: { id },
      data: {
        state,
      },
    });

    res.status(200).json({
      message: "User state updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error updating user state",
      error,
    });
  }
};

const getUserBreweries = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el usuario existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        ownedBreweries: {
          select: {
            id: true,
            name: true,
            type: true,
            website: true,
            status: true,
            location: {
              select: {
                address: true,
                city: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        managedBreweries: {
          select: {
            id: true,
            name: true,
            type: true,
            website: true,
            status: true,
            location: {
              select: {
                address: true,
                city: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Agrupar las cervecerías por tipo de asociación
    const breweries = {
      ownedBreweries: user.ownedBreweries,
      managedBreweries: user.managedBreweries,
    };

    res.status(200).json({ userId: user.id, firstname: user.firstname, lastname: user.lastname, breweries });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error retrieving breweries associated with the user", error });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  changeUserState,
  getUserBreweries
};
