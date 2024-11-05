const fs = require("fs");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

// Crear archivo de log
const logFilePath = "./breweries_upload.log";
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

// Función para almacenar los datos en la base de datos y escribir en el log
const storeBreweriesData = async (breweryData, res) => {
  try {
    for (const entry of breweryData) {
      const {
        name,
        type,
        website,
        city,
        state_id,
        address,
        firstname,
        lastname,
        role,
        email,
        phone_number,
        facebook,
        x,
        instagram,
        latitude,
        longitude,
        mondayOpen,
        mondayClose,
        tuesdayOpen,
        tuesdayClose,
        wednesdayOpen,
        wednesdayClose,
        thursdayOpen,
        thursdayClose,
        fridayOpen,
        fridayClose,
        saturdayOpen,
        saturdayClose,
        sundayOpen,
        sundayClose,
        zip,
        merchandise,
        social_media,
      } = entry;

      // Validar que el state_id esté definido
      if (!state_id) {
        continue; // Saltar a la siguiente iteración si no hay `state_id`
      }

      // Buscar el estado por `state_id`
      const storedState = await prisma.state.findUnique({
        where: { state_id },
      });

      if (!storedState) {
        logStream.write(`Estado no encontrado: ${state_id}\n`);
        console.log(`Estado no encontrado: ${state_id}`);
        continue; // Si el estado no se encuentra, pasar al siguiente
      }

      const storedCity = await prisma.city.findFirst({
        where: {
          name: city,
          zip: { contains: zip },
          stateId: storedState.id,
        },
      });

      if (!storedCity) {
        logStream.write(
          `Ciudad no encontrada: ${city} en el estado: ${state_id} cervecería: ${name}\n`
        );
        console.log(
          `Ciudad no encontrada: ${city} en el estado: ${state_id} cervecería: ${name}`
        );
        continue; // Si la ciudad no se encuentra, pasar al siguiente
      }

      // **Validar si la cervecería ya existe en esta ciudad y estado**
      const existingBrewery = await prisma.brewery.findFirst({
        where: {
          name,
          location: {
            cityId: storedCity.id,
          },
        },
        include: {
          location: true, // Para asegurarse de obtener los detalles de la ubicación
        },
      });
      console.log(existingBrewery);

      if (existingBrewery) {
        logStream.write(
          `Cervecería ya existe: ${name} en ${city}, ${state_id}\n`
        );
        console.log(`Cervecería ya existe: ${name} en ${city}, ${state_id}`);
        continue; // Si la cervecería ya existe, saltar al siguiente registro
      }

      // Validar si el usuario ya existe y actualizarlo/crearlo
      let user;
      const userRole =
        role === "BREWERY_OWNER" || role === "BREWERY_MANAGER" ? role : null;
      const defaultPassword = "test123";

      if (userRole) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        user = await prisma.user.upsert({
          where: { email },
          update: {
            firstname,
            lastname,
            phone_number,
            role: userRole,
            current_password: user?.current_password || hashedPassword,
            birthdate: null,
            photo: null,
          },
          create: {
            firstname,
            lastname,
            email,
            phone_number,
            role: userRole,
            current_password: hashedPassword,
            birthdate: null,
            photo: null,
            cityId: storedCity.id,
          },
        });
      }

      // Convertir latitud y longitud a float
      const lat = parseFloat(latitude?.replace(",", ".") || 0); // Convertir de String a Float y corregir comas
      const lng = parseFloat(longitude?.replace(",", ".") || 0); // Convertir de String a Float y corregir comas

      // Convertir los campos de merchandise y social_media a booleanos
      const merchandiseBoolean = merchandise === "true";
      const socialMediaBoolean = social_media === "true";

      // Crear la cervecería (asociarla al usuario según su rol, si existe)
      const newBrewery = await prisma.brewery.create({
        data: {
          name,
          type,
          website,
          merchandise: merchandiseBoolean,
          social_media: socialMediaBoolean,
          owner:
            role === "BREWERY_OWNER" && user
              ? { connect: { id: user.id } }
              : undefined,
          manager:
            role === "BREWERY_MANAGER" && user
              ? { connect: { id: user.id } }
              : undefined,
          location: {
            create: {
              address,
              cityId: storedCity.id,
              stateId: storedState.id,
              countyId: storedCity.countyId,
              latitude: lat,
              longitude: lng,
              zip,
            },
          },
          features: {
            create: {
              facebook,
              x,
              instagram,
            },
          },
          OperatingHours: {
            create: {
              mondayOpen,
              mondayClose,
              tuesdayOpen,
              tuesdayClose,
              wednesdayOpen,
              wednesdayClose,
              thursdayOpen,
              thursdayClose,
              fridayOpen,
              fridayClose,
              saturdayOpen,
              saturdayClose,
              sundayOpen,
              sundayClose,
            },
          },
        },
      });

      console.log(`Cervecería creada: ${newBrewery.name}`);
    }

    res.status(200).json({ message: "Proceso de carga completado con éxito" });
  } catch (error) {
    console.error("Error al procesar los datos:", error);
    res.status(500).json({ message: "Error al procesar los datos", error });
  } finally {
    logStream.end(); // Cerrar el archivo de log al finalizar
  }
};

// Función para procesar el archivo CSV
const processCSV = (filePath, res) => {
  const breweryData = [];

  fs.createReadStream(filePath)
    .pipe(csv({ separator: ";" })) // CSV con separador ';'
    .on("data", (row) => {
      // Desestructuramos el CSV según las columnas que tiene
      breweryData.push({
        name: row.name,
        type: row.type,
        website: row.website,
        city: row.city,
        state_id: row.state_id,
        address: row.address,
        firstname: row.firstname,
        lastname: row.lastname,
        role: row.role,
        email: row.email,
        phone_number: row.phone_number,
        facebook: row.facebook,
        x: row.x,
        instagram: row.instagram,
        latitude: row.latitude,
        longitude: row.longitude,
        mondayOpen: row.mondayOpen,
        mondayClose: row.mondayClose,
        tuesdayOpen: row.tuesdayOpen,
        tuesdayClose: row.tuesdayClose,
        wednesdayOpen: row.wednesdayOpen,
        wednesdayClose: row.wednesdayClose,
        thursdayOpen: row.thursdayOpen,
        thursdayClose: row.thursdayClose,
        fridayOpen: row.fridayOpen,
        fridayClose: row.fridayClose,
        saturdayOpen: row.saturdayOpen,
        saturdayClose: row.saturdayClose,
        sundayOpen: row.sundayOpen,
        sundayClose: row.sundayClose,
        zip: row.zip,
        merchandise: row.merchandise,
        social_media: row.social_media,
      });
    })
    .on("end", async () => {
      console.log("Archivo CSV procesado correctamente");

      // Llamar a la función para almacenar los datos de cervecerías
      await storeBreweriesData(breweryData, res);

      console.log("Proceso completado");
    });
};

// Controlador para manejar la subida y procesamiento del CSV
const uploadAndProcessCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ningún archivo" });
  }
  const filePath = req.file.path; // Ruta temporal del archivo subido
  processCSV(filePath, res);
};

const getBreweries = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Configura la paginación y las relaciones mínimas necesarias
    const breweries = await prisma.brewery.findMany({
      skip: (page - 1) * limit,
      take: parseInt(limit),
      include: {
        location: { include: { city: true } },
        owner: { select: { id: true, firstname: true, lastname: true } },
        manager: { select: { id: true, firstname: true, lastname: true } },
        OperatingHours: true,
        beers: {
          include: {
            beer: true, // Incluye detalles de cada cerveza asociada
          },
        },
        foods: {
          include: {
            food: true, // Incluye detalles de cada alimento asociado
          },
        },
        services: {
          include: {
            service: true, // Incluye detalles de cada servicio asociado
          },
        },
        music: {
          include: {
            music: true, // Incluye detalles de cada tipo de música asociado
          },
        },
        media: true,
      },
    });

    // Responde con los datos paginados
    res.status(200).json({
      data: breweries,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalCount: await prisma.brewery.count(),
      },
    });
  } catch (error) {
    console.error("Error al obtener las cervecerías:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las cervecerías", error });
  }
};

const getBreweryById = async (req, res) => {
  const { id } = req.params;
  try {
    const brewery = await prisma.brewery.findUnique({
      where: { id },
      include: {
        location: { include: { city: true } },
        features: true,
        OperatingHours: true,
        owner: true,
        manager: true,
        beers: {
          include: {
            beer: true,
          },
        },
        foods: {
          include: {
            food: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        music: {
          include: {
            music: true,
          },
        },
        BreweryEvent: {
          include: {
            event: true, // Esto trae los datos completos del evento
          },
        },
        media: true,
      },
    });

    if (!brewery) {
      return res.status(404).json({ message: "Cervecería no encontrada" });
    }

    res.status(200).json({ data: brewery });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la cervecería", error });
  }
};

const getBreweriesBySpecificLocation = async (req, res) => {
  const { stateId } = req.params;

  try {
    // Obtener el estado específico por su nombre
    const breweries = await prisma.location.findMany({
      where: {
        stateId: stateId,
      },
    });
    console.log(breweries);

    if (breweries.length === 0) {
      return res.status(404).json({
        message: `No se encontraron cervecerías en el estado de ${stateId}`,
      });
    }

    res.status(200).json({
      message: `Cervecerías en el estado de ${stateId}`,
      data: breweries,
    });
  } catch (error) {
    console.error("Error al obtener cervecerías por estado:", error);
    res.status(500).json({
      message: "Error al obtener cervecerías por estado",
      error,
    });
  }
};

const getBreweriesByOwner = async (req, res) => {
  const { ownerId } = req.params;

  try {
    const breweries = await prisma.brewery.findMany({
      where: {
        ownerId,
      },
    });

    if (breweries.length === 0) {
      return res.status(404).json({
        message: `No se encontraron cervecerías para el propietario con ID: ${ownerId}`,
      });
    }

    res.status(200).json({
      message: `Lista de cervecerías para el propietario con ID: ${ownerId}`,
      data: breweries,
    });
  } catch (error) {
    console.error("Error al obtener las cervecerías:", error);
    res.status(500).json({
      message: "Error al obtener las cervecerías",
      error,
    });
  }
};

module.exports = {
  uploadAndProcessCSV,
  getBreweries,
  getBreweryById,
  getBreweriesBySpecificLocation,
  getBreweriesByOwner,
};
