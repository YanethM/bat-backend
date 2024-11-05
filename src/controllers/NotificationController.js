const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createNotification = async (req, res) => {
  const { title, message, senderId, recipients } = req.body;
  console.log(req.body);

  // Verificar que los campos obligatorios están presentes
  if (
    !title ||
    !message ||
    !senderId ||
    !recipients ||
    recipients.length === 0
  ) {
    return res.status(400).json({
      message: "Todos los campos obligatorios deben ser proporcionados.",
    });
  }

  try {
    // Crear la notificación
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        senderId,
      },
    });
    console.log(notification);

    // Crear las relaciones con los destinatarios
    const recipientData = recipients.map((recipientId) => ({
      notificationId: notification.id,
      userId: recipientId, // ID del destinatario
      read: false, // Marcar como no leída por defecto
    }));
    console.log(recipientData);

    await prisma.recipient.createMany({
      data: recipientData,
    });

    res.status(201).json({ notification, recipients: recipientData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "No se pudo crear la notificación." });
  }
};

const getNotificationsForUser = async (req, res) => {
  const { userId } = req.params;
  console.log(req.params);

  try {
    const notifications = await prisma.recipient.findMany({
      where: { userId },
      include: {
        notification: {
          include: {
            sender: true, // Incluye los detalles completos del remitente
            recipients: {
              include: {
                recipient: true, // Cambia 'user' por 'recipient'
              },
            },
          },
        },
      },
    });

    res.status(200).json({ notifications });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "No se pudieron obtener las notificaciones." });
  }
};

const getNotificationsSender = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await prisma.notification.findMany({
      where: { senderId: userId },
      include: {
        recipients: {
          include: {
            recipient: true, // Incluye detalles completos del usuario destinatario
          },
        },
      },
    });

    res.status(200).json({ notifications });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "No se pudieron obtener las notificaciones." });
  }
};

const markNotificationAsRead = async (req, res) => {
  const { notificationId, userId } = req.params;
  console.log(req.params);

  try {
    const updatedRecipient = await prisma.recipient.updateMany({
      where: {
        notificationId,
        userId,
      },
      data: {
        read: true, // Marcar como leída
      },
    });
    console.log(updatedRecipient);

    if (updatedRecipient.count === 0) {
      return res
        .status(404)
        .json({ message: "Notificación no encontrada o ya leída." });
    }

    res.status(200).json({ message: "Notificación marcada como leída." });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "No se pudo marcar la notificación como leída." });
  }
};

const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  try {
    // Eliminar los destinatarios asociados a la notificación
    await prisma.recipient.deleteMany({
      where: {
        notificationId,
      },
    });

    // Eliminar la notificación
    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    res.status(200).json({ message: "Notificación eliminada." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "No se pudo eliminar la notificación." });
  }
};


module.exports = {
  createNotification,
  getNotificationsForUser,
  markNotificationAsRead,
  deleteNotification,
  getNotificationsSender,
};
