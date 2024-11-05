const fs = require("fs");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crear un stream para escribir en el archivo de log
const logStream = fs.createWriteStream("cities_not_created.log", {
  flags: "a",
});

// Función para almacenar los datos en la base de datos
const storeData = async (statesData, res) => {
  try {
    for (const state of statesData) {
      // Insertar o buscar estado
      const storedState = await prisma.state.upsert({
        where: { state_id: state.state_id },
        update: {},
        create: {
          name: state.state_name,
          state_id: state.state_id,
        },
      });

      for (const county of state.counties) {
        // Verifica si el condado tiene fipsCode
        if (!county.county_fips) {
          console.log(
            `Condado sin fipsCode encontrado en el estado: ${state.state_name}`
          );
          continue; // Omitir si no tiene fipsCode
        }

        // Buscar si ya existe el condado con county_fips y stateId
        const storedCounty = await prisma.county.findFirst({
          where: {
            county_fips: county.county_fips,
            stateId: storedState.id,
          },
        });

        if (!storedCounty) {
          // Insertar el condado si no existe
          await prisma.county.create({
            data: {
              name: county.county_name,
              county_fips: county.county_fips,
              stateId: storedState.id,
            },
          });
        }

        for (const city of county.cities) {
          console.log(`Procesando ciudad: ${city.city}`);
          console.log(storedState.id + " " + storedCounty.id);

          try {
            const existingCity = await prisma.city.findFirst({
              where: {
                city_ascii: city.city_ascii,
                stateId: storedState.id,
                countyId: storedCounty.id,
              },
            });

            if (existingCity) {
              console.log("Ciudad ya existe");
              continue;
            } else {
              console.log("Ciudad no existe");
              // Crear la ciudad si no existe
              await prisma.city.create({
                data: {
                  name: city.city,
                  city_ascii: city.city_ascii,
                  stateId: storedState.id, // Relacionar con el estado
                  countyId: storedCounty.id, // Relacionar con el condado
                  lat: parseFloat(city.lat), // Convertir la latitud
                  lng: parseFloat(city.lng), // Convertir la longitud
                  zip: city.zips,
                  timezone: city.timezone,
                  ranking: parseInt(city.ranking, 10),
                  population: parseInt(city.population, 10),
                  uniqueCityIdentifier: `${city.city_ascii}_${storedState.id}_${storedCounty.id}`,
                },
              });
            }
          } catch (err) {
            // Si no se puede crear la ciudad, registrar en el archivo de log
            logStream.write(
              `No se pudo crear la ciudad: ${city.city}, Estado: ${state.state_name}, Condado: ${county.county_name}\n`
            );
            console.log(`No se pudo crear la ciudad: ${city.city}`);
          }
        }
      }
    }

    res.status(200).json({ message: "Datos almacenados con éxito" });
  } catch (error) {
    console.error("Error al almacenar los datos:", error);
    res.status(500).json({ message: "Error al almacenar los datos", error });
  } finally {
    // Cerrar el stream de log al finalizar
    logStream.end();
  }
};
// Función para procesar el archivo CSV
const processCSV = (filePath, res) => {
  const statesData = {}; // Estructura de almacenamiento temporal

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      const {
        state_name,
        state_id,
        county_name,
        county_fips,
        city,
        city_ascii,
        lat,
        lng,
        zips,
        population,
        ranking,
        timezone,
      } = row;

      // Si el estado no existe, crearlo
      if (!statesData[state_id]) {
        statesData[state_id] = {
          state_name,
          state_id,
          counties: {},
        };
      }

      // Si el condado no existe dentro del estado, crearlo
      if (!statesData[state_id].counties[county_fips]) {
        statesData[state_id].counties[county_fips] = {
          county_name,
          county_fips,
          cities: [],
        };
      }

      // Agregar la ciudad al condado
      statesData[state_id].counties[county_fips].cities.push({
        city,
        city_ascii,
        lat,
        lng,
        zips,
        population,
        ranking,
        timezone,
      });
    })
    .on("end", () => {
      console.log("Archivo CSV procesado correctamente");
      storeData(
        Object.values(statesData).map((state) => ({
          ...state,
          counties: Object.values(state.counties),
        })),
        res
      );
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

const listStates = async (req, res) => {
  try {
    // Obtener todos los estados de la base de datos
    const states = await prisma.state.findMany();

    // Devolver los estados en la respuesta
    res.status(200).json({
      message: "Lista de estados obtenida con éxito",
      data: states,
    });
  } catch (error) {
    console.error("Error al obtener los estados:", error);
    res.status(500).json({
      message: "Error al obtener los estados",
      error,
    });
  }
};

const listCountiesByState = async (req, res) => {
  const { stateId } = req.params;
  try {
    // Buscar los condados relacionados al estado
    const counties = await prisma.county.findMany({
      where: {
        stateId: stateId, // Filtrar por el ID del estado
      },
    });

    if (counties.length === 0) {
      return res.status(404).json({
        message: `No se encontraron condados para el estado con ID: ${stateId}`,
      });
    }

    // Devolver los condados
    res.status(200).json({
      message: `Lista de condados para el estado con ID: ${stateId}`,
      data: counties,
    });
  } catch (error) {
    console.error("Error al obtener los condados:", error);
    res.status(500).json({
      message: "Error al obtener los condados",
      error,
    });
  }
};


const findCityByName = async (req, res) => {
  const { cityName } = req.params; // Obtener el nombre de la ciudad desde los parámetros de la ruta

  try {
    const cities = await prisma.city.findMany({
      where: {
        name: {
          contains: cityName, // Filtra las ciudades cuyo nombre contenga el valor de `cityName`
          mode: "insensitive", // Ignorar mayúsculas y minúsculas en la búsqueda
        },
      },
    });

    if (cities.length === 0) {
      return res.status(404).json({
        message: `No se encontraron ciudades con el nombre: ${cityName}`,
      });
    }

    // Devolver las ciudades encontradas
    res.status(200).json({
      message: `Ciudades encontradas con el nombre: ${cityName}`,
      data: cities,
    });
  } catch (error) {
    console.error("Error al buscar la ciudad por nombre:", error);
    res.status(500).json({
      message: "Error al buscar la ciudad",
      error,
    });
  }
};

const getCityById = async (req, res) => {
  const { id } = req.params; // ID de la ciudad a consultar

  try {
    // Consultar la ciudad junto con AdRates y Tour
    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        AdRates: true, // Incluir la información relacionada con AdRates
        Tour: true, // Incluir la información relacionada con Tour
      },
    });

    // Si la ciudad no existe, devolver un error 404
    if (!city) {
      return res.status(404).json({ message: "Ciudad no encontrada." });
    }

    // Devolver la información de la ciudad junto con AdRates y Tour
    res.status(200).json({ city });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "No se pudo obtener la información de la ciudad." });
  }
};

const getCitiesByCounty = async (req, res) => {
  const { countyId } = req.params;
  try {
    const cities = await prisma.city.findMany({
      where: {
        countyId: countyId, // Filtrar por el ID del condado
      },
      include: {
        county: {
          select: {
            name: true,
            state: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (cities.length === 0) {
      return res.status(404).json({
        message: `No se encontraron ciudades para el condado con ID: ${countyId}`,
      });
    }

    // Formatear los datos para incluir county y state
    const formattedCities = cities.map((city) => ({
      ...city,
      county: city.county.name,
      state: city.county.state.name,
    }));

    // Devolver las ciudades con county y state
    res.status(200).json({
      message: `Lista de ciudades para el condado con ID: ${countyId}`,
      data: formattedCities,
    });
  } catch (error) {
    console.error("Error al obtener las ciudades:", error);
    res.status(500).json({
      message: "Error al obtener las ciudades",
      error,
    });
  }
};

const listAllCities = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query; // Valores predeterminados si no se proporcionan
  const skip = (page - 1) * pageSize; // Calcular el inicio del rango

  try {
    const cities = await prisma.city.findMany({
      skip,
      take: parseInt(pageSize), // Limitamos la cantidad de ciudades
      include: {
        county: {
          select: {
            name: true,
            state: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc' // Ordenar por las más recientes (opcional)
      }
    });

    const totalCities = await prisma.city.count(); // Obtener el número total de ciudades para calcular el número de páginas

    const formattedCities = cities.map((city) => ({
      id: city.id,
      name: city.name,
      city_ascii: city.city_ascii,
      timezone: city.timezone,
      county: city.county.name,
      state: city.county.state.name,
    }));

    res.status(200).json({
      message: "Lista de ciudades obtenida con éxito",
      data: formattedCities,
      pageInfo: {
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        totalItems: totalCities,
        totalPages: Math.ceil(totalCities / pageSize),
      },
    });
  } catch (error) {
    console.error("Error al obtener las ciudades:", error);
    res.status(500).json({ message: "Error al obtener las ciudades", error });
  }
};

module.exports = {
  uploadAndProcessCSV,
  listStates,
  listCountiesByState,
  getCitiesByCounty,
  findCityByName,
  getCityById,
  listAllCities
};
