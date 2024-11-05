const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const signup = async (req, res) => {
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

const login = async (req, res) => {
  const { email, current_password } = req.body;
  console.log(req.body);

  try {
    // Verificar si el correo existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log(user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verificar si la contraseña es correcta
    const validPassword = await bcrypt.compare(
      current_password,
      user.current_password
    );
    console.log(validPassword);

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // Asegurarte de que JWT_SECRET tiene un valor
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    // Generar el token de autenticación
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      id: user.id, // Agregar el ID del usuario aquí
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error logging in",
      error,
    });
  }
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar si el correo existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generar una nueva contraseña
    const newPassword = Math.random().toString(36).slice(-8);

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    await prisma.user.update({
      where: { email },
      data: {
        current_password: hashedPassword,
      },
    });

    res.status(200).json({
      message: "Password reset successful",
      newPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error resetting password",
      error,
    });
  }
};

const profile = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // El token es del tipo "Bearer <token>"

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        city: true,
        ownedBreweries: true,
        managedBreweries: true,
        sentNotifications: true,
        receivedNotifications: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Excluir el campo de contraseña antes de enviar la respuesta
    const { password, ...userData } = user;

    res.status(200).json({
      message: "User found",
      user: userData,
    });
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({
      message: "Error finding user",
      error,
    });
  }
};

module.exports = {
  signup,
  login,
  resetPassword,
  profile,
};
